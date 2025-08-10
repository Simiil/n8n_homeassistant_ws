import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from "n8n-workflow";
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
				action: 'Return a list of service actions',
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
		displayName: 'Service Domain ID',
		name: 'serviceDomainId',
		type: 'resourceLocator',
		description: 'The ID of the service domain to execute',
		default: { mode: 'list', value: '' },
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchable: true,
					searchListMethod: 'search_service_domain_options',
				},
			},
			{
				displayName: 'By Name',
				name: 'name',
				type: 'string',
			},
		],
		displayOptions: {
			show: {
				resource: [
					'serviceAction'
				],
				operation: [
					'execute', 'list'
				],
			},
		},
	},
	{
		displayName: 'Service ID',
		name: 'serviceId',
		type: 'resourceLocator',
		description: 'The ID of the service to execute',
		default: { mode: 'list', value: '' },
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchable: true,
					searchListMethod: 'search_service_options',
				},
			},
			{
				displayName: 'By Name',
				name: 'name',
				type: 'string',
			},
		],
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
		displayName: 'Service Attribute Fields',
		name: 'serviceAttributeFields',
		type: 'resourceMapper',
		default: {
			mappingMode: 'defineBelow',
			value: null,
		},
		noDataExpression: true,
		required: true,
		typeOptions: {
			loadOptionsDependsOn: ['serviceDomainId.value', 'serviceId.value'],
			resourceMapper: {
				resourceMapperMethod: 'getMappingColumns',
				mode: 'add',
				fieldWords: {
					singular: 'field',
					plural: 'fields',
				},
				addAllFields: false,
				multiKeyMatch: true,
			},
		},
		displayOptions: {
			show: {
				resource: ['serviceAction'],
				operation: ['execute'],
			},
		},
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

]

export async function executeServiceActionOperation(t: IExecuteFunctions, assistant: HomeAssistant, items: IDataObject[]): Promise<INodeExecutionData[][]> {
	const operation = t.getNodeParameter("operation", 0) as string // all operations are the same

	const results: IDataObject[][] = [];

	switch (operation) {
		case 'list': {
			const data = await assistant.get_service_actions()

			for (let i = 0; i < items.length; i++) {
				results.push(data as any[]);
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
	const serviceDomain = t.getNodeParameter("serviceDomainId", item, '', {extractValue: true}) as string;
	const serviceName = t.getNodeParameter("serviceId", item, '', {extractValue: true}) as string;
	const serviceAttributeFields = (t.getNodeParameter("serviceAttributeFields", item) as IDataObject)?.value as IDataObject;

	const serviceData: IDataObject = {};
	for(let f in serviceAttributeFields){
			serviceData[f] = serviceAttributeFields[f];
	}


	const response = additionalFields.response as boolean;

	return await assistant.call_service(serviceDomain, serviceName, serviceData, response);
}

