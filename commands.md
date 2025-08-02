call_service
entity_source
execute_script
fire_event
get_config
get_services
get_states
manifest_get
integration_setup_info
manifest_list
ping
render_template
subscribe_bootstrap_integrations
subscribe_condition_platforms
subscribe_events
subscribe_trigger
subscribe_trigger_platforms
test_condition
unsubscribe_events
validate_config
subscribe_entities
supported_features
integration_descriptions
integration_wait

## more


ai_task/preferences/get: 
	Get AI task preferences.

ai_task/preferences/set
	Set AI task preferences

analytics
	Return analytics preferences.
analytics/preferences
	Update analytics preferences.

application_credentials/config
	Handle integrations command.
application_credentials/config_entry
	Return application credentials information for a config entry

assist_pipeline/run
	Run a pipeline.

### Assist pipeline Websocket API. `core/homeassistant/components/assist_pipeline/websocket_api.py`

assist_pipeline/pipeline_debug/list
	List pipeline runs for which debug data is available.
assist_pipeline/device/list
	List assist devices.
assist_pipeline/pipeline_debug/get
	Get debug data for a pipeline run.
assist_pipeline/language/list
	List languages which are supported by a complete pipeline.

    This will return a list of languages which are supported by at least one stt, tts
    and conversation engine respectively.
assist_pipeline/device/capture
	Capture raw audio from a satellite device and forward to client.

### Assist satellite Websocket API.

### auth

auth/current_user
	Return the current user.
auth/long_lived_access_token
	Create or a long-lived access token.
auth/refresh_tokens
	Return metadata of users refresh tokens.
auth/delete_refresh_token
	Handle a delete refresh token request.
auth/delete_all_refresh_tokens
	Handle delete all refresh tokens request.
auth/sign_path
	Handle a sign path request.
auth/refresh_token_set_expiry
	Handle a set expiry of a refresh token request.

### automation
automation/config
	Get automation config

### Backup `core/homeassistant/components/backup/websocket.py`

### Blueprint `core/homeassistant/components/blueprint/websocket_api.py`

### Bluetooth `core/homeassistant/components/bluetooth/websocket_api.py`

### Calendar `core/homeassistant/components/calendar/__init__.py`

### Camera `core/homeassistant/components/camera/__init__.py`

### Camera WebRTC `core/homeassistant/components/camera/webrtc.py`

### Cloud `core/homeassistant/components/cloud/http_api.py`

### Area `core/homeassistant/components/config/area_registry.py`

config/area_registry/list
	Handle list areas command.
config/area_registry/create
	Create area command.
config/area_registry/delete
	Delete area command.
config/area_registry/update
	Handle update area websocket command.

### Auth Provider `core/homeassistant/components/config/auth_provider_homeassistant.py`

### Auth Config `core/homeassistant/components/config/auth.py`

### Category

config/category_registry/list
	Handle list categories command.
config/category_registry/create
	Create category command.
config/category_registry/delete
	Delete category command.
config/category_registry/update
	Handle update category websocket command.

### Config Entries `core/homeassistant/components/config/config_entries.py`

### Core config `core/homeassistant/components/config/core.py`


### Device Registry `core/homeassistant/components/config/device_registry.py`
config/device_registry/list
	Handle list devices command.
config/device_registry/update
	Handle update device websocket command.
config/device_registry/remove_config_entry
	Remove config entry from a device.

### Entity Registry `core/homeassistant/components/config/entity_registry.py`
config/entity_registry/list
	Handle list registry entries command.
config/entity_registry/list_for_display
	Handle list registry entries command.
config/entity_registry/get
	Handle get entity registry entry command.

    Async friendly.
config/entity_registry/get_entries
	Handle get entity registry entries command.

    Async friendly.
config/entity_registry/update
	Handle update entity websocket command.

    Async friendly.
config/entity_registry/remove
	Handle remove entity websocket command.

    Async friendly.
config/entity_registry/get_automatic_entity_ids
	Return the automatic entity IDs for the given entity IDs.

    This is used to help user reset entity IDs which have been customized by the user.

### Floor Registry `core/homeassistant/components/config/floor_registry.py`

config/floor_registry/list
	Handle list floors command.
config/floor_registry/create
	Create floor command.
config/floor_registry/delete
	Delete floor command.
config/floor_registry/update
	Handle update floor websocket command.

### Label Registry `core/homeassistant/components/config/label_registry.py`

### Conversation `core/homeassistant/components/conversation/http.py`

### Device Automation
device_automation/action/list
	Handle request for device actions.
device_automation/condition/list
	Handle request for device conditions.
device_automation/trigger/list
	Handle request for device triggers
device_automation/action/capabilities
	Handle request for device action capabilities.
device_automation/condition/capabilities
	Handle request for device condition capabilities
device_automation/trigger/capabilities
	Handle request for device trigger capabilities.

### DHCP `core/homeassistant/components/dhcp/websocket_api.py`
dhcp/subscribe_discovery

### Diagnostics `core/homeassistant/components/diagnostics/__init__.py`

### Dynalite `core/homeassistant/components/dynalite/panel.py`

### Energy `core/homeassistant/components/energy/websocket_api.py`

### Frontend `core/homeassistant/components/frontend/__init__.py`

### Frontend Storage `core/homeassistant/components/frontend/storage.py`

### Config Flow `core/homeassistant/components/generic/config_flow.py`

generic_camera/start_preview
	Generate websocket handler for the camera still/stream preview

### Group `core/homeassistant/components/group/config_flow.py`

### Hardware `core/homeassistant/components/hardware/websocket_api.py`

### HASSIO `core/homeassistant/components/hassio/websocket_api.py`

### History `core/homeassistant/components/history/websocket_api.py`

history/history_during_period
	Handle history during period websocket command.
history/stream
	Handle history stream websocket command.

### History Stats `core/homeassistant/components/history_stats/config_flow.py`
history_stats/start_preview
	Generate a preview.

### Exposed Entities `core/homeassistant/components/homeassistant/exposed_entities.py`

### Insteon ALDB `core/homeassistant/components/insteon/api/aldb.py`

### Insteon Config `core/homeassistant/components/insteon/api/config.py`

### Insteon API `core/homeassistant/components/insteon/api/device.py`

### Insteon Properties `core/homeassistant/components/insteon/api/properties.py`

### Insteon Scenes `core/homeassistant/components/insteon/api/scenes.py`

### KNX `core/homeassistant/components/knx/websocket.py`

### LCN `core/homeassistant/components/lcn/websocket.py`

### Logbook `core/homeassistant/components/logbook/websocket_api.py`

### Logger `core/homeassistant/components/logger/websocket_api.py`

### Lovelace `core/homeassistant/components/lovelace/websocket.py`

### Matter `core/homeassistant/components/matter/api.py`

### Media Player `core/homeassistant/components/media_player/__init__.py`

### Media Source `core/homeassistant/components/media_source/__init__.py`

### Media Source Local `core/homeassistant/components/media_source/local_source.py`

### Mold Indicator `core/homeassistant/components/mold_indicator/config_flow.py`

### MQTT `core/homeassistant/components/mqtt/__init__.py`

### Network `core/homeassistant/components/network/websocket.py`

### Number `core/homeassistant/components/number/websocket_api.py`

### OTBR `core/homeassistant/components/otbr/websocket_api.py`

### Persistent Notification `core/homeassistant/components/persistent_notification/__init__.py`

persistent_notification/get
	Return a list of persistent_notifications.

persistent_notification/subscribe
	Return a list of persistent_notifications.

### Recorder `core/homeassistant/components/recorder/basic_websocket_api.py`

### Recorder API `core/homeassistant/components/recorder/websocket_api.py`

### Repairs `core/homeassistant/components/repairs/websocket_api.py`

### Scripts `core/homeassistant/components/script/__init__.py`

### Search `core/homeassistant/components/search/__init__.py`

### Sensor `core/homeassistant/components/sensor/websocket_api.py`

### Shopping List `core/homeassistant/components/shopping_list/__init__.py`

### SSDP `core/homeassistant/components/ssdp/websocket_api.py`

### Statistics `core/homeassistant/components/statistics/config_flow.py`

### STT `core/homeassistant/components/stt/__init__.py`

### System Health `core/homeassistant/components/system_health/__init__.py`

### System Log `core/homeassistant/components/system_log/__init__.py`

### Template `core/homeassistant/components/template/config_flow.py`

### Thread `core/homeassistant/components/thread/websocket_api.py`

### Threshold `core/homeassistant/components/threshold/config_flow.py`

### TODO `core/homeassistant/components/todo/__init__.py`

### Trace `core/homeassistant/components/trace/websocket_api.py`

### TTS `core/homeassistant/components/tts/__init__.py`

### Update `core/homeassistant/components/update/__init__.py`

### USB `core/homeassistant/components/usb/__init__.py`

### Wake Word `core/homeassistant/components/wake_word/__init__.py`

### Weather `core/homeassistant/components/weather/websocket_api.py`

### Webhook `core/homeassistant/components/webhook/__init__.py`

### Wyoming `core/homeassistant/components/wyoming/websocket_api.py`

### Zeroconf `core/homeassistant/components/zeroconf/websocket_api.py`

### ZHA `core/homeassistant/components/zha/websocket_api.py`

### Zwave `core/homeassistant/components/zwave_js/api.py`
