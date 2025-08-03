
export class Area {
	aliases: string[];
	area_id: string;
	floor_id: string | null;
	humidity_entity_id: string | null;
	icon: string | null;
	labels: string[];
	name: string;
	picture: string | null;
	temperature_entity_id: string | null;
	created_at: number;
	modified_at: number;

	constructor(data?: Partial<Area>) {
		this.aliases = data?.aliases ?? [];
		this.area_id = data?.area_id ?? '';
		this.floor_id = data?.floor_id ?? null;
		this.humidity_entity_id = data?.humidity_entity_id ?? null;
		this.icon = data?.icon ?? null;
		this.labels = data?.labels ?? [];
		this.name = data?.name ?? '';
		this.picture = data?.picture ?? null;
		this.temperature_entity_id = data?.temperature_entity_id ?? null;
		this.created_at = data?.created_at ?? 0;
		this.modified_at = data?.modified_at ?? 0;
	}

	static fromJSON(json: any): Area {
		return new Area(json);
	}
}

