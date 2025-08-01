import { IDataObject, IExecuteFunctions, INodeProperties } from "n8n-workflow"
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
				action: 'Return a list of items',
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
				type: 'options',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				default: '',
				typeOptions: {
					loadOptionsMethod: 'load_area_options',
				},
			},
		],
	},
]


export async function executeDeviceOperation(t: IExecuteFunctions, assistant: HomeAssistant, items: IDataObject[]): Promise<any[]> {

	const operation = t.getNodeParameter("operation", 0) as string

	const results: IDataObject[][] = [];


	switch (operation) {
		case 'list':
			for (let i = 0; i < items.length; i++) {
				const additionalFields = t.getNodeParameter('additionalFields', i, {});
				const areaId = additionalFields.areaId as string ?? ''
				const data = await assistant.get_devices_by_area(areaId);
				results.push(data as any[]);
			}
			break;
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return mapResults(t, items, results);
}
