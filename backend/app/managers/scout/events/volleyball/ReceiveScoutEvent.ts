import type { ReceiveScoutExtraProperties } from "lionn-common";
import ScoutEvent, { ScoutEventConstructorsParameters } from "../../ScoutEvent.js";
import type { VolleyballPoints } from "lionn-common";
import Scout from "#app/Models/Scout";
import { Context } from "#app/managers/base.manager";
import scoutsSocket from "../../scouts.socket.js";

export default class ReceiveScoutEvent extends ScoutEvent<ReceiveScoutExtraProperties, 'receive', VolleyballPoints> {
  public type = 'receive' as const

  constructor(params: ScoutEventConstructorsParameters<'receive', VolleyballPoints, ReceiveScoutExtraProperties>) {
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

  public async postReceived(params: {
    data: {
      scout: Scout
    }
    context?: Context
  }): Promise<void> {
    await scoutsSocket.emit({
      data: {
        event: 'scout:lastEventReload',
        data: {
          scoutId: params.data.scout.id
        }
      },
      context: params.context
    })

    await scoutsSocket.emit({
      data: {
        event: 'scout:analysisReload',
        data: {
          scoutId: params.data.scout.id
        }
      },
      context: params.context
    })
  }
}