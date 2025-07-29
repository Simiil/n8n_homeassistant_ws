import { INodeType, INodeTypeDescription, ITriggerFunctions, ITriggerResponse, NodeConnectionType, NodeOperationError } from "n8n-workflow";
import { HomeAssistant } from "./commands";
import { EventEmitter, WebSocket } from "ws";
import { load_device_options, load_entity_options, load_trigger_options } from "./loadOptions";

export class HomeAssistantWsTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Home Assistant WS Trigger',
		name: 'homeAssistantWsTrigger',
		icon: 'file:homeAssistantWs.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'Starts a Workflow on a Home Assistant Event',
		defaults: {
			name: 'Home Assistant WS Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'State Changed',
						value: 'state',
					},
					{
						name: 'Trigger Fired',
						value: 'trigger'
					},
				],
				default: 'state',
				noDataExpression: true,
				required: true,
				description: 'The type of event to listen for',
			},
			{
				displayName: 'Entity Name or ID',
				name: 'entityId',
				type: 'options',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				default: '',
				displayOptions: {
					show: {
						resource: ['state'],
					}
				},

				typeOptions: {
					loadOptionsMethod: 'load_entity_options',
				},
			},
			{
				displayName: 'Device Name or ID',
				name: 'deviceId',
				type: 'options',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				default: '',
				displayOptions: {
					show: {
						resource: ['trigger'],
					}
				},

				typeOptions: {
					loadOptionsMethod: 'load_device_options',
				},
			},
			{
				displayName: 'Trigger Names or IDs',
				name: 'triggerId',
				type: 'multiOptions',
				description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				default: [],
				displayOptions: {
					show: {
						resource: ['trigger'],
					}
				},

				typeOptions: {
					loadOptionsDependsOn: ['deviceId'],
					loadOptionsMethod: 'load_trigger_options',
				},
			},
		],
		credentials: [
			{
				name: 'homeAssistantWsApi',
				required: true,
				testedBy: 'homeAssistantWsApiTest'
			},
		],


	}

	methods = {
		loadOptions: {
			load_entity_options,
			load_device_options,
			load_trigger_options,
		}
	}


	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {

		let assistant: HomeAssistant | undefined;
		let emitter: EventEmitter | undefined;
		let ws: WebSocket | undefined;

		const startConsumer = async () => {
			const cred = await this.getCredentials('homeAssistantWsApi');
			assistant = new HomeAssistant(cred.host, cred.apiKey)

			const resource = this.getNodeParameter('resource', null, {});

			switch (resource) {
				case 'state': {
					const entityId = this.getNodeParameter('entityId', null, {});
					const [a, b] = assistant.subscribe_events('state_changed')
					emitter = a;
					ws = b;
					emitter?.on('event', (event: any) => {

						if (!entityId || event.entity_id == entityId) {
							this.emit([
								this.helpers.returnJsonArray([event])
							]);
						}
					})
					emitter?.on('error', (error: any) => {
						stopConsumer();
						this.emitError(new NodeOperationError(this.getNode(), error, {
							message: error['message'] ?? 'Unknown error',
							description: error['description'] ?? 'Unknown error'
						}));
					})

					break;
				}
				case 'trigger': {
						const triggerId = this.getNodeParameter('triggerId', null, {});
						const deviceId = this.getNodeParameter('deviceId', null, {});
						const [a, b] = assistant.subscribe_trigger(deviceId as string, triggerId as string[])
						emitter = a;
						ws = b;
						emitter?.on('event', (event: any) => {
							this.emit([
								this.helpers.returnJsonArray([event])
							]);
						})
						emitter?.on('error', (error: any) => {
							stopConsumer();
							this.emitError(new NodeOperationError(this.getNode(), error, {
								message: error['message'] ?? 'Unknown error',
								description: error['description'] ?? 'Unknown error'
							}));
						})
					}
					break;

			}

			ws?.on('error', (error) => {
				stopConsumer();
				this.emitError(new NodeOperationError(this.getNode(), error));
			})

			ws?.on('close', () => {
				stopConsumer();
				this.emitError(new NodeOperationError(this.getNode(), 'Connection closed unexpectedly'));
			})

			return Promise.resolve(true);
		}

		async function stopConsumer() {
			// remove all listeners so we dont trigger the unexpected closed error
			ws?.removeAllListeners();
			ws?.close();
			emitter?.removeAllListeners();
		}

		async function manualTriggerFunction() {
			await startConsumer();
		}

		await startConsumer();

		return {
			closeFunction: stopConsumer,
			manualTriggerFunction: manualTriggerFunction,
		}
	}
}
