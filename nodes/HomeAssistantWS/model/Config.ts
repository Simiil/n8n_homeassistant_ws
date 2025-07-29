export class UnitSystem {
	length: string;
	accumulated_precipitation: string;
	area: string;
	mass: string;
	pressure: string;
	temperature: string;
	volume: string;
	wind_speed: string;

	constructor(data?: Partial<UnitSystem>) {
		this.length = data?.length ?? '';
		this.accumulated_precipitation = data?.accumulated_precipitation ?? '';
		this.area = data?.area ?? '';
		this.mass = data?.mass ?? '';
		this.pressure = data?.pressure ?? '';
		this.temperature = data?.temperature ?? '';
		this.volume = data?.volume ?? '';
		this.wind_speed = data?.wind_speed ?? '';
	}

	static fromJSON(json: any): UnitSystem {
		return new UnitSystem(json);
	}

};

export class Config {
	allowlist_external_dirs: string[];
	allowlist_external_urls: string[];
	components: string[];

	config_dir: string;
	config_source: string;
	country: string;
	currency: string;
	debug: boolean;
	elevation: number;
	external_url: string | null;
	internal_url: string | null;
	language: string;
	latitude: number;
	location_name: string;
	longitude: number;
	radius: number;
	recovery_mode: boolean;
	safe_mode: boolean;
	state: string;
	time_zone: string;
	unit_system: UnitSystem;
	version: string;
	whitelist_external_dirs: string[];
	whitelist_external_urls: string[];

	constructor(data?: Partial<Config>) {
		this.allowlist_external_dirs = data?.allowlist_external_dirs ?? [];
		this.allowlist_external_urls = data?.allowlist_external_urls ?? [];
		this.components = data?.components ?? [];
		this.config_dir = data?.config_dir ?? '';
		this.config_source = data?.config_source ?? '';
		this.country = data?.country ?? '';
		this.currency = data?.currency ?? '';
		this.debug = data?.debug ?? false;
		this.elevation = data?.elevation ?? 0;
		this.external_url = data?.external_url ?? null;
		this.internal_url = data?.internal_url ?? null;
		this.language = data?.language ?? '';
		this.latitude = data?.latitude ?? 0;
		this.location_name = data?.location_name ?? '';
		this.longitude = data?.longitude ?? 0;
		this.radius = data?.radius ?? 0;
		this.recovery_mode = data?.recovery_mode ?? false;
		this.safe_mode = data?.safe_mode ?? false;
		this.state = data?.state ?? '';
		this.time_zone = data?.time_zone ?? '';
		this.unit_system = UnitSystem.fromJSON(data?.unit_system) ?? new UnitSystem();
		this.version = data?.version ?? '';
		this.whitelist_external_dirs = data?.whitelist_external_dirs ?? [];
		this.whitelist_external_urls = data?.whitelist_external_urls ?? [];
	}

	static fromJSON(json: any): Config {
		return new Config(json);
	}
}
