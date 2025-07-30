
import { CredentialInformation } from 'n8n-workflow';
import { EventEmitter, WebSocket } from 'ws';
import { Entity } from './model/Entity';
import { Config } from './model/Config';
import { Area } from './model/Area';
import { Device } from './model/Device';
import { State } from './model/State';
import { EventData } from './model/EventData';
import { Trigger } from './model/Trigger';

import {
	LoggerProxy as Logger
} from 'n8n-workflow';


export class HomeAssistant {

	constructor(private host: CredentialInformation, private apiKey: CredentialInformation) {
	}

	get_entities(entityType?: string, areaId?: string): Promise<Entity[]> {
		return this.get_array('config/entity_registry/list').then(items =>
			items
				.map(item => Entity.fromJSON(item))
				.filter(item => {
					const inArea = !areaId || areaId.trim() === '' || item.area_id === areaId;
					const inType = !entityType || entityType.trim() === '' || item.entity_type === entityType;

					return inArea && inType;
				})
		);
	}

	async get_service_domains(): Promise<any[]> {

		 const services = await this.get_single("get_services")

		 const options: string[] = [];
		 for(let k in services) {

			 options.push(k)

		 }

		 return options
	}

	async get_service_actions(domain?: string): Promise<any[]> {
		const services = await this.get_single("get_services")

		const options: any[] = [];
		for(let k in services) {
			if(!domain || k == domain) {

				for (let s in services[k]) {
					const serviceDef = services[k][s]
					serviceDef['id'] = s
					serviceDef['domain'] = k
					options.push(serviceDef)
				}
			}
		}
		console.log("service actions", options);

		return options
	}

	get_all_entities(): Promise<Entity[]> {
		return this.get_array('config/entity_registry/list').then(items =>
			items
				.map(item => Entity.fromJSON(item))
		);
	}

	call_service(domain: string, service: string, attributes: any, response: boolean): Promise<any> {
		return this.call('call_service', {
			domain: domain,
			service: service,
			service_data: attributes,
			return_response: response
		})
	}


	get_states(): Promise<State[]> {
		return this.get_array('get_states').then(items => items.map(item => State.fromJSON(item)));
	}

	get_components(): Promise<any[]> {
		return this.get_system_config().then(config => config.components);
	}

	get_system_config(): Promise<Config> {
		return this.get_object('get_config').then(item => Config.fromJSON(item));
	}


	get_device(deviceId: string): Promise<Device | undefined> {
		return this.get_array('config/device_registry/list')
			.then(items => items.map(item => Device.fromJSON(item)))
			.then(items => items.find(item => item.id === deviceId));
	}

	get_devices_by_area(areaId: string): Promise<Device[]> {
		return this.get_array('config/device_registry/list')
			.then(items => items.map(item => Device.fromJSON(item)))
			.then(items => items.filter(item => !areaId || areaId.trim() === '' || item.area_id === areaId));
	}


	get_all_devices(): Promise<Device[]> {
		return this.get_array('config/device_registry/list')
			.then(items => items.map(item => Device.fromJSON(item)))
	}

	get_categories(scope: string): Promise<any[]> {
		return this.get_array('config/category_registry/list', { scope: scope });
	}

	get_areas(): Promise<Area[]> {
		return this.get_array('config/area_registry/list').then(items =>
			items.map(item => Area.fromJSON(item))
		);
	}

	get_triggers_for_device(deviceId: string): Promise<Trigger[]> {
		//{"type":"device_automation/trigger/list","device_id":"a0681f3f4a504e371f1758d9e9ccfdbf","id":2}

		return this.get_array('device_automation/trigger/list', {
			device_id: deviceId
		})
	}


	get_object(type: string, params?: any): Promise<any> {
		return this.get(type, params)
	}

	get_array(type: string, params?: any): Promise<any[]> {
		return this.get(type, params)
	}

	subscribe_trigger(device_id: string, trigger: string[]): [EventEmitter, WebSocket] {
		const ws = this.get_authenticated_ws();
		const emitter = new EventEmitter();

		ws.on('message', (event: MessageEvent) => {
			try {
				const data = JSON.parse(event.toString());

				if (data['success'] == false) {
					ws.close();
					emitter.emit('error', data['error']);
				} else {

					if (data['type'] == 'auth_ok') {
						ws.send(JSON.stringify({
							type: 'device_automation/trigger/list',
							id: 2,
							device_id: device_id
						}));
					}

					if (data['id'] == 2) {
						// we have the trigger list, find the trigger
						const triggerArray = data['result'].filter((t: Trigger) => trigger.includes(t.subtype));
						if (triggerArray) {
							const jsonString = JSON.stringify({
								type: 'subscribe_trigger',
								id: 3,
								trigger: triggerArray
							})
							ws.send(jsonString);
						}
					}

					if (data['id'] == 3 && data['type'] == 'event') {
						emitter.emit('event', data['event']);
					}
				}
			} catch (e) {
				emitter.emit('error', e);
				console.log('error', e);
			}
		})

		return [emitter, ws];

	}
	subscribe_events(type: string): [EventEmitter, WebSocket] {
		const ws = this.get_authenticated_ws();
		const emitter = new EventEmitter();

		ws.on('message', (event: MessageEvent) => {
			try {
				const data = JSON.parse(event.toString());

				if (data['success'] == false) {
					ws.close();
					emitter.emit('error', data['error']);
				} else {
					if (data['type'] == 'auth_ok') {

						ws.send(JSON.stringify({
							type: 'subscribe_events',
							event_type: type,
							id: 2
						}));
					}

					if (data['type'] == 'event') {
						emitter.emit('event', EventData.fromJSON(data['event']['data']));
					}
				}

			} catch (e) {
				emitter.emit('error', e);
				console.log('error', e);
			}
		})

		return [emitter, ws];
	}


	private get_authenticated_ws(): WebSocket {
		const url = 'ws://' + this.host + '/api/websocket';
		const ws = new WebSocket(url, {
			followRedirects: true,
		});

		Logger.info('WebSocket connection...');

		ws.on('message', (event: MessageEvent) => {
			const data = JSON.parse(event.toString());

			if (data['type'] == 'auth_required') {
				ws.send(JSON.stringify({
					type: 'auth',
					access_token: this.apiKey,
				}));
			}

			if (data['type'] == 'auth_ok') {
				Logger.info('WebSocket connection authenticated');
			}
		});
		return ws;

	}

	private do_get(type: string, params?: any, response: boolean = true): Promise<any> {
		///config/area_registry/list
		const resultPromise: Promise<any> = new Promise((resolve, reject) => {

			const ws = this.get_authenticated_ws();

			const request_id = 2;


			ws.on('message', (event: MessageEvent) => {
				try {
					const data = JSON.parse(event.toString());

					if (data['success'] == false) {
						ws.close();
						reject(new Error(data['error']['message']));
					} else {
						if (data['type'] == 'auth_ok') {
							const jsonString = JSON.stringify({
								type: type,
								id: request_id,
								...params
							})
							console.log(jsonString);
							ws.send(jsonString);

							if(!response) {
								resolve(
									[]
								);

								ws.close();
							}
						}


						if (data['type'] == 'result' && data['id'] == request_id) {
							resolve(
								data['result']
							);

							ws.close();
						}
					}

				} catch (e) {
					console.log('error', e);
					reject(e);
				}


			});

			ws.on('error', (error) => {
				ws.close();
				reject(error);
			});

			ws.on('close', () => {
				reject(new Error('WebSocket connection closed'));
			});
		});

		return resultPromise;
	}

	private call(type: string, params?: any, response: boolean = true): Promise<any> {
		return this.do_get(type, params, response)
	}

	get_single(type: string, params?: any): Promise<any> {
		return this.do_get(type, params)
	}

	get(type: string, params?: any): Promise<any[]> {
		return this.do_get(type, params).then(item => item as any[]);
	}

}
