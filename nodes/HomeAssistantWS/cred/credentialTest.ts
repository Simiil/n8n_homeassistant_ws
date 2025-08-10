import { ICredentialsDecrypted, ICredentialTestFunctions, INodeCredentialTestResult } from "n8n-workflow"
import { HomeAssistant } from "../HomeAssistant"

export async function homeAssistantWsApiTest(
	this: ICredentialTestFunctions,
	credential: ICredentialsDecrypted,
): Promise<INodeCredentialTestResult> {
	console.log('test credential')
	if (!credential.data?.host) {
		return Promise.resolve({
			status: 'Error',
			message: 'Host is required',
		})
	}
	if (!credential.data?.apiKey) {
		return Promise.resolve({
			status: 'Error',

			message: 'API key is required',
		})
	}
	const assistant = new HomeAssistant(credential.data.host, credential.data.apiKey)
	await assistant.get_states()
	return Promise.resolve({
		status: 'OK',
		message: 'Connection successful',
	})
}
