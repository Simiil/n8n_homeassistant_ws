import { CredentialInformation } from "n8n-workflow";
import { EventEmitter, WebSocket } from 'ws';


import { Entity } from "./model/Entity";
import { State } from "./model/State";
import { Config } from "./model/Config";
import { Device } from "./model/Device";
import { Area } from "./model/Area";
import { Trigger } from "./model/Trigger";
import { SocketConnection } from "./SocketConnection";

export class CommandCounter {
	private cmd = 1;
	get(): number {
		return this.cmd++;
	}
}

enum MessageType {
	RESULT = 'result',
	RESULT_WITH_ERROR = 'result_error',
	EVENT = 'event',
	AUTH_REQUIRED = 'auth_required',
	AUTH_OK = 'auth_ok',
	ERROR = 'error',
}

export class HomeAssistant {
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

	private log: any[] = [];

	// TODO multiplex callbacks so we dont subscribe to the same event multiple times
	private callbacks: Map<number, (type: MessageType, data: any) => void> = new Map();

	constructor(private host: CredentialInformation, private apiKey: CredentialInformation) {
		this.ws = this.get_authenticated_ws();
	}



	get_service_domains(): Promise<string[]> {
		const id = this.cmd.get();

		const promise = this.send_with_single_response(id, "get_services", (data: any) => {
			const options: string[] = [];
			for (let k in data) {
				options.push(k)
			}
			return options
		})

		return promise
	}

	get_all_entities(): Promise<Entity[]> {
		const id = this.cmd.get();

		const promise = this.send_with_single_response(id, 'config/entity_registry/list', (data: any) => {
			return (data as any[])
				.map(item => Entity.fromJSON(item))
		})

		return promise
	}

	get_entities(entityType?: string, areaId?: string): Promise<Entity[]> {


		return this.get_all_devices().then(devices => {

			return this.send_with_single_response(this.cmd.get(), 'config/entity_registry/list', (data: any) => {
				return (data as any[])
					.map(item => {
						const entity =Entity.fromJSON(item)
						const device = devices.find(d => d.id === item.device_id);
						entity.device = device;
						return entity;
			})
					.filter(item => {
						const inArea = !areaId || areaId.trim() === '' || item.area_id === areaId || item.device?.area_id === areaId;
						const inType = !entityType || entityType.trim() === '' || item.entity_type === entityType;

						return inArea && inType;
					})
			})
		})
	}

	get_states(): Promise<State[]> {
		const id = this.cmd.get();
		return this.send_with_single_response(id, 'get_states', (data: any) => {
			return (data as any[])
				.map(item => State.fromJSON(item))
		})
	}

	get_components(): Promise<any[]> {
		return this.get_system_config().then(config => config.components)
	}

	get_system_config(): Promise<Config> {
		const id = this.cmd.get();
		return this.send_with_single_response(id, 'get_config', (data: any) => {
			return Config.fromJSON(data)
		})
	}

	get_all_devices(): Promise<Device[]> {
		const id = this.cmd.get();
		return this.send_with_single_response(id, 'config/device_registry/list', (data: any) => {
			return (data as any[])
				.map(item => Device.fromJSON(item))
		})
	}

	get_device(deviceId: string): Promise<Device | undefined> {
		return this.get_all_devices().then(devices => devices.find(device => device.id === deviceId))
	}

	get_devices_by_area(areaId: string): Promise<Device[]> {
		return this.get_all_devices().then(devices => devices.filter(device => device.area_id === areaId))
	}

	get_categories(scope: string): Promise<any[]> {
		const id = this.cmd.get();
		return this.send_with_single_response(id, 'config/category_registry/list', (data: any) => {
			return data
		}, { scope: scope })
	}

	get_areas(): Promise<Area[]> {
		const id = this.cmd.get();
		return this.send_with_single_response(id, 'config/area_registry/list', (data: any) => {
			return (data as any[])
				.map(item => Area.fromJSON(item))
		})
	}

	get_triggers_for_device(deviceId: string): Promise<Trigger[]> {
		const id = this.cmd.get();
		return this.send_with_single_response(id, 'device_automation/trigger/list', (data: any) => {
			return (data as any[])
				.map(item => Trigger.fromJSON(item))
		}, { device_id: deviceId })
	}

	subscribe_trigger_mapped(device_id: string, triggers: Trigger[]): EventEmitter {
		const emitter = new EventEmitter();

		const id = this.cmd.get()


		this.callbacks.set(id, (type: MessageType, data: any) => {
			console.log('subscribe_trigger result', data);
			if (type == MessageType.RESULT) {
				if (!data['success']) {
					emitter.emit('error', data['error'])
					this.callbacks.delete(id)
				}
			} else if (type == MessageType.EVENT) {
				emitter.emit('event', data['event']);
			} else if (type == MessageType.ERROR || type == MessageType.RESULT_WITH_ERROR) {
				emitter.emit('error', data);
			}
		});

		this.send(id, 'subscribe_trigger', { trigger: triggers })
		this.log.push({ type: 'subscribe_trigger', params: { trigger: triggers } })
		return emitter
	}

	async subscribe_trigger(device_id: string, trigger: string[]): Promise<EventEmitter> {
		console.log('subscribing to trigger...', device_id, trigger);
		const triggers = await this.get_triggers_for_device(device_id)

		const triggerArray = triggers.filter((t: Trigger) =>  trigger.includes(t.getId()));
		return this.subscribe_trigger_mapped(device_id, triggerArray)
	}

	subscribe_events(type: string): EventEmitter {
		const emitter = new EventEmitter();
		const id = this.cmd.get();
		this.callbacks.set(id, (type: MessageType, data: any) => {
			console.log('subscribe_events result', data);
			if (type == MessageType.RESULT) {
				if (!data['success']) {
					emitter.emit('error', data['error'])
					this.callbacks.delete(id)
				}

			} else if (type == MessageType.EVENT) {
				emitter.emit('event', data['event']);
			}
		});

		this.send(id, 'subscribe_events', { event_type: type })
		this.log.push({ id, type: 'subscribe_events', params: { event_type: type } })
		return emitter
	}

	call_service(domain: string, service: string, attributes: any, response: boolean): Promise<any> {
		const id = this.cmd.get();

		if (response) {
			return this.send_with_single_response(id, 'call_service', (data: any) => {
				return data
			}, {
				domain: domain,
				service: service,
				service_data: attributes,
				return_response: response
			})
		} else {
			this.send(id, 'call_service', {
				domain: domain,
				service: service,
				service_data: attributes,
				return_response: response
			})
			return Promise.resolve({})
		}
	}

	get_service_actions(domain?: string): Promise<any[]> {
		const id = this.cmd.get();
		const services = this.send_with_single_response(id, "get_services", (services: any) => {
			const options: any[] = [];
			for (let k in services) {
				if (!domain || k == domain) {

					for (let s in services[k]) {
						const serviceDef = services[k][s]
						serviceDef['id'] = s
						serviceDef['domain'] = k
						options.push(serviceDef)
					}
				}
			}

			return options
		})



		return services
	}



	private get_authenticated_ws(): SocketConnection<WebSocket> {
		const url = 'ws://' + this.host + '/api/websocket';
		const ws = new WebSocket(url, {
			followRedirects: true,
		});

		console.log('WebSocket connection...');
		const socket = new SocketConnection(ws)
		ws.on('message', (event: MessageEvent) => {
			const data = JSON.parse(event.toString());

			if (data['type'] == 'auth_required') {
				ws.send(JSON.stringify({
					type: 'auth',
					access_token: this.apiKey,
				}));
			} else if (data['type'] == 'auth_ok') {
				console.log('WebSocket connection authenticated');
				socket.ready();
			} else {
				const id = data['id']
				const type = data['type']

				console.log('WebSocket message', id, type);

				const callback = this.callbacks.get(id)
				if (callback) {
					callback(type, data)
				}
			}
		});

		ws.on('error', (error: any) => {
			console.error('WebSocket error', error);
		});

		ws.on('close', () => {
			console.log('WebSocket closed');
		});

		return socket;
	}


	private send_with_single_response<T>(id: number, type: string, mapping: (data: any) => T, params?: any): Promise<T> {
		const promise = new Promise<T>((resolve, reject) => {
			this.callbacks.set(id, (type: MessageType, data: any) => {
				this.callbacks.delete(id);
				if (type == MessageType.RESULT) {
					const result = data['result']
					const error = data['error']
					if (error) {
						reject(error);
					} else {
						resolve(mapping(result));
					}
				} else if (type == MessageType.ERROR) {
					reject(data);
				}
			});
		});

		this.send(id, type, params)

		return promise
	}

	private send(id: number, type: string, params?: any): Promise<void> {

		const jsonString = JSON.stringify({
			type: type,
			id: id,
			...params
		})

		return this.ws.then(ws => {
			console.log('send', id, type, jsonString);
			ws.send(jsonString)
		});
	}

	on(event: string, listener: (this: WebSocket, ...args: any[]) => void): Promise<WebSocket> {
		return this.ws.then(ws => ws.on(event, listener))
	}

	removeAllListeners(): Promise<WebSocket> {
		return this.ws.then(ws => ws.removeAllListeners())
	}

	close(): Promise<void> {
		return this.ws.then(ws => {
			this.ws.close();
			ws.close();
		});
	}

}
