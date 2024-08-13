import { ScoutEventPlayer } from "App/Models/Player";
import ScoutEvent, { ScoutEventJson } from "../../ScoutEvent";
import { VolleyballPoints } from "./common";

export type LiberoSubstitutionScoutExtraProperties = {
  opponent: boolean,
  playerId: number,
  player: ScoutEventPlayer,
  inOrOut: 'in' | 'out',
  liberoId: number,
  libero: ScoutEventPlayer
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

    if (!params.liberoId) params.liberId = params.libero.id
    if (!params.liberoId) throw new Error('liberoId must be defined')

    if (!params.opponent) params.opponent = params.player.isOpponent
    if (!params.opponent) throw new Error('opponent must be defined')


    super({
      ...params
    })
    this.type = params.type
  }

  protected getExtraProperties(): LiberoSubstitutionScoutExtraProperties {
    return {
      player: this.event.player,
      playerId: this.event.playerId,
      opponent: this.event.opponent,
      inOrOut: this.event.inOrOut,
      liberoId: this.event.liberoId,
      libero: this.event.libero
    }
  }
}