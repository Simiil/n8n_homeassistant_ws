import { ILoadOptionsFunctions, INodePropertyOptions } from "n8n-workflow";
import { HomeAssistant } from "./HomeAssistant";


export async function load_component_options(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {

	const cred = await this.getCredentials('homeAssistantWsApi');
	const assistant = new HomeAssistant(cred.host, cred.apiKey)
	const components = await assistant.get_components()
	return components.map(component => ({ name: component, value: component }))

	// return Promise.resolve([{ name: 'Test', value: 'test' }]);
}

export async function load_service_options(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {

	const cred = await this.getCredentials('homeAssistantWsApi');
	const assistant = new HomeAssistant(cred.host, cred.apiKey)
	const domain = this.getNodeParameter('serviceDomain', "") as string
	const services = await assistant.get_service_actions(domain)

	return services.map(service => ({ name: service.name, value: service.id, description: service.description }))
}


export async function load_service_domain_options(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {

	const cred = await this.getCredentials('homeAssistantWsApi');
	const assistant = new HomeAssistant(cred.host, cred.apiKey)
	const services = await assistant.get_service_domains()

	return services.map(service => ({ name: service, value: service }))
}

export async function load_entity_options(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {

	const cred = await this.getCredentials('homeAssistantWsApi');
	const assistant = new HomeAssistant(cred.host, cred.apiKey)
	const components = await assistant.get_all_entities()
	const devices = await assistant.get_all_devices()

	return components.map(entity => {
		const device = devices.find(d => d.id == entity.device_id)
		// const description = [device?.name, entity.entity_id].filter(Boolean).join(': ')

		const entityName = entity.name ?? entity.original_name;
		const deviceName = device?.name_by_user ?? device?.name;

		if (entityName) {
			// we have an entity name, use the device name as description
			const description = [device?.name, entity.entity_id].filter(Boolean).join(': ')
			return ({ name: entityName??'', value: entity.entity_id, description: description })
		} else {
			const description = [entity.entity_id].filter(Boolean).join(': ')
			return ({ name: deviceName??'', value: entity.entity_id, description: description })
		}
	})
}


export async function load_device_options(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {

	const cred = await this.getCredentials('homeAssistantWsApi');
	const assistant = new HomeAssistant(cred.host, cred.apiKey)
	const components = await assistant.get_all_devices()

	return components.map(component => {
		return ({ name: component.name ?? '', value: component.id, description: component.model ?? '' })
	})
}

export async function load_trigger_options(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const deviceId = this.getNodeParameter('deviceId', null, {});
	if (!deviceId) {
		return Promise.resolve([]);
	}

	const cred = await this.getCredentials('homeAssistantWsApi');
	const assistant = new HomeAssistant(cred.host, cred.apiKey)
	const triggers = await assistant.get_triggers_for_device(deviceId as string)

	return triggers.map(trigger => {
		return ({ name: trigger.subtype ?? '', value: trigger.subtype, description: trigger.type ?? '' })
	})
}

export async function load_area_options(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {

	const cred = await this.getCredentials('homeAssistantWsApi');
	const assistant = new HomeAssistant(cred.host, cred.apiKey)
	const components = await assistant.get_areas()
	return components.map(area => ({ name: area.name, value: area.area_id }))
}
