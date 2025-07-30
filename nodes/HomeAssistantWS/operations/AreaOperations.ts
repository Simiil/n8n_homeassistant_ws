import { IDataObject, IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { HomeAssistant } from "../HomeAssistant";
import { Area } from "../model/Area";

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

export function executeAreaOperation(t: IExecuteFunctions, assistant: HomeAssistant, items: IDataObject[]): Promise<Area[]> {
	return assistant.get_areas();
}
