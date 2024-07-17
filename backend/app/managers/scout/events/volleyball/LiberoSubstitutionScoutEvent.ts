import { ScoutEventPlayer } from "App/Models/Player";
import ScoutEvent, { ScoutEventJson } from "../../ScoutEvent";
import { VolleyballPoints } from "./common";

export type LiberoSubstitutionScoutExtraProperties = {
  playerIsOpponent: boolean,
  playerId: number,
  player: ScoutEventPlayer,
  inOrOut: 'in' | 'out'
}
export type LiberoSubstitutionScoutEventJson = ScoutEventJson<'liberoSubstitution', 'volleyball'> & LiberoSubstitutionScoutExtraProperties

export default class LiberoSubstitutionScoutEvent extends ScoutEvent<
  LiberoSubstitutionScoutExtraProperties, 
  'liberoSubstitution', 
  VolleyballPoints
> {
  public type = 'liberoSubstitution' as const

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

  protected getExtraProperties(): LiberoSubstitutionScoutExtraProperties {
    return {
      player: this.event.player,
      playerId: this.event.playerId,
      playerIsOpponent: this.event.playerIsOpponent,
      inOrOut: this.event.inOrOut
    }
  }
}