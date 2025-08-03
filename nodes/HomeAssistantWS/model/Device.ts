

export class Device {
	area_id: string;
	configuration_url: string | null;
	config_entries: string[];
	config_entries_subentries: Record<string, string | null>;
	connections: string[];
	created_at: number;
	disabled_by: string | null;
	entry_type: string | null;
	hw_version: string;
	id: string;
	identifiers: string[][];
	labels: string[];
	manufacturer: string;
	model: string;
	model_id: string;
	modified_at: number;
	name_by_user: string | null;
	name: string;
	primary_config_entry: string;
	serial_number: string | null;
	sw_version: string;
	via_device_id: string | null;

	static fromJSON(json: any): Device {
		return new Device(json);
	}
	constructor(data?: Partial<Device>) {
		this.area_id = data?.area_id ?? '';
		this.configuration_url = data?.configuration_url ?? null;
		this.config_entries = data?.config_entries ?? [];
		this.config_entries_subentries = data?.config_entries_subentries ?? {};
		this.connections = data?.connections ?? [];
		this.created_at = data?.created_at ?? 0;
		this.disabled_by = data?.disabled_by ?? null;
		this.entry_type = data?.entry_type ?? null;
		this.hw_version = data?.hw_version ?? '';
		this.id = data?.id ?? '';
		this.identifiers = data?.identifiers ?? [];
		this.labels = data?.labels ?? [];
		this.manufacturer = data?.manufacturer ?? '';
		this.model = data?.model ?? '';
		this.model_id = data?.model_id ?? '';
		this.modified_at = data?.modified_at ?? 0;
		this.name_by_user = data?.name_by_user ?? null;
		this.name = data?.name ?? '';
		this.primary_config_entry = data?.primary_config_entry ?? '';
		this.serial_number = data?.serial_number ?? null;
		this.sw_version = data?.sw_version ?? '';
		this.via_device_id = data?.via_device_id ?? null;
	}
}
