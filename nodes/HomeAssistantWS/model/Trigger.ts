
export class Trigger {

	platform: string;
	type: string;
	subtype?: string;
	device_id: string;
	entity_id?: string;
	domain: string;
	metadata: any;

	constructor(data?: Partial<Trigger>) {
		this.platform = data?.platform ?? '';
		this.domain = data?.domain ?? '';
		this.device_id = data?.device_id ?? '';
		this.subtype = data?.subtype;
		this.type = data?.type ?? '';
		this.entity_id = data?.entity_id;
		this.metadata = data?.metadata ?? {};
	}

	static fromJSON(json: any): Trigger {
		return new Trigger(json);
	}

	getId(): string {
		return [this.device_id, this.entity_id, this.type, this.subtype].filter(Boolean).join('/')
	}

	getName(): string {
		return [this.type, this.subtype].filter(Boolean).join(': ')
	}
}
