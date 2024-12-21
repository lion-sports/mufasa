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

  @withTransaction
  @withUser
  public async totalServe(params: {
    data: {
      scoutId?: number
      sets?: number[]
      team?: TeamFilter
    },
    context?: Context
  }): Promise<{
    opponent: boolean
    total: number
    points: number
    errors: number
    pointsPercentage: number
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

    let result = await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .aggregate<{
        opponent: boolean
        total: number
        points: number
        errors: number
        pointsPercentage: number
        errorsPercentage: number
      }>([
        ...totalAggregation,
        {
          $match: {
            type: 'serve'
          },
        },
        {
          $group: {
            _id: ["$isOpponent"],
            total: {
              $count: {}
            },
            opponent: {
              $last: "$isOpponent"
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
          $addFields: {
            pointsPercentage: {
              $multiply: [
                {
                  $divide: [
                    "$points",
                    "$total"
                  ]
                },
                100
              ]
            },
            errorsPercentage: {
              $multiply: [
                {
                  $divide: [
                    "$errors",
                    "$total"
                  ]
                },
                100
              ]
            },
          }
        },
      ])
      .toArray()

    return result
  }

  @withTransaction
  @withUser
  public async totalServeByPlayer(params: {
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
    pointsPercentage: number
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

    let result = await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .aggregate<{
        player: ScoutEventPlayer
        total: number
        points: number
        errors: number
        pointsPercentage: number
        errorsPercentage: number
      }>([
        ...totalAggregation,
        {
          $match: {
            type: 'serve'
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
            opponent: "$player.isOpponent",
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
                  },
                  friendsErrorsTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", false] },
                        "$errors",
                        0
                      ]
                    }
                  },
                  opponentsErrorsTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", true] },
                        "$errors",
                        0
                      ]
                    }
                  },
                  friendsPointsTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", false] },
                        "$points",
                        0
                      ]
                    }
                  },
                  opponentsPointsTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", true] },
                        "$points",
                        0
                      ]
                    }
                  },
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
            },
          }
        },
        {
          $addFields: {
            totalNumber: "$totalNumber.total",
            friendsErrorsTotal: "$totalNumber.friendsErrorsTotal",
            opponentsErrorsTotal: "$totalNumber.opponentsErrorsTotal",
            friendsPointsTotal: "$totalNumber.friendsPointsTotal",
            opponentsPointsTotal: "$totalNumber.opponentsPointsTotal",
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
            },
            errorsPercentage: {
              $cond: [
                { $eq: ["$documents.opponent", false] },
                {
                  $cond: [
                    { $eq: ["$friendsErrorsTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.errors",
                            "$friendsErrorsTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                },
                {
                  $cond: [
                    { $eq: ["$opponentsErrorsTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.errors",
                            "$opponentsErrorsTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                }
              ],
            },
            pointsPercentage: {
              $cond: [
                { $eq: ["$documents.opponent", false] },
                {
                  $cond: [
                    { $eq: ["$friendsPointsTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.points",
                            "$friendsPointsTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                },
                {
                  $cond: [
                    { $eq: ["$opponentsPointsTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.points",
                            "$opponentsPointsTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                }
              ],
            },
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
  public async totalBlock(params: {
    data: {
      scoutId?: number
      sets?: number[]
      team?: TeamFilter
    },
    context?: Context
  }): Promise<{
    opponent: boolean
    total: number
    points: number
    handsOut: number
    touch: number
    putBack: number
    pointsPercentage: number
    handsOutPercentage: number
    touchPercentage: number
    putBackPercentage: number
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

    // 'handsOut' | 'point' | 'touch' | 'putBack';

    let result = await Mongo.db
      .collection(SCOUT_EVENT_COLLECTION_NAME)
      .aggregate<{
        opponent: boolean
        total: number
        points: number
        handsOut: number
        touch: number
        putBack: number
        pointsPercentage: number
        handsOutPercentage: number
        touchPercentage: number
        putBackPercentage: number
      }>([
        ...totalAggregation,
        {
          $match: {
            type: 'block'
          },
        },
        {
          $group: {
            _id: ["$isOpponent"],
            total: {
              $count: {}
            },
            opponent: {
              $last: "$isOpponent"
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
            handsOut: {
              $sum: {
                $cond: [
                  { $eq: ["$result", "handsOut"] },
                  1,
                  0
                ]
              }
            }, 
            touch: {
              $sum: {
                $cond: [
                  { $eq: ["$result", "touch"] },
                  1,
                  0
                ]
              }
            },
            putBack: {
              $sum: {
                $cond: [
                  { $eq: ["$result", "putBack"] },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $addFields: {
            pointsPercentage: {
              $multiply: [
                {
                  $divide: [
                    "$points",
                    "$total"
                  ]
                },
                100
              ]
            },
            handsOutPercentage: {
              $multiply: [
                {
                  $divide: [
                    "$handsOut",
                    "$total"
                  ]
                },
                100
              ]
            },
            touchPercentage: {
              $multiply: [
                {
                  $divide: [
                    "$touch",
                    "$total"
                  ]
                },
                100
              ]
            },
            putBackPercentage: {
              $multiply: [
                {
                  $divide: [
                    "$putBack",
                    "$total"
                  ]
                },
                100
              ]
            },
          }
        },
      ])
      .toArray()

    return result
  }

  @withTransaction
  @withUser
  public async totalBlockByPlayer(params: {
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
    handsOut: number
    touch: number
    putBack: number
    pointsPercentage: number
    handsOutPercentage: number
    touchPercentage: number
    putBackPercentage: number
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
        points: number
        handsOut: number
        touch: number
        putBack: number
        pointsPercentage: number
        handsOutPercentage: number
        touchPercentage: number
        putBackPercentage: number
      }>([
        ...totalAggregation,
        {
          $match: {
            type: 'block'
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
            handsOut: {
              $sum: {
                $cond: [
                  { $eq: ["$result", "handsOut"] },
                  1,
                  0
                ]
              }
            },
            touch: {
              $sum: {
                $cond: [
                  { $eq: ["$result", "touch"] },
                  1,
                  0
                ]
              }
            },
            putBack: {
              $sum: {
                $cond: [
                  { $eq: ["$result", "putBack"] },
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
            opponent: "$player.isOpponent",
            total: "$total",
            player: "$player",
            points: "$points",
            handsOut: "$handsOut",
            touch: "$touch",
            putBack: "$putBack"
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
                  friendsHandsOutTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", false] },
                        "$handsOut",
                        0
                      ]
                    }
                  },
                  opponentsHandsOutTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", true] },
                        "$handsOut",
                        0
                      ]
                    }
                  },
                  friendsPointsTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", false] },
                        "$points",
                        0
                      ]
                    }
                  },
                  opponentsPointsTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", true] },
                        "$points",
                        0
                      ]
                    }
                  },
                  friendsTouchTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", false] },
                        "$touch",
                        0
                      ]
                    }
                  },
                  opponentsTouchTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", true] },
                        "$touch",
                        0
                      ]
                    }
                  },
                  friendsPutBackTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", false] },
                        "$putBack",
                        0
                      ]
                    }
                  },
                  opponentsPutBackTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", true] },
                        "$putBack",
                        0
                      ]
                    }
                  },
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
            },
          }
        },
        {
          $addFields: {
            totalNumber: "$totalNumber.total",
            friendsHandsOutTotal: "$totalNumber.friendsHandsOutTotal",
            opponentsHandsOutTotal: "$totalNumber.opponentsHandsOutTotal",
            friendsPointsTotal: "$totalNumber.friendsPointsTotal",
            opponentsPointsTotal: "$totalNumber.opponentsPointsTotal",
            friendsTouchTotal: "$totalNumber.friendsTouchTotal",
            opponentsTouchTotal: "$totalNumber.opponentsTouchTotal",
            friendsPutBackTotal: "$totalNumber.friendsPutBackTotal",
            opponentsPutBackTotal: "$totalNumber.opponentsPutBackTotal"
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
            handsOut: "$documents.handsOut",
            putBack: "$documents.putBack",
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
            handsOutPercentage: {
              $cond: [
                { $eq: ["$documents.opponent", false] },
                {
                  $cond: [
                    { $eq: ["$friendsHandsOutTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.handsOut",
                            "$friendsHandsOutTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                },
                {
                  $cond: [
                    { $eq: ["$opponentsHandsOutTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.handsOut",
                            "$opponentsHandsOutTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                }
              ],
            },
            pointsPercentage: {
              $cond: [
                { $eq: ["$documents.opponent", false] },
                {
                  $cond: [
                    { $eq: ["$friendsPointsTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.points",
                            "$friendsPointsTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                },
                {
                  $cond: [
                    { $eq: ["$opponentsPointsTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.points",
                            "$opponentsPointsTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                }
              ],
            },
            touchPercentage: {
              $cond: [
                { $eq: ["$documents.opponent", false] },
                {
                  $cond: [
                    { $eq: ["$friendsTouchTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.touch",
                            "$friendsTouchTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                },
                {
                  $cond: [
                    { $eq: ["$opponentsTouchTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.touch",
                            "$opponentsTouchTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                }
              ],
            },
            putBackPercentage: {
              $cond: [
                { $eq: ["$documents.opponent", false] },
                {
                  $cond: [
                    { $eq: ["$friendsPutBackTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.putBack",
                            "$friendsPutBackTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                },
                {
                  $cond: [
                    { $eq: ["$opponentsPutBackTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.putBack",
                            "$opponentsPutBackTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                }
              ],
            },
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
  public async totalReceive(params: {
    data: {
      scoutId?: number
      sets?: number[]
      team?: TeamFilter
    },
    context?: Context
  }): Promise<{
    opponent: boolean
    total: number
    perfect: number
    plus: number
    minus: number
    slash: number
    error: number
    perfectPercentage: number
    plusPercentage: number
    minusPercentage: number
    slashPercentage: number
    errorPercentage: number
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
        opponent: boolean
        total: number
        perfect: number
        plus: number
        minus: number
        slash: number
        error: number
        perfectPercentage: number
        plusPercentage: number
        minusPercentage: number
        slashPercentage: number
        errorPercentage: number
      }>([
        ...totalAggregation,
        {
          $match: {
            type: 'receive'
          },
        },
        {
          $group: {
            _id: ["$isOpponent"],
            total: {
              $count: {}
            },
            opponent: {
              $last: "$isOpponent"
            },
            perfect: {
              $sum: {
                $cond: [
                  { $eq: ["$result", "++"] },
                  1,
                  0
                ]
              }
            },
            plus: {
              $sum: {
                $cond: [
                  { $eq: ["$result", "+"] },
                  1,
                  0
                ]
              }
            },
            minus: {
              $sum: {
                $cond: [
                  { $eq: ["$result", "-"] },
                  1,
                  0
                ]
              }
            },
            slash: {
              $sum: {
                $cond: [
                  { $eq: ["$result", "/"] },
                  1,
                  0
                ]
              }
            },
            error: {
              $sum: {
                $cond: [
                  { $eq: ["$result", "x"] },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $addFields: {
            perfectPercentage: {
              $multiply: [
                {
                  $divide: [
                    "$perfect",
                    "$total"
                  ]
                },
                100
              ]
            },
            plusPercentage: {
              $multiply: [
                {
                  $divide: [
                    "$plus",
                    "$total"
                  ]
                },
                100
              ]
            },
            minusPercentage: {
              $multiply: [
                {
                  $divide: [
                    "$minus",
                    "$total"
                  ]
                },
                100
              ]
            },
            slashPercentage: {
              $multiply: [
                {
                  $divide: [
                    "$slash",
                    "$total"
                  ]
                },
                100
              ]
            },
            errorPercentage: {
              $multiply: [
                {
                  $divide: [
                    "$error",
                    "$total"
                  ]
                },
                100
              ]
            },
          }
        },
      ])
      .toArray()

    return result
  }

  @withTransaction
  @withUser
  public async totalReceiveByPlayer(params: {
    data: {
      scoutId?: number
      sets?: number[]
      team?: TeamFilter
    },
    context?: Context
  }): Promise<{
    player: ScoutEventPlayer
    total: number
    perfect: number
    plus: number
    minus: number
    slash: number
    error: number
    perfectPercentage: number
    plusPercentage: number
    minusPercentage: number
    slashPercentage: number
    errorPercentage: number
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
        perfect: number
        plus: number
        minus: number
        slash: number
        error: number
        perfectPercentage: number
        plusPercentage: number
        minusPercentage: number
        slashPercentage: number
        errorPercentage: number
      }>([
        ...totalAggregation,
        {
          $match: {
            type: 'receive'
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
            perfect: {
              $sum: {
                $cond: [
                  { $eq: ["$result", "++"] },
                  1,
                  0
                ]
              }
            },
            plus: {
              $sum: {
                $cond: [
                  { $eq: ["$result", "+"] },
                  1,
                  0
                ]
              }
            },
            minus: {
              $sum: {
                $cond: [
                  { $eq: ["$result", "-"] },
                  1,
                  0
                ]
              }
            },
            slash: {
              $sum: {
                $cond: [
                  { $eq: ["$result", "/"] },
                  1,
                  0
                ]
              }
            },
            error: {
              $sum: {
                $cond: [
                  { $eq: ["$result", "x"] },
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
            opponent: "$player.isOpponent",
            total: "$total",
            player: "$player",
            perfect: "$perfect",
            plus: "$plus",
            minus: "$minus",
            slash: "$slash",
            error: "$error"
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
                  friendsPerfectTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", false] },
                        "$perfect",
                        0
                      ]
                    }
                  },
                  opponentsPerfectTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", true] },
                        "$perfect",
                        0
                      ]
                    }
                  },
                  friendsPlusTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", false] },
                        "$plus",
                        0
                      ]
                    }
                  },
                  opponentsPlusTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", true] },
                        "$plus",
                        0
                      ]
                    }
                  },
                  friendsMinusTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", false] },
                        "$minus",
                        0
                      ]
                    }
                  },
                  opponentsMinusTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", true] },
                        "$minus",
                        0
                      ]
                    }
                  },
                  friendsSlashTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", false] },
                        "$slash",
                        0
                      ]
                    }
                  },
                  opponentsSlashTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", true] },
                        "$slash",
                        0
                      ]
                    }
                  },
                  friendsErrorTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", false] },
                        "$error",
                        0
                      ]
                    }
                  },
                  opponentsErrorTotal: {
                    $sum: {
                      $cond: [
                        { $eq: ["$opponent", true] },
                        "$error",
                        0
                      ]
                    }
                  },
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
            },
          }
        },
        {
          $addFields: {
            totalNumber: "$totalNumber.total",
            friendsPerfectTotal: "$totalNumber.friendsPerfectTotal",
            opponentsPerfectTotal: "$totalNumber.opponentsPerfectTotal",
            friendsPlusTotal: "$totalNumber.friendsPlusTotal",
            opponentsPlusTotal: "$totalNumber.opponentsPlusTotal",
            friendsMinusTotal: "$totalNumber.friendsMinusTotal",
            opponentsMinusTotal: "$totalNumber.opponentsMinusTotal",
            friendsSlashTotal: "$totalNumber.friendsSlashTotal",
            opponentsSlashTotal: "$totalNumber.opponentsSlashTotal",
            friendsErrorTotal: "$totalNumber.friendsErrorTotal",
            opponentsErrorTotal: "$totalNumber.opponentsErrorTotal"
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
            perfect: "$documents.perfect",
            plus: "$documents.plus",
            minus: "$documents.minus",
            slash: "$documents.slash",
            error: "$documents.error",
            perfectPercentage: {
              $cond: [
                { $eq: ["$documents.opponent", false] },
                {
                  $cond: [
                    { $eq: ["$friendsPerfectTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.handsOut",
                            "$friendsPerfectTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                },
                {
                  $cond: [
                    { $eq: ["$opponentsPerfectTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.perfect",
                            "$opponentsPerfectTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                }
              ],
            },
            plusPercentage: {
              $cond: [
                { $eq: ["$documents.opponent", false] },
                {
                  $cond: [
                    { $eq: ["$friendsPlusTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.plus",
                            "$friendsPlusTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                },
                {
                  $cond: [
                    { $eq: ["$opponentsPlusTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.plus",
                            "$opponentsPlusTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                }
              ],
            },
            minusPercentage: {
              $cond: [
                { $eq: ["$documents.opponent", false] },
                {
                  $cond: [
                    { $eq: ["$friendsMinusTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.minus",
                            "$friendsMinusTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                },
                {
                  $cond: [
                    { $eq: ["$opponentsMinusTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.minus",
                            "$opponentsMinusTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                }
              ],
            },
            slashPercentage: {
              $cond: [
                { $eq: ["$documents.opponent", false] },
                {
                  $cond: [
                    { $eq: ["$friendsSlashTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.slash",
                            "$friendsSlashTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                },
                {
                  $cond: [
                    { $eq: ["$opponentsSlashTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.slash",
                            "$opponentsSlashTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                }
              ],
            },
            errorPercentage: {
              $cond: [
                { $eq: ["$documents.opponent", false] },
                {
                  $cond: [
                    { $eq: ["$friendsErrorTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.error",
                            "$friendsErrorTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                },
                {
                  $cond: [
                    { $eq: ["$opponentsErrorTotal", 0] },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$documents.error",
                            "$opponentsErrorTotal"
                          ]
                        },
                        100
                      ]
                    }
                  ]
                }
              ],
            },
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
}