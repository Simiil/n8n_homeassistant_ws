
import { State } from "./State";



export class EventData {
	entity_id: string;
	old_state: State;
	new_state: State;

	constructor(data?: Partial<EventData>) {
		this.entity_id = data?.entity_id ?? '';
		this.old_state = State.fromJSON(data?.old_state) ?? new State();
		this.new_state = State.fromJSON(data?.new_state) ?? new State();
	}

	static fromJSON(json: any): EventData {
		return new EventData(json);
	}
}
