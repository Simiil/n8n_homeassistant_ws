import { ILoadOptionsFunctions, INodeListSearchResult, INodePropertyOptions } from "n8n-workflow";
import { HomeAssistant } from "./HomeAssistant";



async function map_options_to_search(
	this: ILoadOptionsFunctions,
	fn: (this: ILoadOptionsFunctions) => Promise<INodePropertyOptions[]>,
	filter?: string,
): Promise<INodeListSearchResult> {
	console.log('search_component_options', filter);

	return await fn.call(this).then(res => {
		let results: INodePropertyOptions[]

		if(filter){
			results = res.filter(r =>
				r.name.toLowerCase().includes(filter?.toLowerCase() ?? '') ||
				r.value?.toString().toLowerCase().includes(filter?.toLowerCase() ?? '') ||
				r.description?.toLowerCase().includes(filter?.toLowerCase() ?? '')
			)
		}else{
			results = res
		}

		return {
			results: results
		}
	})
}

export async function load_component_options(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {

	const cred = await this.getCredentials('homeAssistantWsApi');
	return new HomeAssistant(cred.host, cred.apiKey).oneShot(async assistant => {
		const components = await assistant.get_components()
		return components.map(component => ({ name: component, value: component }))
	})
}

export async function search_component_options(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	return await map_options_to_search.call(this, load_component_options, filter)
}


export async function load_service_options(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {

	const cred = await this.getCredentials('homeAssistantWsApi');
	return new HomeAssistant(cred.host, cred.apiKey).oneShot(async assistant => {
		const domain = this.getNodeParameter('serviceDomain', "", {extractValue: true}) as string
		const services = await assistant.get_service_actions(domain)

		return services.map(service => ({ name: service.name, value: service.id, description: service.description }))
	})
}

export async function search_service_options(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	return await map_options_to_search.call(this, load_service_options, filter)
}


export async function load_service_domain_options(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {

	const cred = await this.getCredentials('homeAssistantWsApi');
	return new HomeAssistant(cred.host, cred.apiKey).oneShot(async assistant => {
		const services = await assistant.get_service_domains()

		return services.map(service => ({ name: service, value: service }))
	})
}


export async function search_service_domain_options(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	return await map_options_to_search.call(this, load_service_domain_options, filter)
}


export async function load_entity_options(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const cred = await this.getCredentials('homeAssistantWsApi');
	return new HomeAssistant(cred.host, cred.apiKey).oneShot(async assistant => {
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
				return ({ name: entityName ?? '', value: entity.entity_id, description: description })
			} else {
				const description = [entity.entity_id].filter(Boolean).join(': ')
				return ({ name: deviceName ?? '', value: entity.entity_id, description: description })
			}
		})
	})
}


export async function search_entity_options(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	return await map_options_to_search.call(this, load_entity_options, filter)
}



export async function load_device_options(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {

	const cred = await this.getCredentials('homeAssistantWsApi');
	return new HomeAssistant(cred.host, cred.apiKey).oneShot(async assistant => {
		const components = await assistant.get_all_devices()

		return components.map(component => {
			return ({ name: component.name ?? '', value: component.id, description: component.model ?? '' })
		})
	})
}


export async function search_device_options(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	return await map_options_to_search.call(this, load_device_options, filter)
}



export async function load_trigger_options(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const deviceId = this.getNodeParameter('deviceId', null, {});
	if (!deviceId) {
		return Promise.resolve([]);
	}

	const cred = await this.getCredentials('homeAssistantWsApi');
	return new HomeAssistant(cred.host, cred.apiKey).oneShot(async assistant => {
		const triggers = await assistant.get_triggers_for_device(deviceId as string)
		console.log('triggers', triggers);
		return triggers.map(trigger => {

			return ({ name: trigger.getName(), value: trigger.getId(), description: trigger.domain ?? '' })
		})
	}).then(options => {
		console.log('options', options);
		return options;
	})
}


export async function search_trigger_options(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	return await map_options_to_search.call(this, load_trigger_options, filter)
}


export async function load_area_options(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {

	const cred = await this.getCredentials('homeAssistantWsApi');
	return new HomeAssistant(cred.host, cred.apiKey).oneShot(async assistant => {
		const components = await assistant.get_areas()
		return components.map(area => ({ name: area.name, value: area.area_id }))
	})
}


export async function search_area_options(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	return await map_options_to_search.call(this, load_area_options, filter)
}

