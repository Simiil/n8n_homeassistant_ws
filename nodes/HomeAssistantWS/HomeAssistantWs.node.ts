

import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';
import { HomeAssistant } from './HomeAssistant';
import { load_area_options, load_component_options, load_device_options, load_entity_options, load_service_domain_options, load_service_options, search_area_options, search_component_options, search_device_options, search_entity_options, search_service_domain_options, search_service_options, search_trigger_options } from './loadOptions';
import { areaFields, areaOperations, executeAreaOperation } from './operations/AreaOperations';
import { categoryFields, categoryOperations, executeCategoryOperations } from './operations/CategoryOperations';
import { deviceFields, deviceOperations, executeDeviceOperation } from './operations/DeviceOperations';
import { entityFields, entityOperations, executeEntityOperation } from './operations/EntityOperations';
import { executeStateOperation, stateFields, stateOperations } from './operations/StateOperations';
import { executeServiceActionOperation, serviceActionFields, serviceActionOperations } from './operations/ServiceAction';
import { executeLogbookOperation, logbookFields, logbookOperations } from './operations/LogbookOperations';
import { credentialTest } from './cred';
import { getMappingColumns } from './serviceMapping';
import { configFields, configOperations, executeConfigOperations } from './operations/ConfigOperation';




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
						name: 'Config',
						value: 'config',
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

			...configOperations,
			...configFields,

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
		},
		listSearch: {
			search_component_options,
			search_area_options,
			search_entity_options,
			search_device_options,
			search_service_options,
			search_service_domain_options,
			search_trigger_options,
		},
		credentialTest,
		resourceMapping: {
			getMappingColumns,
		}
	}


	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

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
			case 'config':
				resultData = await executeConfigOperations(this, assistant, items);
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

	}
}
