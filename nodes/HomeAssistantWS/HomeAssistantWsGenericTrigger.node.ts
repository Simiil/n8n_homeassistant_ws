import { INodeType, INodeTypeDescription, ITriggerFunctions, ITriggerResponse, NodeApiError, NodeConnectionType, NodeOperationError } from "n8n-workflow";
import { HomeAssistant } from "./HomeAssistant";
import { EventEmitter } from "ws";
import { genericNodeProperties, parseQueryParams } from "./operations/GenericProperties";
import { credentialTest }  from './cred';

export class HomeAssistantWsGenericTrigger  implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Home Assistant Generic WS Trigger',
		name: 'homeAssistantWsGenericTrigger',
		icon: 'file:homeAssistantWs.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{ $parameter["type"] }}',
		description: 'Starts a Workflow on a Generic Home Assistant Event',
		defaults: {
			name: 'Home Assistant Generic WS Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],

		credentials: [
			{
				name: 'homeAssistantWsApi',
				required: true,
				testedBy: 'homeAssistantWsApiTest'
			},
		],

		properties: [
			...genericNodeProperties(false)
		]

	}

	methods = {
			credentialTest
	}

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {

		let assistant: HomeAssistant | undefined;
		let emitter: EventEmitter | undefined;
		let running = false;

		const subscribeToEvents = async () => {
			const type = this.getNodeParameter('type', null, {});
			if(!type){
				throw new NodeOperationError(this.getNode(), 'Type is required')
			}

			const hasParameters = this.getNodeParameter('hasParameters', null)
			const bodyParameters = this.getNodeParameter(
				'bodyParameters.parameters',
				null,
			);

			const jsonBodyParameter = this.getNodeParameter('jsonBody', null) as string;

			let queryParams: any = parseQueryParams(
				this,
				hasParameters as boolean,
				bodyParameters,
				jsonBodyParameter
			);

			emitter = await assistant!.subscribe_generic(type as string, queryParams)

			emitter?.on('error', (error: any) => {
				stopConsumer();
				this.emitError(new NodeOperationError(this.getNode(), error, {
					message: error['message'] ?? 'Unknown error',
					description: error['description'] ?? 'Unknown error'
				}));
			})

			emitter?.on('event', (event: any) => {
				this.emit([
					this.helpers.returnJsonArray([event])
				]);
			})
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
