//config/category_registry/list

import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from "n8n-workflow";
import { HomeAssistant } from "../HomeAssistant";
import { mapResults } from "../utils";


export const categoryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		options: [
			{
				name: 'List',
				value: 'list',
				action: 'Return a list of categories',
			},
		],
		default: 'list',
		displayOptions: {
			show: {
				resource: [
					'category' //, 'category', 'device', 'entity',
				],
			},
		},
		noDataExpression: true,
	},

]
export const categoryFields: INodeProperties[] = [
				{
				displayName: 'Category Scope',
				name: 'categoryScope',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: [
							'category',
						],
					},
				},
				noDataExpression: true,
			},
]

export async function executeCategoryOperations(t: IExecuteFunctions, assistant: HomeAssistant, items: IDataObject[]): Promise<INodeExecutionData[][]> {

	const results: IDataObject[][] = [];
	const operation = t.getNodeParameter('operation', 0); // all operations are the same


	console.log('operation', operation);

	switch (operation) {
		case 'list': {
			for (let i = 0; i < items.length; i++) {
				const scopeParam = t.getNodeParameter("categoryScope", 0)
				const categories = await assistant.get_categories(scopeParam as string);

				results.push(categories);
			}
			break
		}
		default:
			throw new Error('Invalid operation');
	}

	return mapResults(t, items, results);
}
