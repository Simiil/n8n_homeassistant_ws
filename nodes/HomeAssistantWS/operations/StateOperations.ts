import { IDataObject, IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { HomeAssistant } from "../HomeAssistant";
import { State } from "../model/State";



export const stateOperations: INodeProperties[] = [
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
			{
				name: 'Set',
				value: 'set',
				action: 'Set a state',
			},
		],
		default: 'list',
		displayOptions: {
			show: {
				resource: [
					'state' //, 'category', 'device', 'entity',
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
				type: 'options',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				default: '',
				typeOptions: {
					loadOptionsMethod: 'load_component_options',
				},
			},

			{
				displayName: 'Entity Name or ID',
				name: 'entityId',
				type: 'options',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				default: '',
				typeOptions: {
					loadOptionsMethod: 'load_entity_options',
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
		],
	},
]

function filterStates(states: State[], additionalFields: any): State[] {
	const entityType = additionalFields.entityType
	const areaId = additionalFields.areaId
	const entityId = additionalFields.entityId

	return states.filter(state => {

		const inArea = !areaId || areaId.trim() === '' || state.entity_id.startsWith(areaId)
		const inType = !entityType || entityType.trim() === '' || state.entity_id.startsWith(entityType)
		const inEntity = !entityId || entityId.trim() === '' || state.entity_id === entityId

		return inArea && inType && inEntity
	})
}

export function executeStateOperation(t: IExecuteFunctions, assistant: HomeAssistant, items: IDataObject[]): Promise<any[]> {
	const operation = t.getNodeParameter("operation", 0) as string
	const additionalFields = t.getNodeParameter('additionalFields', 0, {});

	switch (operation) {
		case 'list':
			return assistant.get_states().then(states => filterStates(states, additionalFields));
		case 'set':
			// const stateEntityId = t.getNodeParameter("stateEntityId", 0) as string
			// const stateState = t.getNodeParameter("stateState", 0) as string
			// return assistant.set_state(stateEntityId, stateState);
			throw new Error(`Soon`);
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
