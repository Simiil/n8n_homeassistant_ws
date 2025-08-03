
import { Entity } from "./Entity";

export class State {
	entity_id: string;
	state: string;
	attributes: any;
	last_changed: string;
	last_reported: string;
	last_updated: string;
	context: any;

	entity?: Entity;

	static fromJSON(json: any): State {
		return Object.assign(new State(), json);
	}

	constructor(data?: Partial<State>) {
		this.entity_id = data?.entity_id ?? '';
		this.state = data?.state ?? '';
		this.attributes = data?.attributes ?? {};
		this.last_changed = data?.last_changed ?? '';
		this.last_reported = data?.last_reported ?? '';
		this.last_updated = data?.last_updated ?? '';
		this.context = data?.context ?? {};
	}
}
