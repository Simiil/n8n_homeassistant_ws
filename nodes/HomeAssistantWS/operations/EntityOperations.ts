import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from "n8n-workflow"
import { HomeAssistant } from "../HomeAssistant";
import { mapResults } from "../utils";

export const entityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		options: [
			{
				name: 'List',
				value: 'list',
				action: 'Return a list of entities',
			},
		],
		default: 'list',
		displayOptions: {
			show: {
				resource: [
					'entity'
				],
			},
		},
		noDataExpression: true,
	},

]
export const entityFields: INodeProperties[] = [
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [
					'entity',
				],
			},
		},
		options: [
			{
				displayName: 'Entity Type Name or ID',
				name: 'entityType',
				type: 'options',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				default: '',
				typeOptions: {
					loadOptionsMethod: 'load_component_options',
				},
			},

			{
				displayName: 'Area Name or ID',
				name: 'areaId',
				type: 'options',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				default: '',
				typeOptions: {
					loadOptionsMethod: 'load_area_options',
				},
			},


			{
				displayName: 'Device Name or ID',
				name: 'deviceId',
				type: 'options',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				default: '',
				typeOptions: {
					loadOptionsMethod: 'load_device_options',
				},
			},
		],
	},
]


export async function executeEntityOperation(t: IExecuteFunctions, assistant: HomeAssistant, items: IDataObject[]): Promise<INodeExecutionData[][]> {

	const operation = t.getNodeParameter("operation", 0) as string

	const results: IDataObject[][] = [];


	switch (operation) {
		case 'list':
			for (let i = 0; i < items.length; i++) {
				const additionalFields = t.getNodeParameter('additionalFields', i, {});
				const areaId = additionalFields.areaId as string ?? ''
				const entityType = additionalFields.entityType as string ?? ''
				const deviceId = additionalFields.deviceId as string ?? ''
				const data = await assistant.get_entities(entityType, areaId, deviceId);
				results.push(data as any[]);
			}
			break;
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return mapResults(t, items, results);
}
