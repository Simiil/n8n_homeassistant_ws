

export class Entity {
	area_id: string | null;
	categories: Record<string, any>;
	config_entry_id: string;
	config_subentry_id: string | null;
	created_at: number;
	device_id: string;
	disabled_by: string | null;
	entity_category: string;
	entity_type: string;
	entity_name_id: string;
	entity_id: string;
	has_entity_name: boolean;
	hidden_by: string | null;
	icon: string | null;
	id: string;
	labels: string[];
	modified_at: number;
	name: string | null;
	options: Record<string, any>;
	original_name: string | null;
	platform: string;
	translation_key: string | null;
	unique_id: string;

	constructor(data?: Partial<Entity>) {
		this.area_id = data?.area_id ?? null;
		this.categories = data?.categories ?? {};
		this.config_entry_id = data?.config_entry_id ?? '';
		this.config_subentry_id = data?.config_subentry_id ?? null;
		this.created_at = data?.created_at ?? 0;
		this.device_id = data?.device_id ?? '';
		this.disabled_by = data?.disabled_by ?? null;
		this.entity_category = data?.entity_category ?? '';
		this.entity_id = data?.entity_id ?? '';
		this.has_entity_name = data?.has_entity_name ?? false;
		this.hidden_by = data?.hidden_by ?? null;
		this.icon = data?.icon ?? null;
		this.id = data?.id ?? '';
		this.labels = data?.labels ?? [];
		this.modified_at = data?.modified_at ?? 0;
		this.name = data?.name ?? null;
		this.options = data?.options ?? {};
		this.original_name = data?.original_name ?? null;
		this.platform = data?.platform ?? '';
		this.translation_key = data?.translation_key ?? null;
		this.unique_id = data?.unique_id ?? '';

		const [type, ...rest] = this.entity_id.split('.')
		this.entity_type = type
		this.entity_name_id = rest.join('.')
	}

	/**
	 * Create an Entity instance from JSON data
	 */
	static fromJSON(json: any): Entity {
		return new Entity(json);
	}

	// /**
	//  * Convert the Entity instance to a plain object
	//  */
	// toJSON(): Record<string, any> {
	// 	return {
	// 		area_id: this.area_id,
	// 		categories: this.categories,
	// 		config_entry_id: this.config_entry_id,
	// 		config_subentry_id: this.config_subentry_id,
	// 		created_at: this.created_at,
	// 		device_id: this.device_id,
	// 		disabled_by: this.disabled_by,
	// 		entity_category: this.entity_category,
	// 		entity_id: this.entity_id,
	// 		has_entity_name: this.has_entity_name,
	// 		hidden_by: this.hidden_by,
	// 		icon: this.icon,
	// 		id: this.id,
	// 		labels: this.labels,
	// 		modified_at: this.modified_at,
	// 		name: this.name,
	// 		options: this.options,
	// 		original_name: this.original_name,
	// 		platform: this.platform,
	// 		translation_key: this.translation_key,
	// 		unique_id: this.unique_id,
	// 	};
	// }
}
