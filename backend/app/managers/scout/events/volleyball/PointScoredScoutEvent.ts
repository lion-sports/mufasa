import { ScoringSystemConfig } from "App/Models/ScoringSystem";
import ScoutEvent, { ScoutEventJson } from "../../ScoutEvent";
import { VolleyballPoints } from "./common";
import { Context, withTransaction } from "App/managers/base.manager";
import Scout from "App/Models/Scout";
import User from "App/Models/User";
import scoutsSocket from "../../scouts.socket";

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

    this.event.newPoints = await PointScoredScoutEvent.incrementScore({
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
    context: { 
      user: User 
    } 
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
        user: params.context.user
      })

      await scoutsSocket.handleEvent({
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
        user: params.context.user
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
        user: params.context.user
      })

      await scoutsSocket.handleEvent({
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
        user: params.context.user
      })
    }

    if (this.event.opponent && params.data.scout.stash.phase == 'defenseSideOut') {
      await scoutsSocket.handleEvent({
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
        user: params.context.user
      })
    } else if (!this.event.opponent && params.data.scout.stash.phase == 'defenseBreak') {
      await scoutsSocket.handleEvent({
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
        user: params.context.user
      })
    }
  }

  public static async incrementScore(params: {
    data: {
      currentScore: VolleyballPoints,
      opponent: boolean,
      scoringSystemConfig: ScoringSystemConfig
    }
  }): Promise<VolleyballPoints> {
    let newScore = params.data.currentScore

    if (params.data.opponent) newScore.enemy.points += 1
    else newScore.friends.points += 1

    const totalSetScoredBefore = Number(newScore.enemy.sets) + Number(newScore.friends.sets)
    const totalPointScored = Number(newScore.enemy.points) + Number(newScore.friends.points)
    const isTieBreak = !!params.data.scoringSystemConfig.tieBreak && (
      (
        params.data.scoringSystemConfig.set.mode == 'winSet' &&
        (Number(newScore.enemy.sets) + 1) == params.data.scoringSystemConfig.set.winSets &&
        (Number(newScore.friends.sets) + 1) == params.data.scoringSystemConfig.set.winSets
      ) || (
        params.data.scoringSystemConfig.set.mode == 'totalSet' &&
        (Number(totalSetScoredBefore) + 1) == params.data.scoringSystemConfig.set.totalSets &&
        Number(newScore.enemy.sets) == Number(newScore.friends.sets)
      )
    )

    if (isTieBreak && !!params.data.scoringSystemConfig.tieBreak) {
      if (params.data.scoringSystemConfig.tieBreak.mode == 'totalPoints' && totalPointScored == params.data.scoringSystemConfig.tieBreak.totalPoints) {
        if (newScore.enemy.points > newScore.friends.points) {
          newScore = this.incrementSetFor('enemy', newScore)
        } else {
          newScore = this.incrementSetFor('friends', newScore)
        }
      } else if (params.data.scoringSystemConfig.tieBreak.mode == 'winPoints') {
        if (newScore.enemy.points >= params.data.scoringSystemConfig.tieBreak.winPoints) {
          let differencePoints = Number(newScore.enemy.points) - Number(newScore.friends.points)
          if (differencePoints > 1 || !params.data.scoringSystemConfig.tieBreak.hasAdvantages) {
            newScore = this.incrementSetFor('enemy', newScore)
          } else {
            let pointLimit = params.data.scoringSystemConfig.tieBreak.pointsLimit
            if (pointLimit !== undefined && newScore.enemy.points == pointLimit) {
              newScore = this.incrementSetFor('enemy', newScore)
            }
          }
        }

        if (newScore.friends.points >= params.data.scoringSystemConfig.tieBreak.winPoints) {
          let differencePoints = Number(newScore.friends.points) - Number(newScore.enemy.points)
          if (differencePoints > 1 || !params.data.scoringSystemConfig.tieBreak.hasAdvantages) {
            newScore = this.incrementSetFor('friends', newScore)
          } else {
            let pointLimit = params.data.scoringSystemConfig.tieBreak.pointsLimit
            if (pointLimit !== undefined && newScore.friends.points == pointLimit) {
              newScore = this.incrementSetFor('friends', newScore)
            }
          }
        }
      }
    } else {
      if (params.data.scoringSystemConfig.points.mode == 'totalPoints' && totalPointScored == params.data.scoringSystemConfig.points.totalPoints) {
        if (newScore.enemy.points > newScore.friends.points) {
          newScore = this.incrementSetFor('enemy', newScore)
        } else {
          newScore = this.incrementSetFor('friends', newScore)
        }
      } else if (params.data.scoringSystemConfig.points.mode == 'winPoints') {
        if (newScore.enemy.points >= params.data.scoringSystemConfig.points.winPoints) {
          let differencePoints = Number(newScore.enemy.points) - Number(newScore.friends.points)
          if (differencePoints > 1 || !params.data.scoringSystemConfig.points.hasAdvantages) {
            newScore = this.incrementSetFor('enemy', newScore)
          } else {
            let pointLimit = params.data.scoringSystemConfig.points.pointsLimit
            if (pointLimit !== undefined && newScore.enemy.points == pointLimit) {
              newScore = this.incrementSetFor('enemy', newScore)
            }
          }
        }

        if (newScore.friends.points >= params.data.scoringSystemConfig.points.winPoints) {
          let differencePoints = Number(newScore.friends.points) - Number(newScore.enemy.points)
          if (differencePoints > 1 || !params.data.scoringSystemConfig.points.hasAdvantages) {
            newScore = this.incrementSetFor('friends', newScore)
          } else {
            let pointLimit = params.data.scoringSystemConfig.points.pointsLimit
            if (pointLimit !== undefined && newScore.friends.points == pointLimit) {
              newScore = this.incrementSetFor('friends', newScore)
            }
          }
        }
      }
    }


    const totalSetScored = Number(newScore.enemy.sets) + Number(newScore.friends.sets)

    if (params.data.scoringSystemConfig.set.mode == 'winSet') {
      if (newScore.enemy.sets >= params.data.scoringSystemConfig.set.winSets) newScore.enemy.won = true
      if (newScore.friends.sets >= params.data.scoringSystemConfig.set.winSets) newScore.friends.won = true
    } else if (params.data.scoringSystemConfig.set.mode == 'totalSet') {
      if (totalSetScored >= params.data.scoringSystemConfig.set.totalSets) {
        if (newScore.enemy.sets > newScore.friends.sets) newScore.enemy.won = true
        if (newScore.enemy.sets < newScore.friends.sets) newScore.friends.won = true
      }
    }

    return newScore
  }

  private static incrementSetFor(who: 'enemy' | 'friends', score: VolleyballPoints): VolleyballPoints {
    score[who].sets += 1
    score.enemy.points = 0
    score.friends.points = 0
    return score
  }
}