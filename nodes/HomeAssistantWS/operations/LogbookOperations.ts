import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from "n8n-workflow";
import { HomeAssistant } from "../HomeAssistant";
import { mapResults } from "../utils";


export const logbookOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		options: [
			{
				name: 'Read',
				value: 'read',
				action: 'Read the logbook',
			},
		],
		default: 'read',
		displayOptions: {
			show: {
				resource: [
					'logbook'
				],
			},
		},
		noDataExpression: true,
	},
]

export const logbookFields: INodeProperties[] = [
	// start time
	{
		displayName: 'Start Time',
		name: 'startTime',
		type: 'dateTime',
		default: '',
		displayOptions: {
			show: {
				resource: [
					'logbook'
				],
			},
		},
	},
	// additional fields
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [
					'logbook'
				],
			},
		},
		options: [
			// end time
			{
				displayName: 'End Time',
				name: 'endTime',
				type: 'dateTime',
				default: '',
			},
			// device ids
			{
				displayName: 'Device Names or IDs',
				name: 'deviceIds',
				type: 'multiOptions',
				description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				default: [],
				typeOptions: {
					loadOptionsMethod: 'load_device_options',
				},
			},
			// entity ids
			{
				displayName: 'Entity Names or IDs',
				name: 'entityIds',
				type: 'multiOptions',
				description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				default: [],
				typeOptions: {
					loadOptionsMethod: 'load_entity_options',
				},
			},
			// context id
			{
				displayName: 'Context ID',
				name: 'contextId',
				type: 'string',
				default: '',
			},
		],
	}
]


export async function executeLogbookOperation(t: IExecuteFunctions, assistant: HomeAssistant, items: IDataObject[]): Promise<INodeExecutionData[][]> {

	const operation = t.getNodeParameter("operation", 0) as string // all operations are the same

	const results: IDataObject[][] = [];

	switch (operation) {
		case 'read': {
			for (let i = 0; i < items.length; i++) {
				const startTime = t.getNodeParameter("startTime", i);
				const endTime = t.getNodeParameter("additionalFields.endTime", i, null);
				const deviceIds = t.getNodeParameter("additionalFields.deviceIds", i, null);
				const entityIds = t.getNodeParameter("additionalFields.entityIds", i, null);
				const contextId = t.getNodeParameter("additionalFields.contextId", i, null);

				const data = await assistant.get_logbook(startTime, endTime, deviceIds, entityIds, contextId)
				results.push(data);
			}
			break;
		}
	}

	return mapResults(t, items, results);
}
