import type { PlayerSubstitutionScoutExtraProperties, VolleyballPoints } from "lionn-common";
import ScoutEvent, { ScoutEventConstructorsParameters } from "../../ScoutEvent.js";
import scoutsSocket from "../../scouts.socket.js";
import { Context } from "#app/managers/base.manager";
import Scout from "#app/Models/Scout";

export default class PlayerSubstitutionScoutEvent extends ScoutEvent<PlayerSubstitutionScoutExtraProperties, 'playerSubstitution', VolleyballPoints> {
  public type = 'playerSubstitution' as const

  constructor(params: ScoutEventConstructorsParameters<'playerSubstitution', VolleyballPoints, PlayerSubstitutionScoutExtraProperties>) {
    if (!params.playerId) params.playerId = params.player.id
    if (!params.playerId) throw new Error('playerId must be defined')

    if (params.playerIsOpponent === undefined) params.playerIsOpponent = params.player.isOpponent
    if (params.playerIsOpponent === undefined) throw new Error('playerIsOpponent must be defined')

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