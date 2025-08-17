import { INodeType, INodeTypeDescription, ITriggerFunctions, ITriggerResponse, NodeApiError, NodeConnectionType, NodeOperationError } from "n8n-workflow";
import { HomeAssistant } from "./HomeAssistant";
import { EventEmitter } from "ws";
import { load_device_options, load_entity_options, load_trigger_options } from "./loadOptions";
import { credentialTest }  from './cred';

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
		},
		credentialTest
	}


	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {

		let assistant: HomeAssistant | undefined;
		let emitter: EventEmitter | undefined;
		let running = false;

		const subscribeToEvents = async () => {
			const resource = this.getNodeParameter('resource', null, {});

			switch (resource) {
				case 'state': {
					const entityId = this.getNodeParameter('entityId', null, {});
					emitter = await assistant!.subscribe_events('state_changed')
					emitter?.on('event', async (event: any) => {
						const data = event.data;
						if (!entityId || data.entity_id == entityId) {
							this.emit([
								this.helpers.returnJsonArray([event])
							]);
						}
					})

					emitter?.on('error', (error: any) => {
						this.emitError(new NodeApiError(this.getNode(), error));
					})

					break;
				}
				case 'trigger': {
						const triggerId = this.getNodeParameter('triggerId', null, {});
						const deviceId = this.getNodeParameter('deviceId', null, {});
						emitter = await assistant!.subscribe_trigger(deviceId as string, triggerId as string[])
						emitter?.on('event', (event: any) => {
							this.emit([
								this.helpers.returnJsonArray([event])
							]);
						})
						emitter?.on('error', (error: any) => {
							this.emitError(new NodeApiError(this.getNode(), error));
						})
					}
					break;

			}
		};

		const resubscribeAfterReconnect = async () => {
			try {
				// Clear old emitter listeners to avoid duplicates
				emitter?.removeAllListeners();
				await subscribeToEvents();
			} catch (error) {
				this.logger.error('Error resubscribing after reconnect:', error);
				this.emitError(new NodeApiError(this.getNode(), error));
			}
		};

		const startConsumer = async () => {
			running = true;
			const cred = await this.getCredentials('homeAssistantWsApi');
			assistant = new HomeAssistant(cred.host, cred.apiKey, this.logger)

			await subscribeToEvents();

			emitter?.on('error', (error: any) => {
				stopConsumer();
				this.emitError(new NodeOperationError(this.getNode(), error, {
					message: error['message'] ?? 'Unknown error',
					description: error['description'] ?? 'Unknown error'
				}));
			})

			assistant.on('close', (code: number, reason: string) => {
				this.logger.info(`HomeAssistant connection closed: ${code} - ${reason}`);
			});

			assistant.on('reconnecting', (attempt: number, delay: number) => {
				this.logger.info(`HomeAssistant reconnecting... attempt ${attempt}, delay ${delay}ms`);
			});

			assistant.on('connected', () => {
				this.logger.info('HomeAssistant reconnected successfully');
				// Re-subscribe to events after reconnection
				resubscribeAfterReconnect();
			});

			assistant.on('reconnect_failed', () => {
				stopConsumer();
				this.emitError(new NodeOperationError(this.getNode(), 'Connection could not be re-established after multiple attempts'));
			});

			return Promise.resolve(true);
		}

		async function stopConsumer() {
			// remove all listeners so we dont trigger the unexpected closed error
			await assistant?.removeAllWebSocketListeners();
			await assistant?.close();
			emitter?.removeAllListeners();
			running = false;
		}

		async function manualTriggerFunction() {
			if(!running){
				await startConsumer();
			}
		}

		await startConsumer();

		return {
			closeFunction: stopConsumer,
			manualTriggerFunction: manualTriggerFunction,
		}
	}
}
