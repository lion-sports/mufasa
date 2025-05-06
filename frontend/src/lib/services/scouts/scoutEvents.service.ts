import { FetchBasedService } from '$lib/services/common/fetchBased.service'
import cuid2 from '@paralleldrive/cuid2'
import type { VolleyballScoutEventParameters } from './volleyball'
import { Subject } from 'rxjs'
import { concatMap } from 'rxjs/operators'
import { toast } from 'svelte-sonner'
import { browser } from '$app/environment'

let subject = new Subject<{
	event: VolleyballScoutEventParameters
	service: ScoutEventsService
	clientIdentifier: string
}>()
subject
	.pipe(
		concatMap(async (e) => {
			let retryIndex: number = 0
			while (retryIndex < 3) {
				try {
					await e.service.add({ event: e.event, clientIdentifier: e.clientIdentifier })
					e.service.moveToStatus({
						clientIdentifier: e.clientIdentifier,
						status: 'succeed'
					})
					return e
				} catch (e) {
					retryIndex += 1
				}
			}

			toast.error('Evento non recapitato per troppi tentativi falliti')
			e.service.moveToStatus({
				clientIdentifier: e.clientIdentifier,
				status: 'failed'
			})
		})
	)
	.subscribe(() => {
		eventsPendingNumber -= 1
	})

export let eventsPendingNumber: number = 0

export const IDB_SCOUT_EVENTS_STORE_NAME = 'scout_events'

export default class ScoutEventsService extends FetchBasedService {
	public async add(params: {
		event: VolleyballScoutEventParameters
		clientIdentifier: string
	}): Promise<void> {
		let response = await this.client.post({
			url: `/scouts/${params.event.scoutId}/events/add`,
			body: params
		})

		return response
	}

	public async enqueueAdd(params: { event: VolleyballScoutEventParameters }): Promise<void> {
		let clientIdentifier: string = cuid2.createId()

		let idb: IDBDatabase | undefined = undefined
		try {
			idb = await this.getIndexedDB()
		} catch (e) {}

		try {
			if (!!idb) {
				const transaction = idb.transaction(IDB_SCOUT_EVENTS_STORE_NAME, 'readwrite')
				const objectStore = transaction.objectStore(IDB_SCOUT_EVENTS_STORE_NAME)
				console.log({
					event: params.event,
					clientIdentifier,
					status: 'pending'
				})
				objectStore.add(
					JSON.parse(
						JSON.stringify({
							event: params.event,
							clientIdentifier,
							status: 'pending'
						})
					)
				)
			}
		} catch (e) {
			console.error(e)
		}

		subject.next({ event: params.event, service: this, clientIdentifier })
		eventsPendingNumber += 1
	}

	private getIndexedDB(): Promise<IDBDatabase> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open('mufasa', 1)
			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result

				if (!db.objectStoreNames.contains(IDB_SCOUT_EVENTS_STORE_NAME)) {
					const objectStore = db.createObjectStore(IDB_SCOUT_EVENTS_STORE_NAME, {
						keyPath: 'id',
						autoIncrement: true
					})

					objectStore.createIndex('clientIdentifier', 'clientIdentifier', { unique: true })
					objectStore.createIndex('status', 'status', { unique: false })
				}
			}

			request.onsuccess = (event) => {
				const db = (event.target as IDBOpenDBRequest).result
				resolve(db)
			}

			request.onerror = (event) => {
				let error = (event.target as IDBOpenDBRequest).error
				reject(error)
			}
		})
	}

	public moveToStatus(params: {
		clientIdentifier: string
		status: 'succeed' | 'pending' | 'failed'
	}): Promise<void> {
		return new Promise(async (resolve, reject) => {
			let idb: IDBDatabase | undefined = undefined
			try {
				idb = await this.getIndexedDB()
			} catch (e) {}

			if (!!idb) {
				const transaction = idb.transaction(IDB_SCOUT_EVENTS_STORE_NAME, 'readwrite')
				const objectStore = transaction.objectStore(IDB_SCOUT_EVENTS_STORE_NAME)

				let clientIdentifierIndex = objectStore.index('clientIdentifier')
				const searchRequest = clientIdentifierIndex.get(params.clientIdentifier)

				searchRequest.onsuccess = () => {
					let result = searchRequest.result

					if (!!result) {
						if (params.status == 'succeed') {
							const deleteRequest = objectStore.delete(result.id)

							deleteRequest.onsuccess = () => resolve()
							deleteRequest.onerror = (err) => reject(err)
						} else {
							result.status = params.status
							const putRequest = objectStore.put(result)

							putRequest.onsuccess = () => resolve()
							putRequest.onerror = (err) => reject(err)
						}
					}
				}

				searchRequest.onerror = (err) => reject(err)
			}
		})
	}

	public delete(params: { clientIdentifier: string }): Promise<void> {
		return new Promise(async (resolve, reject) => {
			let idb: IDBDatabase | undefined = undefined
			try {
				idb = await this.getIndexedDB()
			} catch (e) {}

			if (!!idb) {
				const transaction = idb.transaction(IDB_SCOUT_EVENTS_STORE_NAME, 'readwrite')
				const objectStore = transaction.objectStore(IDB_SCOUT_EVENTS_STORE_NAME)

				let clientIdentifierIndex = objectStore.index('clientIdentifier')
				const searchRequest = clientIdentifierIndex.get(params.clientIdentifier)

				searchRequest.onsuccess = () => {
					let result = searchRequest.result

					if (!!result) {
						const deleteRequest = objectStore.delete(result.id)

						deleteRequest.onsuccess = () => resolve()
						deleteRequest.onerror = (err) => reject(err)
					}
				}

				searchRequest.onerror = (err) => reject(err)
			}
		})
	}

	public retriesFailedEvents(): Promise<void> {
		return new Promise(async (resolve, reject) => {
			let idb: IDBDatabase | undefined = undefined
			try {
				idb = await this.getIndexedDB()
			} catch (e) {}

			if (!!idb) {
				const transaction = idb.transaction(IDB_SCOUT_EVENTS_STORE_NAME, 'readwrite')
				const objectStore = transaction.objectStore(IDB_SCOUT_EVENTS_STORE_NAME)

				let statusIndex = objectStore.index('status')
				const searchRequest = statusIndex.getAll('failed')

				searchRequest.onsuccess = () => {
					let results = searchRequest.result

					if (!!results && results.length > 0) {
						for (let i = 0; i < results.length; i += 1) {
							let row = results[i]
							this.delete({ clientIdentifier: row.clientIdentifier }).then(() => {
								this.enqueueAdd({ event: row.event })
							})
						}
					}
				}

				searchRequest.onerror = (err) => reject(err)
			}
		})
	}
}

if (browser) {
	try {
		let scoutEventService = new ScoutEventsService({ fetch })
		scoutEventService.retriesFailedEvents()
	} catch (e) {}
}
