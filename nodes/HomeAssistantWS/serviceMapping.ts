import { ILoadOptionsFunctions, INodePropertyOptions, ResourceMapperField, ResourceMapperFields } from "n8n-workflow";
import { HomeAssistant } from "./HomeAssistant";
import { ServiceAction } from "./model/ServiceAction";


export async function getMappingColumns(
	this: ILoadOptionsFunctions,
): Promise<ResourceMapperFields> {

	const serviceDomainId = this.getNodeParameter('serviceDomainId', null, { extractValue: true }) as string;
	const serviceId = this.getNodeParameter('serviceId', null, { extractValue: true }) as string;


	let fields: ResourceMapperField[] = [];

	if (!serviceDomainId || !serviceId) {
		return Promise.resolve({
			fields: [],
			emptyFieldsNotice: 'No service domain or service id provided',
		}
		);
	} else {
		const cred = await this.getCredentials('homeAssistantWsApi');

		const assistant = new HomeAssistant(cred.host, cred.apiKey)

		const service = await assistant.get_service_action(serviceDomainId, serviceId);

		if (!service) {
			return Promise.resolve({
				fields: [],
				emptyFieldsNotice: 'Service not found',
			})
		} else {
			if (service.target?.entity) { // TODO target devices
				fields.push({
					id: 'entity_id',
					displayName: 'Target Entity',
					type: 'string',
					defaultMatch: true,
					required: true,
					display: true,
				});
			}

			for (let f in service.fields) {
				if (f != 'advanced_fields') {
					fields.push(createMappedField(service, f, service.fields[f]));
				}
			}

			for (let f in service.fields?.advanced_fields?.fields) {

				fields.push(createMappedField(service, f, service.fields?.advanced_fields?.fields[f]));
			}

		}


		return Promise.resolve({
			fields: fields,
			// emptyFieldsNotice: 'No fields found',
		});
	}



}
function createMappedField(service: ServiceAction, f: string, fieldDesc: any): any {


	const type = Object.keys(fieldDesc.selector)[0];

	let fieldType:any = {
		type: "string"
	}

	switch (type) {
		case 'number':
		case 'color_temp':
			fieldType = {
				type: "number"
			}
			break;

		case 'rgb_color':
			case 'color_rgb':
		case 'object':
			fieldType = {
				type: "object"
			}
			break;

		case 'select':
			let options: INodePropertyOptions[] = [];
			fieldDesc.selector.select.options.forEach((o: string) => {
				options.push({
					name: o,
					value: o
				})
			});
			fieldType = {
				type: "options",
				options: options
			}
			break;

			case 'boolean':
				fieldType = {
					type: "boolean",

				}
				break;

			case 'entity':
				fieldType = {
					type: "object",
				}
				break;

	}

	return {
		id: f,
		displayName: fieldDesc.name ?? f,
		defaultMatch: true,
		required: false,
		display: true,
		...fieldType
	};
}

