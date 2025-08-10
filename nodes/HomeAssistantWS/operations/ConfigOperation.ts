import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from "n8n-workflow"
import { HomeAssistant } from "../HomeAssistant";
import { mapResults } from "../utils";

export const configOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Return the configuration',
			},
		],
		default: 'get',
		displayOptions: {
			show: {
				resource: [
					'config'
				],
			},
		},
		noDataExpression: true,
	},

]
export const configFields: INodeProperties[] = [
]



export async function executeConfigOperations(t: IExecuteFunctions, assistant: HomeAssistant, items: IDataObject[]): Promise<INodeExecutionData[][]> {

	const results: IDataObject[][] = [];
	const operation = t.getNodeParameter('operation', 0); // all operations are the same

	switch (operation) {
		case 'get': {
			for (let i = 0; i < items.length; i++) {
				const config = await assistant.get_system_config();

				results.push([config as any]);
			}
			break
		}
		default:
			throw new Error('Invalid operation');
	}

	return mapResults(t, items, results);
}
