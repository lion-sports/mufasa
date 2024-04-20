import Mongo from "App/Services/Mongo"

export type Sport = 'none' | 'volleyball' | 'basketball'

export type ScoutEventJson = {
  _id?: string
  date: Date
  scoutId: number
  teamId: number
  sport: Sport
}

export const SCOUT_EVENT_COLLECTION_NAME = 'scout_events'

export default abstract class ScoutEvent<
  JsonType extends {
    sport: Sport
  } = {
    sport: 'none'
  },
  EventSport extends Sport = 'none'
> {
  public _id: string | undefined
  public date: Date
  public scoutId: number
  public teamId: number

  constructor()
  constructor(params?: {
    _id?: string,
    date: Date,
    scoutId: number,
    teamId: number,
    sport: EventSport
  }) {
    if(!!params) {
      this.date = params.date
      this.scoutId = params.scoutId
      this._id = params._id
    }
  }

  public abstract get sport(): EventSport
  protected abstract getEventExtraProperties(): JsonType

  public toJson(): JsonType & ScoutEventJson {
    let extraProperties = this.getEventExtraProperties()
    return {
      ...extraProperties,
      _id: this._id,
      date: this.date,
      scoutId: this.scoutId,
      teamId: this.teamId,
      sport: this.sport
    }
  }

  public get persisted(): Boolean {
    return !!this._id
  }

  public async save() {
    await Mongo.init()

    await Mongo.insertOne({
      collectionName: SCOUT_EVENT_COLLECTION_NAME,
      item: this.toJson()
    })
  }
}