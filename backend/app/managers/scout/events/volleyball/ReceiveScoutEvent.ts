import type { ScoutEventPlayer } from "lionn-common";
import ScoutEvent, { ScoutEventJson } from "../../ScoutEvent";
import { VolleyballPoints, VolleyballScoutEventPosition } from "./common";
import Scout from "App/Models/Scout";
import { Context } from "App/managers/base.manager";
import scoutsSocket from "../../scouts.socket";
import User from "App/Models/User";

export type ReceiveScoutEventResult = '++' | '+' | '-' | '/' | 'x'

export type ReceiveScoutExtraProperties = {
  playerId: number,
  player: ScoutEventPlayer,
  result: ReceiveScoutEventResult,
  position: VolleyballScoutEventPosition
}
export type ReceiveScoutEventJson = ScoutEventJson<'receive', 'volleyball'> & ReceiveScoutExtraProperties

export default class ReceiveScoutEvent extends ScoutEvent<ReceiveScoutExtraProperties, 'receive', VolleyballPoints> {
  public type = 'receive' as const

  constructor(params) {
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

    if (
      this.event.result == 'x' &&
      params.data.scout.scoutInfo.settings?.automations?.autoPoint?.enemy?.includes('receiveError')
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
      !this.event.player.isOpponent &&
      params.data.scout.scoutInfo.settings?.automations?.autoPhase?.friends?.includes('receive')
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
    } else if (
      this.event.player.isOpponent &&
      params.data.scout.scoutInfo.settings?.automations?.autoPhase?.enemy?.includes('receive')
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
    }
  }
}