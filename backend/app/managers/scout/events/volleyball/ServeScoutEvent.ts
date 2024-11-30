import type { ServeScoutExtraProperties, VolleyballPoints } from "lionn-common";
import ScoutEvent from "../../ScoutEvent";
import Scout from "App/Models/Scout";
import { Context } from "App/managers/base.manager";
import scoutsSocket from "../../scouts.socket";

export default class ServeScoutEvent extends ScoutEvent<ServeScoutExtraProperties, 'serve', VolleyballPoints> {
  public type = 'serve' as const

  constructor(params) {
    if (!params.playerId) params.playerId = params.player.id
    if (!params.playerId) throw new Error('playerId must be defined')

    super({
      ...params,
      playerId: params.playerId,
    })
    this.type = params.type
  }

  protected getExtraProperties(): ServeScoutExtraProperties {
    return {
      player: this.event.player,
      playerId: this.event.playerId,
      result: this.event.result
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