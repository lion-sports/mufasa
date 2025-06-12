import type { PlayerInPositionScoutExtraProperties, VolleyballPoints } from "lionn-common";
import ScoutEvent, { ScoutEventConstructorsParameters } from "../../ScoutEvent.js";
import PlayersManager from "#app/managers/players.manager";
import Scout from "#app/Models/Scout";
import { Context } from "#app/managers/base.manager";
import scoutsSocket from "../../scouts.socket.js";

export default class PlayerInPositionScoutEvent extends ScoutEvent<PlayerInPositionScoutExtraProperties, 'playerInPosition', VolleyballPoints> {
  public type = 'playerInPosition' as const

  constructor(params: ScoutEventConstructorsParameters<'playerInPosition', VolleyballPoints, PlayerInPositionScoutExtraProperties>) {
    if (!params.playerId) params.playerId = params.player.id
    if (!params.playerId) throw new Error('playerId must be defined')

    if (params.playerIsOpponent === undefined) params.playerIsOpponent = params.player.isOpponent
    if (params.playerIsOpponent === undefined) throw new Error('playerIsOpponent must be defined')

    let playersManager = new PlayersManager()
    params.player = playersManager.shrinkPlayer({
      data: {
        player: params.player
      }
    })

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