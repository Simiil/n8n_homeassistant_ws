//config/category_registry/list

import { IDataObject, IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { HomeAssistant } from "../HomeAssistant";


export const categoryOperations: INodeProperties[] = [
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

export function executeCategoryOperations(t: IExecuteFunctions, assistant: HomeAssistant, items: IDataObject[]): Promise<any[]> {
const scopeParam = t.getNodeParameter("categoryScope", 0)
	return assistant.get_categories(scopeParam as string);
}
