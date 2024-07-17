import { ScoutEventPlayer } from "App/Models/Player";
import ScoutEvent, { ScoutEventJson } from "../../ScoutEvent";
import { VolleyballPoints, VolleyballScoutEventPosition } from "./common";

export type PlayerInPositionScoutExtraProperties = {
  playerId: number,
  playerIsOpponent: boolean,
  player: ScoutEventPlayer,
  position: VolleyballScoutEventPosition
}
export type PlayerInPositionScoutEventJson = ScoutEventJson<'playerInPosition', 'volleyball'> & PlayerInPositionScoutExtraProperties

export default class PlayerInPositionScoutEvent extends ScoutEvent<PlayerInPositionScoutExtraProperties, 'playerInPosition', VolleyballPoints> {
  public type = 'playerInPosition' as const

  constructor(params) {
    if (!params.playerId) params.playerId = params.player.id
    if (!params.playerId) throw new Error('playerId must be defined')

    if (!params.playerIsOpponent) params.playerIsOpponent = params.player.isOpponent
    if (!params.playerIsOpponent) throw new Error('playerIsOpponent must be defined')

    super({
      ...params,
      playerId: params.playerId,
      playerIsOpponent: params.playerIsOpponent
    })
    this.type = params.type
  }

  protected getExtraProperties(): PlayerInPositionScoutExtraProperties {
    return {
      player: this.event.player,
      playerId: this.event.playerId,
      position: this.event.position,
      playerIsOpponent: this.event.playerIsOpponent
    }
  }
}