

import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import { HomeAssistant } from './HomeAssistant';
import { mapResults } from './utils';
import { genericNodeProperties, parseQueryParams } from './operations/GenericProperties';

export type QueryParameter = {
	name: string;
	value: string;
};

export class HomeAssistantWsGeneric implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Home Assistant Generic WS',
		name: 'homeAssistantWsGeneric',
		subtitle: '={{ $parameter["type"] }}',
		icon: 'file:homeAssistantWs.svg',
		group: ['transform'],
		version: 1,
		description: 'Node to interact with Home Assistant through the WebSocket API with generic operations',
		defaults: {
			name: 'Home Assistant Generic WS',
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
			...genericNodeProperties(true)
		]
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {


		const cred = await this.getCredentials('homeAssistantWsApi');
		const assistant = new HomeAssistant(cred.host, cred.apiKey)
		const items = this.getInputData();

		let results: INodeExecutionData[][] = [];

		for (let i = 0; i < items.length; i++) {
			const type = this.getNodeParameter('type', i, null)

			if (!type) {
				throw new NodeOperationError(this.getNode(), 'Type is required')
			}

			const hasResponse = this.getNodeParameter('response', i, true)
			const hasParameters = this.getNodeParameter('hasParameters', i, false)
			const bodyParameters = this.getNodeParameter(
				'bodyParameters.parameters',
				i,
				null,
			);

			const jsonBodyParameter = this.getNodeParameter('jsonBody', i, null) as string;

			let queryParams: any = parseQueryParams(
				this,
				hasParameters as boolean,
				bodyParameters,
				jsonBodyParameter, {
				itemIndex: i
			});

			if(hasResponse){
				const result = await assistant.send_with_response<any>(
					type as string,
					d => Promise.resolve(d),
					queryParams
				)
				results.push(this.helpers.returnJsonArray(result))
			}else{
				await assistant.send_no_response(type as string, queryParams)
				results.push(this.helpers.returnJsonArray([]))
			}

		}

		await assistant.close();
		return mapResults(this, items, results);

	}
}
