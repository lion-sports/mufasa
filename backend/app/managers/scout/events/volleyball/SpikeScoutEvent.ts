import { ScoutEventPlayer } from "App/Models/Player";
import ScoutEvent, { ScoutEventJson } from "../../ScoutEvent";
import { VolleyballPoints } from "./common";

export type SpikeScoutEventResult = 'error' | 'point' | 'difense'

export type SpikeScoutExtraProperties = {
  playerId: number,
  player: ScoutEventPlayer,
  result: SpikeScoutEventResult,
}
export type SpikeScoutEventJson = ScoutEventJson<'spike', 'volleyball'> & SpikeScoutExtraProperties

export default class SpikeScoutEvent extends ScoutEvent<SpikeScoutExtraProperties, 'spike', VolleyballPoints> {
  public type = 'spike' as const

  constructor(params) {
    if (!params.playerId) params.playerId = params.player.id
    if (!params.playerId) throw new Error('playerId must be defined')

    super({
      ...params,
      playerId: params.playerId,
    })
    this.type = params.type
  }

  protected getExtraProperties(): SpikeScoutExtraProperties {
    return {
      player: this.event.player,
      playerId: this.event.playerId,
      result: this.event.result
    }
  }
}