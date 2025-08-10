//  {
// 	name: 'Turn on',
// 	description: 'Turns on one or more lights and adjusts their properties, even when they are turned on already.',
// 	fields: {
// 		transition: [Object],
// 		rgb_color: [Object],
// 		color_temp_kelvin: [Object],
// 		brightness_pct: [Object],
// 		brightness_step_pct: [Object],
// 		effect: [Object],
// 		advanced_fields: [Object]
// 	},
// 	target: { entity: [Array] },
// 	id: 'turn_on',
// 	domain: 'light'
// },


export class ServiceAction {
	name: string;
	description: string;
	fields: Record<string, any>;
	target: Record<string, any>;
	id: string;
	domain: string;

	constructor(data?: Partial<ServiceAction>) {
		this.name = data?.name ?? '';
		this.description = data?.description ?? '';
		this.fields = data?.fields ?? {};
		this.target = data?.target ?? {};
		this.id = data?.id ?? '';
		this.domain = data?.domain ?? '';
	}

	static fromJSON(json: any): ServiceAction {
		return new ServiceAction(json);
	}
}
