import { CredentialInformation, Logger } from "n8n-workflow";
import { EventEmitter, WebSocket } from 'ws';


import { Area } from "./model/Area";
import { Config } from "./model/Config";
import { Device } from "./model/Device";
import { Entity } from "./model/Entity";
import { State } from "./model/State";
import { Trigger } from "./model/Trigger";
import { SocketConnection } from "./SocketConnection";


import { ServiceAction } from "./model/ServiceAction";

export class CommandCounter {
	private cmd = 1;
	get(): number {
		return this.cmd++;
	}
	reset(): void {
		this.cmd = 1;
	}
}

enum MessageType {
	RESULT = 'result',
	RESULT_WITH_ERROR = 'result_error',
	EVENT = 'event',
	AUTH_REQUIRED = 'auth_required',
	AUTH_OK = 'auth_ok',
	ERROR = 'error',
	PING = 'ping',
	PONG = 'pong',
}

export class HomeAssistant extends EventEmitter {

	oneShot<T>(callback: (a: HomeAssistant) => Promise<T>): Promise<T> {
		const result = callback(this)
			.then(x => {
				this.close();
				return x
			})
		return result;
	}

	private cmd = new CommandCounter();
	private ws: SocketConnection<WebSocket>;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 10;
	private reconnectTimeoutId: NodeJS.Timeout | null = null;
	private isReconnecting = false;
	private shouldReconnect = true;

	// Ping-pong mechanism for connection health
	private pingIntervalId: NodeJS.Timeout | null = null;
	private pongTimeoutId: NodeJS.Timeout | null = null;
	private pingInterval = 60000; // 30 seconds
	private pongTimeout = 10000; // 10 seconds to wait for pong
	private lastPongReceived = Date.now();

	private callbacks: Map<number, (type: MessageType, data: any) => void> = new Map();

	constructor(private host: CredentialInformation, private apiKey: CredentialInformation, private logger: Logger) {
		super();
		this.ws = this.get_authenticated_ws();
	}

	get_logbook(
		startTime: any,
		endTime: any,
		deviceIds: any,
		entityIds: any,
		contextId: any
	) {

		const params: any = {
			start_time: startTime
		}

		if(endTime){
			params.end_time = endTime
		}

		if(deviceIds){
			params.device_ids = deviceIds
		}

		if(entityIds){
			params.entity_ids = entityIds
		}

		if(contextId){
			params.context_id = contextId
		}

		const id = this.cmd.get();
		return this.send_with_single_response(id, 'logbook/get_events', (data: any) => {
			return Promise.resolve(data as any[])
		}, params)
	}

	get_service_domains(): Promise<string[]> {
		const id = this.cmd.get();

		const promise = this.send_with_single_response(id, "get_services", (data: any) => {
			const options: string[] = [];
			for (let k in data) {
				options.push(k)
			}
			return Promise.resolve(options)
		})

		return promise
	}

	get_all_entities(): Promise<Entity[]> {


		return this.get_entities()
	}

	get_entities(entityType?: string, areaId?: string, deviceId?: string): Promise<Entity[]> {


		return this.get_all_devices().then(devices => {

			return this.send_with_single_response(this.cmd.get(), 'config/entity_registry/list', (data: any) => {
				const result = (data as any[])
					.map(item => {
						const entity = Entity.fromJSON(item)
						const device = devices.find(d => d.id === entity.device_id);
						entity.device = device;
						return entity;
					})
					.filter(item => {
						const inArea = !areaId || areaId.trim() === '' || item.area_id === areaId || item.device?.area_id === areaId;
						const inType = !entityType || entityType.trim() === '' || item.entity_type === entityType;

						const inDevice = !deviceId || deviceId.trim() === '' || item.device_id === deviceId;

						return inArea && inType && inDevice;
					})

				return Promise.resolve(result)
			})
		})
	}

	resolve_state(state: State, entities: Entity[]): State {
		const entity = entities.find(e => e.entity_id === state.entity_id);

		state.entity = entity;
		return state
	}

	get_states(resolve: boolean = false): Promise<State[]> {
		const id = this.cmd.get();


			return this.send_with_single_response(id, 'get_states', (data: any) => {

				let resolving: Promise<Entity[]>
				if(resolve){
					resolving = this.get_all_entities()
				} else{
					resolving = Promise.resolve([])
				}

				return resolving.then(entities => {
					const resolvedData = (data as any[])
						.map(item => State.fromJSON(item))
						.map(item => {
							if (resolve) {
								return this.resolve_state(item, entities)
							} else {
								return item
							}
						})
						return Promise.resolve(resolvedData)
				})


			})

	}

	get_components(): Promise<any[]> {
		return this.get_system_config().then(config => config.components)
	}

	get_system_config(): Promise<Config> {
		const id = this.cmd.get();
		return this.send_with_single_response(id, 'get_config', (data: any) => {
			return Promise.resolve(Config.fromJSON(data))
		})
	}

	get_all_devices(): Promise<Device[]> {
		const id = this.cmd.get();
		return this.send_with_single_response(id, 'config/device_registry/list', (data: any) => {
			return Promise.resolve((data as any[])
				.map(item => Device.fromJSON(item)))
		})
	}

	get_device(deviceId: string): Promise<Device | undefined> {
		return this.get_all_devices().then(devices => devices.find(device => device.id === deviceId))
	}

	get_devices_by_area(areaId?: string): Promise<Device[]> {
		return this.get_all_devices().then(devices => devices.filter(device => !areaId || areaId.trim() === '' || device.area_id === areaId))
	}

	get_categories(scope: string): Promise<any[]> {
		const id = this.cmd.get();
		return this.send_with_single_response(id, 'config/category_registry/list', (data: any) => {
			return Promise.resolve(data)
		}, { scope: scope })
	}

	get_areas(): Promise<Area[]> {
		const id = this.cmd.get();
		return this.send_with_single_response(id, 'config/area_registry/list', (data: any) => {
			return Promise.resolve((data as any[])
				.map(item => Area.fromJSON(item)))
		})
	}

	get_triggers_for_device(deviceId: string): Promise<Trigger[]> {
		const id = this.cmd.get();
		return this.send_with_single_response(id, 'device_automation/trigger/list', (data: any) => {
			return Promise.resolve((data as any[])
				.map(item => Trigger.fromJSON(item)))
		}, { device_id: deviceId })
	}

	subscribe_trigger_mapped(device_id: string, triggers: Trigger[]): Promise<EventEmitter> {
		return this.subscribe_generic('subscribe_trigger', { trigger: triggers })
	}

	async subscribe_trigger(device_id: string, trigger: string[]): Promise<EventEmitter> {
		const triggers = await this.get_triggers_for_device(device_id)

		const triggerArray = triggers.filter((t: Trigger) => trigger.includes(t.getId()));
		return this.subscribe_trigger_mapped(device_id, triggerArray)
	}


	subscribe_generic(type: string, params: any): Promise<EventEmitter> {
		const emitter = new EventEmitter();
		const id = this.cmd.get();
		this.callbacks.set(id, (type: MessageType, data: any) => {

			if (type == MessageType.RESULT) {
				if (!data['success']) {
					emitter.emit('error', data['error'])
					this.callbacks.delete(id)
				}else{
					emitter.emit(MessageType.RESULT, data['result']);
				}

			} else if (type == MessageType.EVENT) {
				emitter.emit(MessageType.EVENT, data['event']);
			}else if (type == MessageType.ERROR || type == MessageType.RESULT_WITH_ERROR) {
				emitter.emit(MessageType.ERROR, data);
			}
		});

		return this.send(id, type, params).then(() => {
			return emitter
		})
	}

	subscribe_events(type: string): Promise<EventEmitter> {
		return this.subscribe_generic("subscribe_events", { event_type: type })
	}

	call_service(domain: string, service: string, attributes: any, response: boolean): Promise<any> {
		const id = this.cmd.get();

			return this.send_with_single_response(id, 'call_service', (data: any) => {
				return Promise.resolve(data)
			}, {
				domain: domain,
				service: service,
				service_data: attributes,
				return_response: response
			})
	}

	get_service_action(domain: string, service: string): Promise<ServiceAction|undefined> {
		return this.get_service_actions(domain).then(calls => {
			const call = calls.find(c => c.id == service);
			return Promise.resolve(call);
		});
	}

	get_service_actions(domain?: string): Promise<ServiceAction[]> {
		const id = this.cmd.get();
		const services = this.send_with_single_response(id, "get_services", (services: any) => {
			const options: any[] = [];
			for (let k in services) {
				if (!domain || domain.trim() === '' || k == domain) {

					for (let s in services[k]) {
						const serviceDef = services[k][s]
						serviceDef['id'] = s
						serviceDef['domain'] = k
						options.push(serviceDef)
					}
				}
			}

			return Promise.resolve(options)
		})



		return services
	}



	private get_authenticated_ws(): SocketConnection<WebSocket> {
		const url = 'ws://' + this.host + '/api/websocket';
		const ws = new WebSocket(url, {
			followRedirects: true,
		});

		const socket = new SocketConnection(ws)
		ws.on('message', (event: MessageEvent) => {
			const data = JSON.parse(event.toString());
			if (data['type'] == 'auth_required') {
				ws.send(JSON.stringify({
					type: 'auth',
					access_token: this.apiKey,
				}));
			} else if (data['type'] == 'auth_ok') {
				// Reset reconnection attempts on successful connection
				this.reconnectAttempts = 0;
				this.isReconnecting = false;
				// Reset command counter for new connection
				this.cmd.reset();
				socket.ready();
				this.emit('connected');
				// Start ping-pong mechanism
				this.startPingPong();
			} else if (data['type'] == 'auth_invalid') {
				this.logger.error('WebSocket error', data);
				socket.error(data.message)
			} else if (data['type'] == 'pong') {
				// Handle pong response
				this.handlePongReceived(data);
			} else {
				const id = data['id']
				const type = data['type']
				const callback = this.callbacks.get(id)

				if (callback) {
					callback(type, data)
				}
			}
		});

		ws.on('error', (error: any) => {
			this.logger.error('WebSocket error', error);
			this.emit('error', error);
		});

		ws.on('close', (code: number, reason: Buffer) => {
			this.logger.info(`WebSocket closed with code ${code}, reason: ${reason.toString()}`);
			this.stopPingPong(); // Stop ping-pong when connection is lost
			this.emit('close', code, reason.toString());

			// Only attempt to reconnect if it's an unexpected close and we should reconnect
			if (this.shouldReconnect && code !== 1000 && !this.isReconnecting) {
				this.attemptReconnect();
			}
		});

		return socket;
	}

	send_with_response<T>(type: string, mapping: (data: any) => Promise<T>, params?: any): Promise<T> {
		return this.send_with_single_response(this.cmd.get(), type, mapping, params)
	}


	private send_with_single_response<T>(id: number, type: string, mapping: (data: any) => Promise<T>, params?: any): Promise<T> {
		const promise = new Promise<T>((resolve, reject) => {
			this.callbacks.set(id, (type: MessageType, data: any) => {
				try{
					this.callbacks.delete(id);
					if (type == MessageType.RESULT) {
						const result = data['result']
						const error = data['error']
						if (error) {
							reject(error);
						} else {
							const mappedResult = mapping(result)
							if(mappedResult){
								mappedResult.then(r => resolve(r))
							}else{
								reject(new Error("No result returned from mapping function"))
							}
						}
					} else if (type == MessageType.ERROR) {
						reject(data);
					}
				} catch(e){
					reject(e)
				}
			});
		});

		return this.send(id, type, params).then(() => {
			return promise
		})
	}

  send_no_response(type: string, params?: any): Promise<void> {
    return this.send(this.cmd.get(), type, params)
  }

	private send(id: number, type: string, params?: any): Promise<void> {

		const jsonString = JSON.stringify({
			type: type,
			id: id,
			...params
		})
		this.logger.info(`send ${id} ${type} ${jsonString}`);
		return this.ws.then(ws => {
			ws.send(jsonString)
		})
	}

	onWebSocket(event: string, listener: (this: WebSocket, ...args: any[]) => void): Promise<WebSocket> {
		return this.ws.then(ws => ws.on(event, listener))
	}

	removeAllWebSocketListeners(): Promise<WebSocket> {
		return this.ws.then(ws => ws.removeAllListeners())
	}

	private attemptReconnect(): void {
		if (this.isReconnecting || !this.shouldReconnect) {
			return;
		}

		this.isReconnecting = true;
		this.reconnectAttempts++;

		if (this.reconnectAttempts > this.maxReconnectAttempts) {
			this.logger.error(`Max reconnection attempts (${this.maxReconnectAttempts}) reached. Giving up.`);
			this.emit('reconnect_failed');
			return;
		}

		// Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s, 60s, 60s, 60s, 60s
		const delay = Math.min(Math.pow(2, this.reconnectAttempts - 1) * 1000, 60000);

		this.logger.info(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
		this.emit('reconnecting', this.reconnectAttempts, delay);

		this.reconnectTimeoutId = setTimeout(() => {
			try {
				// Stop ping-pong before reconnecting
				this.stopPingPong();

				// Close the old connection cleanly
				this.ws.close();

				// Create a new connection
				this.ws = this.get_authenticated_ws();
				this.logger.info(`Reconnection attempt ${this.reconnectAttempts} initiated`);
			} catch (error) {
				this.logger.error('Error during reconnection attempt:', error);
				this.isReconnecting = false;
				// Try again
				this.attemptReconnect();
			}
		}, delay);
	}

	public stopReconnecting(): void {
		this.shouldReconnect = false;
		if (this.reconnectTimeoutId) {
			clearTimeout(this.reconnectTimeoutId);
			this.reconnectTimeoutId = null;
		}
		this.isReconnecting = false;
	}

	private startPingPong(): void {
		// Clear any existing ping interval
		this.stopPingPong();

		this.lastPongReceived = Date.now();
		this.logger.info('Starting ping-pong mechanism');

		this.pingIntervalId = setInterval(() => {
			this.sendPing();
		}, this.pingInterval);
	}

	private stopPingPong(): void {
		if (this.pingIntervalId) {
			clearInterval(this.pingIntervalId);
			this.pingIntervalId = null;
		}
		if (this.pongTimeoutId) {
			clearTimeout(this.pongTimeoutId);
			this.pongTimeoutId = null;
		}
	}

		private sendPing(): void {
		const pingId = this.cmd.get();
		const pingMessage = {
			type: 'ping',
			id: pingId
		};

		this.logger.debug(`Sending ping ${pingId}`);

		this.ws.then(ws => {
			ws.send(JSON.stringify(pingMessage));
		}).catch(error => {
			this.logger.error('Failed to send ping:', error);
		});

		// Set timeout to wait for pong
		this.pongTimeoutId = setTimeout(() => {
			this.logger.warn(`Pong timeout for ping ${pingId}`);
			this.handlePongTimeout();
		}, this.pongTimeout);
	}

	private handlePongReceived(data: any): void {
		const pongId = data.id;
		this.lastPongReceived = Date.now();

		this.logger.debug(`Received pong ${pongId}`);

		// Clear the pong timeout since we received a response
		if (this.pongTimeoutId) {
			clearTimeout(this.pongTimeoutId);
			this.pongTimeoutId = null;
		}
	}

	private handlePongTimeout(): void {
		this.logger.error('Ping-pong timeout - connection may be dead');
		this.stopPingPong();

		// Emit an event to notify listeners about connection health issues
		this.emit('ping_timeout');

		// Optionally trigger a reconnection if the connection seems dead
		if (this.shouldReconnect && !this.isReconnecting) {
			this.logger.info('Triggering reconnection due to ping timeout');
			this.attemptReconnect();
		}
	}

	public getConnectionHealth(): { lastPongReceived: number, timeSinceLastPong: number, isHealthy: boolean } {
		const now = Date.now();
		const timeSinceLastPong = now - this.lastPongReceived;
		const maxHealthyInterval = this.pingInterval + this.pongTimeout;

		return {
			lastPongReceived: this.lastPongReceived,
			timeSinceLastPong,
			isHealthy: timeSinceLastPong < maxHealthyInterval
		};
	}

	close(): Promise<void> {
		this.stopReconnecting();
		this.stopPingPong();
		return this.ws.then(ws => {
			this.ws.close();
			ws.close();
		});
	}

}
