import { ScoutEventPlayer } from "App/Models/Player";
import ScoutEvent, { ScoutEventJson } from "../../ScoutEvent";
import { VolleyballPoints, VolleyballScoutEventPosition } from "./common";

export type ReceiveScoutEventResult = '++' | '+' | '-' | '/' | 'x'

export type ReceiveScoutExtraProperties = {
  playerId: number,
  player: ScoutEventPlayer,
  result: ReceiveScoutEventResult,
  position: VolleyballScoutEventPosition
}
export type ReceiveScoutEventJson = ScoutEventJson<'receive', 'volleyball'> & ReceiveScoutExtraProperties

export default class ReceiveScoutEvent extends ScoutEvent<ReceiveScoutExtraProperties, 'receive', VolleyballPoints> {
  public type = 'receive' as const

  constructor(params) {
    if (!params.playerId) params.playerId = params.player.id
    if (!params.playerId) throw new Error('playerId must be defined')

    super({
      ...params,
      playerId: params.playerId,
    })
    this.type = params.type
  }

  protected getExtraProperties(): ReceiveScoutExtraProperties {
    return {
      player: this.event.player,
      playerId: this.event.playerId,
      result: this.event.result,
      position: this.event.position
    }
  }
}