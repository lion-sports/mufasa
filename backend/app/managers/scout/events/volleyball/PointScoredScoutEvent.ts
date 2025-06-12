import ScoutEvent, { SCOUT_EVENT_COLLECTION_NAME, ScoutEventConstructorsParameters } from "../../ScoutEvent.js";
import { Context, withTransaction } from "#app/managers/base.manager";
import Scout from "#app/Models/Scout";
import { incrementScore, type PointScoredScoutExtraProperties, type VolleyballPoints } from "lionn-common";
import Mongo from "#app/Services/Mongo";
import lodash from 'lodash'

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

  constructor(params: ScoutEventConstructorsParameters<'pointScored', VolleyballPoints, PointScoredScoutExtraProperties>) {
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
        currentScore: lodash.cloneDeep(this.points),
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
    await Mongo.init()

    await Mongo.db.collection(SCOUT_EVENT_COLLECTION_NAME).updateMany(
      { 
        'points.enemy.sets': this.points.enemy.sets,
        'points.friends.sets': this.points.friends.sets,
        'points.enemy.points': this.points.enemy.points,
        'points.friends.points': this.points.friends.points,
        'scoutId': params.data.scout.id
      },
      {
        $set: {
          pointScoredBy: this.event.opponent ? 'opponent' : 'friends'
        }
      }
    )
  }
}