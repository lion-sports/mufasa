import { ScoutEventPlayer, VolleyballScoutEventPosition } from "lionn-common"
import { analysis } from "../aggregations/analysis.aggregation"
import { SCOUT_EVENT_COLLECTION_NAME } from "../ScoutEvent"
import Mongo from "App/Services/Mongo"
import { Context, withTransaction, withUser } from "App/managers/base.manager"
import { AuthorizationHelpers } from "App/managers/authorization.manager"
import Scout from "App/Models/Scout"

export type TeamFilter = 'friend' | 'opponent' | 'both'

export default class ScoutAnalysisManager {
  @withTransaction
  @withUser
  private async getViewableScoutIds(params?: {
    data?: {
      scoutId?: number
    },
    context?: Context
  }): Promise<number[]> {
    let user = params?.context?.user!
    let trx = params?.context?.trx!

    let viewableScoutIds: number[] = []

    if(!!params?.data?.scoutId) {
      let scout = await Scout.query({ client: trx })
        .where('id', params.data.scoutId)
        .preload('event')
        .firstOrFail()

      let canViewScout = await AuthorizationHelpers.userCanInTeam({
        data: {
          user: user,
          team: { id: scout.event.teamId },
          action: 'view',
          resource: 'scout'
        },
        context: {
          user, trx
        }
      })

      if(canViewScout) viewableScoutIds.push(params.data.scoutId)
    } else {
      let scouts = await Scout.query({ client: trx })
        .whereHas('event', b => {
          b.whereHas('team', b2 => {
            b2.where(teamsBuilder => {
                teamsBuilder
                  .whereHas('groups', groupsBuilder => {
                    groupsBuilder.whereRaw("cast(groups.cans->:resource->>:action as BOOLEAN) = true", {
                      resource: 'scout',
                      action: 'view'
                    }).whereHas('teammates', b => b.where('userId', user.id))
                  })
                  .orWhere('ownerId', user.id)
              })
          })
        })

      viewableScoutIds = [
        ...viewableScoutIds,
        ...scouts.map((s) => s.id)
      ]
    }

    return viewableScoutIds
  }

  @withTransaction
  @withUser
  public async totalSpikeForPosition(params: {
    data: {
      scoutId?: number
      sets?: number[]
      team?: TeamFilter
    },
    context?: Context
  }): Promise<{
    position: VolleyballScoutEventPosition
    opponent: boolean
    total: number
    percentage: number
    friendsPercentage: number
    opponentsPercentage: number
  }[]> {
    let user = params.context?.user!
    let trx = params.context?.trx!

    await Mongo.init()

    let scoutIds = await this.getViewableScoutIds({
      data: {
        scoutId: params.data.scoutId
      },
      context: { user, trx }
    })

    let totalAggregation: any[] = analysis({
      scoutIds,
      sets: params.data.sets,
      team: params.data.team
    })

    let result = await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .aggregate<{
        position: VolleyballScoutEventPosition,
        opponent: boolean
        total: number
        percentage: number
        friendsPercentage: number
        opponentsPercentage: number
      }>([
        ...totalAggregation,
        {
          $match: {
            type: 'spike'
          },
        },
        {
          $group: {
            _id: ['$position', '$isOpponent'],
            total: {
              $count: {}
            }
          }
        },
        {
          $project: {
            position: {
              $arrayElemAt: ["$_id", 0]
            },
            isOpponent: {
              $arrayElemAt: ["$_id", 1]
            },
            total: "$total"
          }
        },
        {
          $facet: {
            totalNumber: [
              {
                $group: {
                  _id: "",
                  total: {
                    $sum: "$total"
                  },
                  friendsTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$isOpponent", false] },
                        "$total",
                        0
                      ]
                    }
                  },
                  opponentsTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$isOpponent", true] },
                        "$total",
                        0
                      ]
                    }
                  }
                }
              }
            ],
            documents: []
          }
        },
        {
          $addFields: {
            totalNumber: {
              $arrayElemAt: ["$totalNumber", 0]
            }
          }
        },
        {
          $addFields: {
            totalNumber: "$totalNumber.total",
            friendsTotal: "$totalNumber.friendsTotal",
            opponentsTotal: "$totalNumber.opponentsTotal"
          }
        },
        {
          $unwind: {
            path: "$documents"
          }
        },
        {
          $project: {
            position: "$documents.position",
            opponent: "$documents.isOpponent",
            total: "$documents.total",
            percentage: {
              $multiply: [
                {
                  $divide: [
                    "$documents.total",
                    "$totalNumber"
                  ]
                },
                100
              ]
            },
            friendsPercentage: {
              $cond: [
                { $eq: ["$friendsTotal", 0] },
                0,
                {
                  $multiply: [
                    {
                      $divide: [
                        "$documents.total",
                        "$friendsTotal"
                      ]
                    },
                    100
                  ]
                }
              ]
            },
            opponentsPercentage: {
              $cond: [
                { $eq: ["$opponentsTotal", 0] },
                0,
                {
                  $multiply: [
                    {
                      $divide: [
                        "$documents.total",
                        "$opponentsTotal"
                      ]
                    },
                    100
                  ]
                }
              ]
            }
          }
        },
        {
          $sort: {
            position: 1
          }
        }
      ])
      .toArray()

    return result
  }

  @withTransaction
  @withUser
  public async totalSpikeForPlayer(params: {
    data: {
      scoutId?: number
      sets?: number[]
      team?: TeamFilter
    },
    context?: Context
  }): Promise<{
    player: ScoutEventPlayer
    total: number
    points: number
    errors: number
    percentage: number
  }[]> {
    let user = params.context?.user!
    let trx = params.context?.trx!

    await Mongo.init()

    let scoutIds = await this.getViewableScoutIds({
      data: {
        scoutId: params.data.scoutId
      },
      context: { user, trx }
    })

    let totalAggregation: any[] = analysis({
      scoutIds,
      sets: params.data.sets,
      team: params.data.team
    })

    let result = await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .aggregate<{
        player: ScoutEventPlayer
        total: number
        percentage: number,
        points: number
        errors: number
      }>([
        ...totalAggregation,
        {
          $match: {
            type: 'spike'
          },
        },
        {
          $group: {
            _id: "$playerId",
            total: {
              $count: {}
            },
            player: {
              $last: "$player"
            },
            points: {
              $sum: {
                $cond: [
                  { $eq: ["$result", "point"] },
                  1,
                  0
                ]
              }
            },
            errors: {
              $sum: {
                $cond: [
                  { $eq: ["$result", "error"] },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $project: {
            playerId: "$_id",
            total: "$total",
            player: "$player",
            points: "$points",
            errors: "$errors"
          }
        },
        {
          $facet: {
            totalNumber: [
              {
                $group: {
                  _id: "",
                  total: {
                    $sum: "$total"
                  }
                }
              }
            ],
            documents: []
          }
        },
        {
          $addFields: {
            totalNumber: {
              $arrayElemAt: ["$totalNumber", 0]
            }
          }
        },
        {
          $addFields: {
            totalNumber: "$totalNumber.total"
          }
        },
        {
          $unwind: {
            path: "$documents"
          }
        },
        {
          $project: {
            player: "$documents.player",
            total: "$documents.total",
            points: "$documents.points",
            errors: "$documents.errors",
            percentage: {
              $multiply: [
                {
                  $divide: [
                    "$documents.total",
                    "$totalNumber"
                  ]
                },
                100
              ]
            }
          }
        }, {
          $sort: {
            percentage: -1
          }
        }
      ])
      .toArray()

    return result
  }

  @withTransaction
  @withUser
  public async totalSpikeForPlayerAndPosition(params: {
    data: {
      scoutId?: number
      sets?: number[]
      team?: TeamFilter
    },
    context?: Context
  }): Promise<{
    playerId: number
    position: number
    player: ScoutEventPlayer
    total: number
    percentage: number
    points: number
    pointsPercentage: number
    errors: number
    errorsPercentage: number
  }[]> {
    let user = params.context?.user!
    let trx = params.context?.trx!

    await Mongo.init()

    let scoutIds = await this.getViewableScoutIds({
      data: {
        scoutId: params.data.scoutId
      },
      context: { user, trx }
    })

    let totalAggregation: any[] = analysis({
      scoutIds,
      sets: params.data.sets,
      team: params.data.team
    })

    let queryResult = await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .aggregate<{
        playerId: number
        position: number
        player: ScoutEventPlayer
        total: number
        points: number
        errors: number
      }>([
        ...totalAggregation,
        {
          $match: {
            type: 'spike'
          },
        },
        {
          $group: {
            _id: ["$playerId", "$position"],
            total: {
              $count: {}
            },
            player: {
              $last: "$player"
            },
            position: {
              $last: "$position"
            },
            points: {
              $sum: {
                $cond: [
                  { $eq: ["$result", "point"] },
                  1,
                  0
                ]
              }
            },
            errors: {
              $sum: {
                $cond: [
                  { $eq: ["$result", "error"] },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $project: {
            playerId: {
              $arrayElemAt: ["$_id", 0]
            },
            position: {
              $arrayElemAt: ["$_id", 1]
            },
            total: "$total",
            player: "$player",
            points: "$points",
            errors: "$errors"
          }
        }
      ])
      .toArray()

    let totalsForPosition: Record<number, number> = {} // position, total
    let pointsForPosition: Record<number, number> = {} // position, points
    let errorsForPosition: Record<number, number> = {} // position, errors
    for(let i = 0; i < queryResult.length; i += 1) {
      let row = queryResult[i]
      if (!totalsForPosition[row.position]) totalsForPosition[row.position] = 0
      totalsForPosition[row.position] += row.total

      if (!pointsForPosition[row.position]) pointsForPosition[row.position] = 0
      pointsForPosition[row.position] += row.points

      if (!errorsForPosition[row.position]) errorsForPosition[row.position] = 0
      errorsForPosition[row.position] += row.errors
    }

    let result: (
      (typeof queryResult)[number] & {
        percentage: number
        pointsPercentage: number
        errorsPercentage: number
      }
    )[] = []
    for(let i = 0; i < queryResult.length; i += 1) {
      let row = queryResult[i]
      let total = totalsForPosition[row.position]
      let totalPoints = pointsForPosition[row.position]
      let totalErrors = errorsForPosition[row.position]
      // row.total : total = x : 100
      let percentage = (row.total * 100) / total
      let pointsPercentage = (row.points * 100) / totalPoints
      let errorsPercentage = (row.errors * 100) / totalErrors
      result.push({
        ...row,
        percentage,
        pointsPercentage,
        errorsPercentage
      })
    }

    return result
  }
}