import { ScoutEventPlayer } from "App/Models/Player";
import ScoutEvent, { ScoutEventJson } from "../../ScoutEvent";
import { VolleyballPoints, VolleyballScoutEventPosition } from "./common";

export type PlayerSubstitutionScoutExtraProperties = {
  playerIsOpponent: boolean,
  playerId: number,
  player: ScoutEventPlayer,
  position: VolleyballScoutEventPosition
  playerIn: ScoutEventPlayer
  playerIdIn: number
}
export type PlayerSubstitutionScoutEventJson = ScoutEventJson<'playerSubstitution', 'volleyball'> & PlayerSubstitutionScoutExtraProperties

export default class PlayerSubstitutionScoutEvent extends ScoutEvent<PlayerSubstitutionScoutExtraProperties, 'playerSubstitution', VolleyballPoints> {
  public type = 'playerSubstitution' as const

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

  protected getExtraProperties(): PlayerSubstitutionScoutExtraProperties {
    return {
      player: this.event.player,
      playerId: this.event.playerId,
      position: this.event.position,
      playerIsOpponent: this.event.playerIsOpponent,
      playerIn: this.event.playerIn,
      playerIdIn: this.event.playerIdIn
    }
  }
}