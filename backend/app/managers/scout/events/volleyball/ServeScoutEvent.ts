import { ScoutEventPlayer } from "App/Models/Player";
import ScoutEvent, { ScoutEventJson } from "../../ScoutEvent";
import { VolleyballPoints } from "./common";

export type ServeScoutEventResult = 'error' | 'point' | 'received'

export type ServeScoutExtraProperties = {
  playerId: number,
  player: ScoutEventPlayer,
  result: ServeScoutEventResult
}
export type ServeScoutEventJson = ScoutEventJson<'serve', 'volleyball'> & ServeScoutExtraProperties

export default class ServeScoutEvent extends ScoutEvent<ServeScoutExtraProperties, 'serve', VolleyballPoints> {
  public type = 'serve' as const

  constructor(params) {
    if (!params.playerId) params.playerId = params.player.id
    if (!params.playerId) throw new Error('playerId must be defined')

    super({
      ...params,
      playerId: params.playerId,
    })
    this.type = params.type
  }

  protected getExtraProperties(): ServeScoutExtraProperties {
    return {
      player: this.event.player,
      playerId: this.event.playerId,
      result: this.event.result
    }
  }
}