
export class Trigger {
	platform: string;
	domain: string;
	device_id: string;
	type: string;
	subtype: string;
	metadata: any;

	constructor(data?: Partial<Trigger>) {
		this.platform = data?.platform ?? '';
		this.domain = data?.domain ?? '';
		this.device_id = data?.device_id ?? '';
		this.type = data?.type ?? '';
		this.subtype = data?.subtype ?? '';
		this.metadata = data?.metadata ?? {};
	}

	static fromJSON(json: any): Trigger {
		return new Trigger(json);
	}
}
