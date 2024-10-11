import { Db, MongoClient, CreateCollectionOptions } from 'mongodb'
import Env from '@ioc:Adonis/Core/Env'

class MongoService {
  public client: MongoClient
  public db: Db

  constructor() {}

  async init(params?: { connectionString?: string; dbName?: string }) {
    try {
      if(!!this.client) return

      let connString =
        params?.connectionString || Env.get('MONGO_URL') || 'mongodb://localhost:27017'
      this.client = new MongoClient(connString)
      await this.client.connect()
      this.db = this.client.db(params?.dbName || Env.get('MONGO_DB'))
    } catch (err) {
      console.error('mongodb client failed to connect')
      console.log(err)
    }
  }

  async insertOne(params: { item: any; collectionName: string }): Promise<boolean> {
    await this.init()

    if (!this.db) {
      throw new Error('init before insert')
    }
    try {
      let collection = this.db.collection(params.collectionName)
      await collection.insertOne(params.item)
      return true
    } catch (err) {
      console.log(err)
      return false
    }
  }

  async createCollection(params: { name: string; options?: CreateCollectionOptions }) {
    await this.init()

    if (!this.db) {
      throw new Error('init before create collection')
    }

    if (!(await this.db.listCollections({ name: params.name }).hasNext())) {
      await this.db.createCollection(params.name, params.options)
    }
  }

  async createTimeSeries(params: {
    name: string
    options: {
      timeseries: {
        timeField: string
        metaField?: string
        granularity?: string
      }
    }
  }) {
    await this.init()

    if (!this.db) {
      throw new Error('init before create collection')
    }

    await this.createCollection({
      name: params.name,
      options: {
        timeseries: {
          timeField: params.options.timeseries.timeField,
          metaField: params.options.timeseries.metaField,
          granularity: params.options.timeseries.granularity,
        },
      },
    })
  }

  async createManyCollections(params: { names: string[]; options?: CreateCollectionOptions }) {
    for (const name of params.names) {
      await this.createCollection({
        name,
        options: params.options,
      })
    }
  }

  async dropCollection(params: { name: string }) {
    await this.init()

    if (!this.db) {
      throw new Error('init before create collection')
    }

    const collectionExist = await this.db.listCollections({ name: params.name }).hasNext()
    if (collectionExist) {
      await this.db.dropCollection(params.name)
    }
  }
}

export default new MongoService()
