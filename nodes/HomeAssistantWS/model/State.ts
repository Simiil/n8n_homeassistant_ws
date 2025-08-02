// {
// 	"entity_id": "update.0x0017880109e638d3",
// 	"state": "off",
// 	"attributes": {
// 		"auto_update": false,
// 		"display_precision": 0,
// 		"installed_version": "16786690",
// 		"in_progress": false,
// 		"latest_version": "16786690",
// 		"release_summary": null,
// 		"release_url": null,
// 		"skipped_version": null,
// 		"title": null,
// 		"update_percentage": null,
// 		"device_class": "firmware",
// 		"entity_picture": "https://github.com/Koenkk/zigbee2mqtt/raw/master/images/logo.png",
// 		"friendly_name": "Hue Go Livingroom Left",
// 		"supported_features": 5
// 	},
// 	"last_changed": "2025-07-21T20:18:12.963136+00:00",
// 	"last_reported": "2025-07-21T20:18:12.963136+00:00",
// 	"last_updated": "2025-07-21T20:18:12.963136+00:00",
// 	"context": {
// 		"id": "01K0QA61V3TX2QMM1DPTMM2T4K",
// 		"parent_id": null,
// 		"user_id": null
// 	}
// },

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
