import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from "n8n-workflow";
import { HomeAssistant } from "../HomeAssistant";
import { mapResults } from "../utils";

export const areaOperations: INodeProperties[] = [
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
					'area' //, 'category', 'device', 'entity',
				],
			},
		},
		noDataExpression: true,
	},

]
export const areaFields: INodeProperties[] = []

export async function executeAreaOperation(t: IExecuteFunctions, assistant: HomeAssistant, items: IDataObject[]): Promise<INodeExecutionData[][]> {
	const results: IDataObject[][] = [];
	const operation = t.getNodeParameter('operation', 0); // all operations are the same


	console.log('operation', operation);

	switch (operation) {
		case 'list': {
			const areas = await assistant.get_areas() as any[];
			for (let i = 0; i < items.length; i++) {
				results.push(areas); // no need to get areas for each item, its all the same
			}
			break
		}
		default:
			throw new Error('Invalid operation');
	}


	return mapResults(t, items, results);
}
