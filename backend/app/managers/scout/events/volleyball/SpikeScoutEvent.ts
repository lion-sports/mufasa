import type { SpikeScoutExtraProperties, VolleyballPoints } from "lionn-common";
import ScoutEvent from "../../ScoutEvent";
import Scout from "App/Models/Scout";
import { Context } from "App/managers/base.manager";
import scoutsSocket from "../../scouts.socket";

export default class SpikeScoutEvent extends ScoutEvent<SpikeScoutExtraProperties, 'spike', VolleyballPoints> {
  public type = 'spike' as const

  constructor(params) {
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

    if (
      this.event.result == 'error' &&
      params.data.scout.scoutInfo.settings?.automations?.autoPoint?.enemy?.includes('spikeError')
    ) {
      await scoutsSocket.handleEvent({
        data: {
          event: 'scout:add',
          data: {
            type: 'pointScored',
            opponent: !this.event.player.isOpponent,
            date: new Date(),
            scoutId: this.scoutId,
            sport: 'volleyball',
            teamId: this.teamId,
            createdByUserId: this.createdByUserId,
            points: this.points
          },
        },
        context: params.context
      })
    } else if (
      this.event.result == 'point' &&
      params.data.scout.scoutInfo.settings?.automations?.autoPoint?.friends?.includes('spikePoint')
    ) {
      await scoutsSocket.handleEvent({
        data: {
          event: 'scout:add',
          data: {
            type: 'pointScored',
            opponent: this.event.player.isOpponent,
            date: new Date(),
            scoutId: this.scoutId,
            sport: 'volleyball',
            teamId: this.teamId,
            createdByUserId: this.createdByUserId,
            points: this.points
          },
        },
        context: params.context
      })
    }
  }
}