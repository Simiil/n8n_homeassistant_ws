import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';



export class HomeAssistantWsApi implements ICredentialType {
	name = 'homeAssistantWsApi';
	displayName = 'HomeAssistant WS API';
	properties: INodeProperties[] = [
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: 'homeassistant.local:8123',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];
	documentationUrl = 'https://developers.home-assistant.io/docs/api/websocket';

	// authenticate: IAuthenticateGeneric = {
	// 	type: 'generic',
	// 	properties: {
	// 		headers: {
	// 			Authorization: '=Bearer {{$credentials.apiKey}}',
	// 		},
	// 	},
	// };

	// test: ICredentialTestRequest = {
	// 	request: {
	// 		baseURL: 'https://api.sendgrid.com/v3',
	// 		url: '/marketing/contacts',
	// 	},
	// };
}
