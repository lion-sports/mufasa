import type { SpikeScoutExtraProperties, VolleyballPoints } from "lionn-common";
import ScoutEvent, { ScoutEventConstructorsParameters } from "../../ScoutEvent.js";
import Scout from "#app/Models/Scout";
import { Context } from "#app/managers/base.manager";
import scoutsSocket from "../../scouts.socket.js";

export default class SpikeScoutEvent extends ScoutEvent<SpikeScoutExtraProperties, 'spike', VolleyballPoints> {
  public type = 'spike' as const

  constructor(params: ScoutEventConstructorsParameters<'spike', VolleyballPoints, SpikeScoutExtraProperties>) {
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