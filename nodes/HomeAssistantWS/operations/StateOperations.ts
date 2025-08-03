import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from "n8n-workflow";
import { HomeAssistant } from "../HomeAssistant";
import { State } from "../model/State";
import { mapResults } from "../utils";



export const stateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		options: [
			{
				name: 'List',
				value: 'list',
				action: 'Return a list of states',
			}
		],
		default: 'list',
		displayOptions: {
			show: {
				resource: [
					'state'
				],
			},
		},
		noDataExpression: true,
	},

]
export const stateFields: INodeProperties[] = [
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [
					'state',
				],
			},
		},
		options: [
			{
				displayName: 'Entity Type Name or ID',
				name: 'entityType',
				type: 'resourceLocator',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
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
					},
					{
						displayName: 'By Name',
						name: 'name',
						type: 'string',
					},
				],
			},

			{
				displayName: 'Entity Name or ID',
				name: 'entityId',
				type: 'resourceLocator',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				default: { mode: 'list', value: '' },
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchable: true,
							searchListMethod: 'search_entity_options',
						},
					},
					{
						displayName: 'By Name',
						name: 'name',
						type: 'string',
					},
				],
			},

			{
				displayName: 'Area Name or ID',
				name: 'areaId',
				type: 'resourceLocator',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
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
					},
					{
						displayName: 'By Name',
						name: 'name',
						type: 'string',
					},
				],
			},

			{
				displayName: 'Resolve Entities',
				name: 'resolveEntities',
				type: 'boolean',
				default: false,
			},
		],
	},
]

function filterStates(states: State[], t: IExecuteFunctions, i: number, resolveEntities: boolean): State[] {
	const entityType = t.getNodeParameter('additionalFields.entityType', i, '', {extractValue: true}) as string
	const areaId = t.getNodeParameter('additionalFields.areaId', i, '', {extractValue: true}) as string
	const entityId = t.getNodeParameter('additionalFields.entityId', i, '', {extractValue: true}) as string

	return states.filter(state => {

		const inArea = !areaId || areaId.trim() === '' || state.entity_id.startsWith(areaId) || state.entity?.area_id == areaId || state.entity?.device?.area_id == areaId
		const inType = !entityType || entityType.trim() === '' || state.entity_id.startsWith(entityType)
		const inEntity = !entityId || entityId.trim() === '' || state.entity_id === entityId


		if(!resolveEntities){
			// to make sure we adhere to what the user has requested, we need to remove the entity from the state if it should not be resolved
			// because of the optimization earlier we resolve the entities only once for all states, so we need to remove it again if it should not be resolved
				state.entity = undefined
		}

		return inArea && inType && inEntity
	})
}

async function getStates(t: IExecuteFunctions, assistant: HomeAssistant, items: IDataObject[]): Promise<INodeExecutionData[][]> {

	// check if any of the items have the resolveEntities flag set to true. If so, we only want to fetch them once
	let resolveEntities = false
	let fetchEntities = false
	for (let i = 0; i < items.length; i++) {
		const additionalFields = t.getNodeParameter('additionalFields', i, {});

		// if the user requested to resolve the entiies, or if wee need to filter by area, we fetch the entities as well
		if (additionalFields.resolveEntities) {
			fetchEntities = true
			resolveEntities = true
			break
		}

		if (additionalFields.areaId) {
			fetchEntities = true
			break
		}
	}

	return assistant.get_states(fetchEntities).then(states => {
		const results: IDataObject[][] = [];
		for (let i = 0; i < items.length; i++) {


			const filteredStates = filterStates(states, t,i, resolveEntities)
			results.push(filteredStates as any[]); // no need to get areas for each item, its all the same
		}

		return mapResults(t, items, results);
	});


}

export function executeStateOperation(t: IExecuteFunctions, assistant: HomeAssistant, items: IDataObject[]): Promise<INodeExecutionData[][]> {
	const operation = t.getNodeParameter("operation", 0) as string


	switch (operation) {
		case 'list':
			return getStates(t, assistant, items)
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
