import { Document, Filter, FindOptions } from "mongodb";
import ScoutEvent, { SCOUT_EVENT_COLLECTION_NAME } from "./ScoutEvent";
import Mongo from "App/Services/Mongo";

export type VolleyballEventJson = {
  sport: 'volleyball',
} & (
  VolleballEventGameStartJson |
  VolleballEventGameEndJson |
  VolleballEventSetStartJson |
  VolleballEventSetEndJson |
  VolleballEventPlayerInJson |
  VolleballEventPlayerOutJson |
  VolleballEventPlayerReceiveJson |
  VolleballEventPlayerAttackJson |
  VolleballEventPlayerDefendJson |
  VolleballEventPlayerServeJson |
  VolleballEventScoreChangeJson
)

export type VolleballEventGameStartJson = {
  type: 'game_start'
}

export type VolleballEventGameEndJson = {
  type: 'game_end',
  finalScore: VolleballEventScoreSpec
}

export type VolleballEventSetStartJson = {
  type: 'set_start',
  setNumber: number
}

export type VolleballEventSetEndJson = {
  type: 'set_end',
  setNumber: number
}

export type VolleballEventPlayerInJson = {
  type: 'player_in'
  player: VolleyballEventPlayer
}

export type VolleballEventPlayerOutJson = {
  type: 'player_out'
}

export type VolleballEventPlayerReceiveJson = {
  type: 'player_receive'
}

export type VolleballEventPlayerAttackJson = {
  type: 'player_attack'
}

export type VolleballEventPlayerDefendJson = {
  type: 'player_defend'
}

export type VolleballEventPlayerServeJson = {
  type: 'player_serve'
}

export type VolleballEventScoreChangeJson = {
  type: 'score_change'
}

export type VolleyballSport = 'volleyball'

export type VolleyballEventType = VolleyballEventJson['type']

export type VolleballEventScoreSpec = {
  sets: Record<string, number>,
  points: Record<string, number>
}

export type VolleyballEventPlayer = {
  id: number
  name: string
  shirtNumber: string
}

export default abstract class VolleyballEvent extends ScoutEvent<VolleyballEventJson, VolleyballSport> {
  public get sport(): VolleyballSport {
    return 'volleyball'
  }

  public static async find(params: {
    filters: Filter<VolleyballEventJson>,
    options?: FindOptions<VolleyballEventJson>
  }): Promise<VolleyballEventJson[]> {
    await Mongo.init()

    let documents = await Mongo.db.collection(SCOUT_EVENT_COLLECTION_NAME)
      .find<VolleyballEventJson>(params.filters, params.options)
      .toArray()

    return documents
  }

  public static async aggregate(params: {
    pipeline: Document[]
  }): Promise<Document[]> {
    await Mongo.init()

    let documents = await Mongo.db.aggregate(params.pipeline)
      .toArray()

    return documents
  }
}