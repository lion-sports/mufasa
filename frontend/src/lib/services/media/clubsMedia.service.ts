import { DateTime } from 'luxon'
import { FetchBasedService } from '../common/fetchBased.service'
import { browser } from '$app/environment'

export type Media = {
	id: number
	uid: string
	filename: string
	size: number
	driveName: string
	lastRequested: DateTime
	createdAt: DateTime
	updatedAt: DateTime
}

export default class ClubsMediaService extends FetchBasedService {
	public async getBlob(params: { mediaId: number }): Promise<Blob | undefined> {
    try {
      let blob = await this.loadBlobFromCache({
        mediaId: params.mediaId
      })

      if (!!blob) return blob

      blob = await this.client.getBlob({
        url: '/clubs/media/' + params.mediaId + '/download'
      })

      this.saveBlobToCache({
        mediaId: params.mediaId,
        blob
      })

      return blob
    } catch (e) {
      return undefined
    }
  }


  public async getThumbnailBlob(params: { mediaId: number }): Promise<Blob | undefined> {
    try {
      let blob = await this.loadBlobFromCache({
        mediaId: params.mediaId,
        thumbnail: true
      })

      if (!!blob) return blob

      blob = await this.client.getBlob({
        url: '/clubs/media/' + params.mediaId + '/downloadThumbnail'
      })

      this.saveBlobToCache({
        mediaId: params.mediaId,
        thumbnail: true,
        blob
      })

      return blob
    } catch (e) {
      return undefined
    }
  }

	public async get(params: { id: number }): Promise<Media> {
		let media: Media = await this.client.get({
			url: '/clubs/media/' + params.id + '/show'
		})

		return media
	}

	private loadBlobFromCache(params: { mediaId: number, thumbnail?: boolean }): Promise<Blob | undefined> {
    if (browser) {
      return new Promise<Blob | undefined>((resolve, reject) => {
        this.getObjectStore({
          dbName: 'media',
          storeName: 'media',
          transactionType: 'readwrite'
        }).then((store) => {
          let request: IDBRequest<{ blob: Blob; id: number; cachedOn: Date }> = store.get(
            params.thumbnail ? 'th_' + params.mediaId : params.mediaId
          )
          request.onsuccess = function () {
            if (
              !!request.result?.cachedOn &&
              DateTime.now().diff(DateTime.fromJSDate(request.result.cachedOn)).get('hours') < 4
            ) {
              resolve(request.result?.blob)
            } else {
              store.delete(params.mediaId)
              resolve(undefined)
            }
          }

          request.onerror = function () {
            reject(request.error)
          }
        })
      })
    } else return Promise.resolve(undefined)
  }

  private saveBlobToCache(params: { mediaId: number; blob: Blob, thumbnail?: boolean }): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.getObjectStore({
        dbName: 'media',
        storeName: 'media',
        transactionType: 'readwrite'
      }).then((store) => {
        let media = {
          id: params.thumbnail ? 'th_' + params.mediaId : params.mediaId,
          blob: params.blob,
          cachedOn: DateTime.now().toJSDate()
        }

        let request = store.put(media)
        request.onsuccess = function () {
          resolve()
        }

        request.onerror = function () {
          reject(request.error)
        }
      })
    })
  }

  public clearCache(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.getObjectStore({
        dbName: 'media',
        storeName: 'media',
        transactionType: 'readwrite'
      }).then((store) => {
        let request = store.clear()
        request.onsuccess = function () {
          resolve()
        }

        request.onerror = function () {
          reject(request.error)
        }
      })
    })
  }

  private getObjectStore(params: {
    storeName: string
    dbName: string
    transactionType: IDBTransactionMode
  }): Promise<IDBObjectStore> {
    return new Promise<IDBObjectStore>((resolve, reject) => {
      let openRequest = indexedDB.open(params.dbName, 1)
      openRequest.onsuccess = function () {
        let db = openRequest.result

        let transaction = db.transaction(params.storeName, params.transactionType)
        let store = transaction.objectStore(params.storeName)
        resolve(store)
      }

      openRequest.onerror = function (err) {
        reject(err)
      }

      openRequest.onupgradeneeded = function (event) {
        let db = openRequest.result
        switch (
        event.oldVersion // existing db version
        ) {
          case 0:
            db.createObjectStore('media', { keyPath: 'id' })
          case 1:
          // client had version 1
          // update
        }
      }
    })
  }
}
