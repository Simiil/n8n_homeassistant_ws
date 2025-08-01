type Observer<T> = (value: T) => void;

export class SocketConnection<T>{
	close() {
		this.isClosed = true;
		this.observers = [];
		this.rejectors.forEach(reject => reject(new Error('SocketConnection is closed')));
		this.rejectors = [];
	}

	private isReady: boolean = false;
	private isClosed: boolean = false;

	private observers: Observer<T>[] = [];
	private rejectors: ((error: any) => void)[] = [];


	constructor(private obj: T) {

	}


  get(): Promise<T> {

		if (this.isReady) {
			return Promise.resolve(this.obj)
		} else if (this.isClosed) {
			return Promise.reject(new Error('SocketConnection is closed'));
		} else {

			return new Promise((resolve, reject) => {
				this.observers.push(resolve);
				this.rejectors.push(reject);
			});
		}
	}

	then<TResult1 = T>(observer: ((value: T) => TResult1 | PromiseLike<TResult1>)): Promise<TResult1> {
		return this.get().then(observer)
	}

	ready() {
		this.isReady = true;
		this.observers.forEach(observer => observer(this.obj));
		this.observers = [];
		this.rejectors = [];
	}

}
