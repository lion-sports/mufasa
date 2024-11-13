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

    if (
      this.event.result == 'error' &&
      params.data.scout.scoutInfo.settings?.automations?.autoPoint?.enemy?.includes('serveError')
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
      params.data.scout.scoutInfo.settings?.automations?.autoPoint?.friends?.includes('servePoint')
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
    } else if (
      this.event.result == 'received' && 
      !this.event.player.isOpponent &&
      params.data.scout.scoutInfo.settings?.automations?.autoPhase?.friends?.includes('serveReceived')
    ) {
      await scoutsSocket.handleEvent({
        data: {
          event: 'scout:add',
          data: {
            type: 'manualPhase',
            phase: 'defenseBreak',
            opponent: false,
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
      this.event.result == 'received' &&
      this.event.player.isOpponent &&
      params.data.scout.scoutInfo.settings?.automations?.autoPhase?.enemy?.includes('serveReceived')
    ) {
      await scoutsSocket.handleEvent({
        data: {
          event: 'scout:add',
          data: {
            type: 'manualPhase',
            phase: 'defenseSideOut',
            opponent: false,
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