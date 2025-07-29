

import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';
import { HomeAssistant } from './commands';
import { load_area_options, load_component_options } from './loadOptions';




export class HomeAssistantWs implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Home Assistant WS',
		name: 'homeAssistantWs',
		icon: 'file:homeAssistantWs.svg',
		group: ['transform'],
		version: 1,
		description: 'Node to interact with Home Assistant through the WebSocket API',
		defaults: {
			name: 'Home Assistant WS',
		},
		usableAsTool: true,
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'homeAssistantWsApi',
				required: true,
				testedBy: 'homeAssistantWsApiTest'
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
						{
							name: 'Area',
							value: 'area',
						},
						{
							name: 'Category',
							value: 'category',
						},
						{
							name: 'Device',
							value: 'device',
						},
						{
							name: 'Entity',
							value: 'entity',
						},
						{
							name: 'State',
							value: 'state',
						},


				],
				default: 'area',
				noDataExpression: true,
				required: true,
				description: 'The resource to interact with',
			},
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
							'area', 'category', 'device', 'entity',
						],
					},
				},
				noDataExpression: true,
			},

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
							'state',
						],
					},
				},
				noDataExpression: true,
			},

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
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: [
							'entity',
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
		],

	}

	methods = {
		loadOptions: {
			load_component_options,
			load_area_options
		}
	}


	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// const items = this.getInputData();
		const resource = this.getNodeParameter('resource', 0);

		// const operation = this.getNodeParameter('operation', 0);

			// open websocket with socket.io

		const cred = await this.getCredentials('homeAssistantWsApi');
		const assistant = new HomeAssistant(cred.host, cred.apiKey)

		let resultPromise: Promise<any[]> | undefined;
		const additionalFields = this.getNodeParameter('additionalFields', 0, {});

		switch (resource) {
			case 'area':
				resultPromise = assistant.get_areas();
				break;
			case 'entity':
				const entityType = additionalFields.entityType
				const areaId = additionalFields.areaId
				resultPromise = assistant.get_entities(entityType as string, areaId as string);
				break;
			case 'device':
				const deviceAreaId = additionalFields.areaId
				resultPromise = assistant.get_devices(deviceAreaId as string);
				break;
			case 'category':
				resultPromise = assistant.get_categories();
				break;
			case 'state':
				// operation
				const operation = this.getNodeParameter('operation', 0);
				switch (operation) {
					case 'list':
						resultPromise = assistant.get_states();
						break;
					case 'set':
						// resultPromise = assistant.set_state(stateEntityId as string, stateState as string);
						break;
				}
				break;
		}

		if(!resultPromise) {
			throw Promise.reject(new Error('Invalid resource'));
		}


		return resultPromise.then(items=> [this.helpers.returnJsonArray(items)]);
	}
}
