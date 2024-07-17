import { ScoutEventPlayer } from "App/Models/Player";
import ScoutEvent, { ScoutEventJson } from "../../ScoutEvent";
import { VolleyballPoints, VolleyballScoutEventPosition } from "./common";

export type BlockScoutEventResult = 'handsOut' | 'point' | 'touch' | 'putBack'

export type BlockScoutExtraProperties = {
  playerId: number,
  player: ScoutEventPlayer,
  result: BlockScoutEventResult,
  position: VolleyballScoutEventPosition
}
export type BlockScoutEventJson = ScoutEventJson<'block', 'volleyball'> & BlockScoutExtraProperties

export default class BlockScoutEvent extends ScoutEvent<BlockScoutExtraProperties, 'block', VolleyballPoints> {
  public type = 'block' as const

  constructor(params) {
    if (!params.playerId) params.playerId = params.player.id
    if (!params.playerId) throw new Error('playerId must be defined')

    super({
      ...params,
      playerId: params.playerId,
    })
    this.type = params.type
  }

  protected getExtraProperties(): BlockScoutExtraProperties {
    return {
      player: this.event.player,
      playerId: this.event.playerId,
      result: this.event.result,
      position: this.event.position
    }
  }
}