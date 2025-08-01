import { IDataObject, IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { HomeAssistant } from "../HomeAssistant";
import { mapResults } from "../utils";



export const serviceActionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		options: [
			{
				name: 'List',
				value: 'list',
				action: 'Return a list of items',
			},
			{
				name: 'Execute',
				value: 'execute',
				action: 'Execute a service action',
			},
		],
		default: 'list',
		displayOptions: {
			show: {
				resource: [
					'serviceAction'
				],
			},
		},
		noDataExpression: true,
	},
	{
		displayName: 'Service Domain Name or ID',
		name: 'serviceDomain',
		type: 'options',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		default: '',
		typeOptions: {
			loadOptionsMethod: 'load_service_domain_options',
		},
		displayOptions: {
			show: {
				resource: [
					'serviceAction'
				],
				operation: [
					'execute'
				],
			},
		},
	},
	{
		displayName: 'Service Name or ID',
		name: 'serviceName',
		type: 'options',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		default: '',
		typeOptions: {
			loadOptionsDependsOn: [
				'serviceDomain'
			],
			loadOptionsMethod: 'load_service_options',
		},

		displayOptions: {
			show: {
				resource: [
					'serviceAction'
				],
				operation: [
					'execute'
				],
			},
		},
	},
	{
		displayName: 'Service Attributes',
		name: 'serviceAttributes',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add Attribute',
		default: {},
		displayOptions: {
			show: {
				resource: ['serviceAction'],
				operation: ['execute'],
			},
		},
		options: [
			{
				name: 'attributes',
				displayName: 'Attributes',
				values: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Name of the field',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Value of the field',
					},
				],
			},
		],
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [
					'serviceAction',
				],
				operation: [
					'execute',
				],
			},
		},
		options: [
			{
				displayName: 'Response',
				name: 'response',
				type: 'boolean',
				description: 'Whether the service call should return a response',
				default: false,
			},
		],
	},

]
export const serviceActionFields: INodeProperties[] = [
	// {
	// 	displayName: 'Additional Fields',
	// 	name: 'additionalFields',
	// 	type: 'collection',
	// 	placeholder: 'Add Field',
	// 	default: {},
	// 	displayOptions: {
	// 		show: {
	// 			resource: [
	// 				'serviceAction',
	// 			],
	// 		},
	// 	},
	// 	options: [
	// 		{
	// 			displayName: 'Service Name',
	// 			name: 'serviceName',
	// 			type: 'options',
	// 			description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	// 			default: '',
	// 			typeOptions: {
	// 				loadOptionsMethod: 'load_component_options',
	// 			},
	// 		},

	// 		{
	// 			displayName: 'Entity Name or ID',
	// 			name: 'entityId',
	// 			type: 'options',
	// 			description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	// 			default: '',
	// 			typeOptions: {
	// 				loadOptionsMethod: 'load_entity_options',
	// 			},
	// 		},

	// 		{
	// 			displayName: 'Area Name or ID',
	// 			name: 'areaId',
	// 			type: 'options',
	// 			description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	// 			default: '',
	// 			typeOptions: {
	// 				loadOptionsMethod: 'load_area_options',
	// 			},
	// 		},
	// 	],
	// },
]

export async function executeServiceActionOperation(t: IExecuteFunctions, assistant: HomeAssistant, items: IDataObject[]): Promise<any[]> {
	const operation = t.getNodeParameter("operation", 0) as string // all operations are the same

	const results: IDataObject[][] = [];

	switch (operation) {
		case 'list': {
			const data = await assistant.get_service_actions()

			for (let i = 0; i < items.length; i++) {
				results.push(data);
			}
			break;
		}
		case 'execute': {
			for (let i = 0; i < items.length; i++) {
				const data = await executeServerAction(t, assistant, i);
				results.push([data]);
			}
			break;
		}
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return mapResults(t, items, results);
}
async function executeServerAction(t: IExecuteFunctions, assistant: HomeAssistant, item: number): Promise<any> {
	const additionalFields = t.getNodeParameter('additionalFields', item, {});
	const serviceDomain = t.getNodeParameter("serviceDomain", item) as string;
	const serviceName = t.getNodeParameter("serviceName", item) as string;
	const serviceAttributes = t.getNodeParameter("serviceAttributes", item, {}) as {
		attributes: IDataObject[];
	};

	const serviceData: IDataObject = {};
	serviceAttributes.attributes.map(attribute => {
		serviceData[attribute.name as string] = attribute.value;
	});

	const response = additionalFields.response as boolean;

	return await assistant.call_service(serviceDomain, serviceName, serviceData, response);
}

