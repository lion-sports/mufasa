import Mongo from "App/Services/Mongo"
import { Document, ObjectId, WithId } from "mongodb"
import { Context } from "../base.manager"
import Scout from "App/Models/Scout"
import User from "App/Models/User"

export type Sport = 'none' | 'volleyball' | 'basketball'

export type ScoutEventJson<Type = string, S extends Sport = Sport> = {
  _id?: ObjectId
  date: Date
  scoutId: number
  teamId: number
  sport: S
  type: Type
  createdByUserId: number
  points: any
  clientIdentifier?: string
}

export const SCOUT_EVENT_COLLECTION_NAME = 'scout_events'

export default abstract class ScoutEvent<
  Event = '', 
  Type extends string = string, 
  Points = any, 
  ExtraProperties = Event
> {
  public _id: ObjectId | undefined
  public date: Date
  public scoutId: number
  public teamId: number
  public sport: Sport
  public event: Event
  public createdByUserId: number
  public clientIdentifier?: string
  public points: Points
  public abstract type: Type

  constructor(params: {
    _id?: ObjectId
    date: Date
    scoutId: number
    teamId: number
    sport: Sport
    type: Type
    points: Points
    clientIdentifier?: string
    createdByUserId: number
  } & Event) {
    this.date = new Date(params.date)
    this.scoutId = params.scoutId
    this.teamId = params.teamId
    this.sport = params.sport
    this.createdByUserId = params.createdByUserId
    this.points = params.points
    this.clientIdentifier = params.clientIdentifier
    this._id = params._id
    
    this.event = {} as Event
    for(const [key, value] of Object.entries(params)) {
      if (['_id', 'date', 'scoutId', 'teamId', 'sport', 'type', 'clientIdentifier', 'createdByUserId'].includes(key)) continue
      else this.event[key] = value
    }
  }

  protected abstract getExtraProperties(): ExtraProperties

  public toJson(): ScoutEventJson & ExtraProperties {
    let extraProperties = this.getExtraProperties()
    return {
      _id: this._id,
      date: this.date,
      scoutId: this.scoutId,
      teamId: this.teamId,
      sport: this.sport,
      type: this.type,
      createdByUserId: this.createdByUserId,
      points: this.points,
      clientIdentifier: this.clientIdentifier,
      ...extraProperties,
    }
  }

  public get persisted(): Boolean {
    return !!this._id
  }

  public async save() {
    await Mongo.init()

    if(!this.persisted) {
      let existingEvent: WithId<Document>[] | undefined = undefined
      if(!!this.clientIdentifier) {
        existingEvent = await Mongo.db.collection(SCOUT_EVENT_COLLECTION_NAME).find({
          clientIdentifier: this.clientIdentifier
        }).toArray()
      }

      if (existingEvent === undefined || existingEvent.length == 0) {
        await Mongo.insertOne({
          collectionName: SCOUT_EVENT_COLLECTION_NAME,
          item: this.toJson()
        })
      }
    } else {
      if(!this._id) throw new Error('must have the id')

      await Mongo.db.collection(SCOUT_EVENT_COLLECTION_NAME).updateOne(
        {
          _id: this._id,
        },
        {
          $set: this.toJson()
        }
      )
    }
  }

  public async postReceived(params: {
    data: {
      scout: Scout 
    },
    context?: Context
  }) { }
  
  public async preReceived(params: {
    data: {
      scout: Scout
    },
    context?: Context
  }) { }
}