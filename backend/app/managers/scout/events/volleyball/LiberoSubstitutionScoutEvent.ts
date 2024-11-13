import type { LiberoSubstitutionScoutExtraProperties, VolleyballPoints } from "lionn-common";
import ScoutEvent from "../../ScoutEvent";
import scoutsSocket from "../../scouts.socket";
import Scout from "App/Models/Scout";
import { Context } from "App/managers/base.manager";

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

    if (params.opponent === undefined) params.opponent = params.player.isOpponent
    if (params.opponent === undefined) throw new Error('opponent must be defined')


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
      libero: this.event.libero,
      position: this.event.position
    }
  }

  public async postReceived(params: {
    data: {
      scout: Scout
    }
    context?: Context
  }): Promise<void> {
    scoutsSocket.emit({
      data: {
        event: 'scout:lastEventReload',
        data: {
          scoutId: params.data.scout.id
        }
      },
      context: params.context
    })
  }
}