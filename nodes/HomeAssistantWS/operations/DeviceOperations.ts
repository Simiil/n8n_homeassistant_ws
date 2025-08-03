import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from "n8n-workflow"
import { HomeAssistant } from "../HomeAssistant";
import { mapResults } from "../utils";

export const deviceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		options: [
			{
				name: 'List',
				value: 'list',
				action: 'Return a list of devices',
			},
		],
		default: 'list',
		displayOptions: {
			show: {
				resource: [
					'device' //, 'category', 'area', 'entity',
				],
			},
		},
		noDataExpression: true,
	},

]
export const deviceFields: INodeProperties[] = [
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [
					'device',
				],
				operation: [
					'list',
				],
			},
		},
		options: [

			{
				displayName: 'Area Name or ID',
				name: 'areaId',
				type: 'resourceLocator',
				description: 'The Area to filter by',
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
		],
	},
]


export async function executeDeviceOperation(t: IExecuteFunctions, assistant: HomeAssistant, items: IDataObject[]): Promise<INodeExecutionData[][]> {

	const operation = t.getNodeParameter("operation", 0) as string

	const results: IDataObject[][] = [];


	switch (operation) {
		case 'list':
			for (let i = 0; i < items.length; i++) {
				const areaId = t.getNodeParameter('additionalFields.areaId', i, '', {extractValue: true}) as string;
				const data = await assistant.get_devices_by_area(areaId);
				results.push(data as any[]);
			}
			break;
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return mapResults(t, items, results);
}
