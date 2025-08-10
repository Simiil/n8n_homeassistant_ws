import { IDataObject, IExecuteFunctions, INodeExecutionData } from "n8n-workflow";

export function mapResults(t: IExecuteFunctions, items: IDataObject[], results: any[]): INodeExecutionData[][] {
	const mappedResults: INodeExecutionData[][] = [];

	for (let i = 0; i < items.length; i++) {
		const arr = results[i];
		mappedResults.push(t.helpers.constructExecutionMetaData(
			t.helpers.returnJsonArray(arr),
			{ itemData: { item: i } }
		));
	};


	return mappedResults;
}


export function mapResultToAll(t: IExecuteFunctions, items: IDataObject[], results: any): INodeExecutionData[][] {
	const mappedResults: INodeExecutionData[][] = [];

	for (let i = 0; i < items.length; i++) {
		const arr = results;
		mappedResults.push(t.helpers.constructExecutionMetaData(
			t.helpers.returnJsonArray(arr),
			{ itemData: { item: i } }
		));
	};


	return mappedResults;
}


