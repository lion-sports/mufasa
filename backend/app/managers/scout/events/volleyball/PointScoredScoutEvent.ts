import { ScoringSystemConfig } from "App/Models/ScoringSystem";
import ScoutEvent, { ScoutEventJson } from "../../ScoutEvent";
import { VolleyballPoints } from "./common";
import { Context, withTransaction } from "App/managers/base.manager";
import Scout from "App/Models/Scout";
import scoutsSocket from "../../scouts.socket";
import { incrementScore } from "lionn-common";

export type PointScoredScoutExtraProperties = {
  opponent: boolean,
  newPoints: VolleyballPoints
}
export type PointScoredScoutEventJson = ScoutEventJson<'pointScored', 'volleyball'> & PointScoredScoutExtraProperties
export type PointScoredScoutEventAddParameters = Omit<PointScoredScoutEventJson, 'newPoints'>

export default class PointScoredScoutEvent extends ScoutEvent<
  {
    opponent: boolean,
    newPoints?: VolleyballPoints
  },
  'pointScored',
  VolleyballPoints,
  PointScoredScoutExtraProperties
> {
  public type = 'pointScored' as const

  constructor(params) {
    super({
      ...params
    })
    this.type = params.type
  }

  protected getExtraProperties(): PointScoredScoutExtraProperties {
    return {
      opponent: this.event.opponent,
      newPoints: this.event.newPoints || this.points
    }
  }

  @withTransaction
  public async preReceived(params: {
    data: {
      scout: Scout
    }
    context?: Context
  }): Promise<void> {
    await params.data.scout.load('scoringSystem')
    let scoringSystemConfig = params.data.scout.scoringSystem.config

    this.event.newPoints = await incrementScore({
      data: {
        currentScore: this.points,
        opponent: this.event.opponent,
        scoringSystemConfig: scoringSystemConfig || {
          set: {
            mode: 'winSet',
            winSets: 3
          },
          points: {
            mode: 'winPoints',
            totalPoints: 25,
            hasAdvantages: true
          },
          tieBreak: {
            mode: 'winPoints',
            winPoints: 15,
            hasAdvantages: true
          }
        }
      }
    })
  }

  public async postReceived(params: { 
    data: { 
      scout: Scout
    } 
    context?: Context
  }): Promise<void> {
    if(
      !this.event.opponent &&
      (
        params.data.scout.stash.phase == 'receive' ||
        params.data.scout.stash.phase == 'defenseSideOut'
      ) &&
      !!params.data.scout.stash.playersServePositions
    ) {
      await scoutsSocket.handleEvent({
        data: {
          event: 'scout:add',
          data: {
            type: 'teamRotation',
            rotationType: 'forward',
            fromPositions: params.data.scout.stash.playersServePositions,
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

      await scoutsSocket.handleEvent({
        data: {
          event: 'scout:add',
          data: {
            type: 'manualPhase',
            phase: 'serve',
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

    if (
      this.event.opponent &&
      (
        params.data.scout.stash.phase == 'serve' ||
        params.data.scout.stash.phase == 'defenseBreak'
      ) &&
      !!params.data.scout.stash.playersServePositions
    ) {
      await scoutsSocket.handleEvent({
        data: {
          event: 'scout:add',
          data: {
            type: 'teamRotation',
            rotationType: 'forward',
            fromPositions: params.data.scout.stash.playersServePositions,
            opponent: true,
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

      await scoutsSocket.handleEvent({
        data: {
          event: 'scout:add',
          data: {
            type: 'manualPhase',
            phase: 'receive',
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

    if (this.event.opponent && params.data.scout.stash.phase == 'defenseSideOut') {
      await scoutsSocket.handleEvent({
        data: {
          event: 'scout:add',
          data: {
            type: 'manualPhase',
            phase: 'receive',
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
    } else if (!this.event.opponent && params.data.scout.stash.phase == 'defenseBreak') {
      await scoutsSocket.handleEvent({
        data: {
          event: 'scout:add',
          data: {
            type: 'manualPhase',
            phase: 'serve',
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