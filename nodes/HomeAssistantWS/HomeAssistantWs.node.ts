

import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';
import { HomeAssistant } from './HomeAssistant';
import { load_area_options, load_component_options, load_device_options, load_entity_options, load_service_domain_options, load_service_options } from './loadOptions';
import { areaFields, areaOperations, executeAreaOperation } from './operations/AreaOperations';
import { categoryFields, categoryOperations, executeCategoryOperations } from './operations/CategoryOperations';
import { deviceFields, deviceOperations, executeDeviceOperation } from './operations/DeviceOperations';
import { entityFields, entityOperations, executeEntityOperation } from './operations/EntityOperations';
import { executeStateOperation, stateFields, stateOperations } from './operations/StateOperations';
import { executeServiceActionOperation, serviceActionFields, serviceActionOperations } from './operations/ServiceAction';
import { executeLogbookOperation, logbookFields, logbookOperations } from './operations/LogbookOperations';




export class HomeAssistantWs implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Home Assistant WS',
		name: 'homeAssistantWs',
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
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
						name: 'Logbook',
						value: 'logbook',
					},
					{
						name: 'Service Action',
						value: 'serviceAction',
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

			...areaOperations,
			...areaFields,

			...categoryOperations,
			...categoryFields,

			...deviceOperations,
			...deviceFields,

			...entityOperations,
			...entityFields,

			...stateOperations,
			...stateFields,

			...serviceActionOperations,
			...serviceActionFields,

			...logbookOperations,
			...logbookFields,


			// TODO: config
			// event
			// history
			// log
			// service
			// template


			// {
			// 	displayName: 'Operation',
			// 	name: 'operation',
			// 	type: 'options',
			// 	options: [
			// 		{
			// 			name: 'List',
			// 			value: 'list',
			// 			action: 'Return a list of items',
			// 		},
			// 		{
			// 			name: 'Set',
			// 			value: 'set',
			// 			action: 'Set a state',
			// 		},
			// 	],
			// 	default: 'list',
			// 	displayOptions: {
			// 		show: {
			// 			resource: [
			// 				'state',
			// 			],
			// 		},
			// 	},
			// 	noDataExpression: true,
			// },


		],

	}

	methods = {
		loadOptions: {
			load_component_options,
			load_area_options,
			load_entity_options,
			load_device_options,
			load_service_options,
			load_service_domain_options,
		}
	}


	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// const items = this.getInputData();

		// const operation = this.getNodeParameter('operation', 0);

		// open websocket with socket.io
		const items = this.getInputData();

		const cred = await this.getCredentials('homeAssistantWsApi');
		const assistant = new HomeAssistant(cred.host, cred.apiKey)

		let resultData: INodeExecutionData[][] = [];

		const resource = this.getNodeParameter('resource', 0); // all resources are the same


		switch (resource) {
			case 'area':
				resultData = await executeAreaOperation(this, assistant, items);
				break;
			case 'entity':
				resultData = await executeEntityOperation(this, assistant, items);
				break;
			case 'device':
				resultData = await executeDeviceOperation(this, assistant, items);
				break;
			case 'category':
				resultData = await executeCategoryOperations(this, assistant, items);
				break;
			case 'state':
				resultData = await executeStateOperation(this, assistant, items);
				break;
			case 'serviceAction':
				resultData = await executeServiceActionOperation(this, assistant, items);
				break;
			case 'logbook':
				resultData = await executeLogbookOperation(this, assistant, items);
				break;
		}



		assistant.close();
		return resultData;

		// return resultPromise.then(items=>
		// 	[this.helpers.returnJsonArray(items as IDataObject[])]
		// );
	}
}
