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
				displayName: 'Entity Type',
				name: 'entityType',
				type: 'resourceLocator',

				description: 'The Entity Type to filter by',
				default: { mode: 'list', value: '' },
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchable: true,
							searchListMethod: 'search_component_options',
						},
					},{
						displayName: 'By Name',
						name: 'name',
						type: 'string',
					},

				]

			},

			{
				displayName: 'Area ID',
				name: 'areaId',
				type: 'resourceLocator',
				description: 'The Area ID to filter by',
				default: { mode: 'list', value: '' },
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchable: true,
							searchListMethod: 'search_area_options',
						},
					},{
						displayName: 'By Name',
						name: 'name',
						type: 'string',
					},
				]
			},


			{
				displayName: 'Device ID',
				name: 'deviceId',
				type: 'resourceLocator',
				description: 'The Device ID to filter by',
				default: { mode: 'list', value: '' },
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchable: true,
							searchListMethod: 'search_device_options',
						},
					},{
						displayName: 'By Name',
						name: 'name',
						type: 'string',
					},
				]
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
				const areaId = t.getNodeParameter('additionalFields.areaId', i, '', {extractValue: true,}) as string
				const entityType = t.getNodeParameter('additionalFields.entityType', i, '', {extractValue: true,}) as string
				const deviceId = t.getNodeParameter('additionalFields.deviceId', i, '', {extractValue: true,}) as string

				const data = await assistant.get_entities(entityType, areaId, deviceId);
				results.push(data as any[]);
			}
			break;
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return mapResults(t, items, results);
}
