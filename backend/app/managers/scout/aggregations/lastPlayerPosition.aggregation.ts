import Scout from "App/Models/Scout";
import { SCOUT_EVENT_COLLECTION_NAME } from "../ScoutEvent";

export function lastPlayerPositionAggregation(params: {
  scout: Scout
  friendSet?: number
  enemySet?: number
}) {
  let friendsSet = params.scout.stash.points?.friends.sets || params.friendSet || 0
  let enemySet = params.scout.stash.points?.enemy.sets || params.enemySet || 0

  return [
    {
      $match: {
        cond: false
      }
    },
    {
      $unionWith: {
        coll: SCOUT_EVENT_COLLECTION_NAME,
        pipeline: [
          {
            $match: {
              type: "teamRotation",
              scoutId: params.scout.id,
              $and: [
                { 'points.friends.sets': friendsSet },
                { 'points.enemy.sets': enemySet },
              ]
            }
          },
          {
            $sort: {
              date: 1
            }
          },
          {
            $project: {
              friendsPlayersFromRotation: {
                $objectToArray:
                  "$newPositions.friends"
              },
              date: "$date",
              type: "teamRotation"
            }
          },
          {
            $unwind: {
              path: "$friendsPlayersFromRotation"
            }
          },
          {
            $addFields: {
              isOpponent: false
            }
          },
          {
            $group: {
              _id: [
                "$friendsPlayersFromRotation.k",
                "$isOpponent"
              ],
              lastPlayer: {
                $last:
                  "$friendsPlayersFromRotation.v.player"
              },
              lastDate: {
                $last: "$date"
              },
              type: {
                $last: "$type"
              }
            }
          }
        ]
      }
    },
    {
      $unionWith: {
        coll: SCOUT_EVENT_COLLECTION_NAME,
        pipeline: [
          {
            $match: {
              type: "teamRotation",
              scoutId: params.scout.id,
              $and: [
                { 'points.friends.sets': friendsSet },
                { 'points.enemy.sets': enemySet },
              ]
            }
          },
          {
            $sort: {
              date: 1
            }
          },
          {
            $project: {
              enemyPlayersFromRotation: {
                $objectToArray:
                  "$newPositions.enemy"
              },
              date: "$date",
              type: "teamRotation"
            }
          },
          {
            $unwind: {
              path: "$enemyPlayersFromRotation"
            }
          },
          {
            $addFields: {
              isOpponent: true
            }
          },
          {
            $group: {
              _id: [
                "$enemyPlayersFromRotation.k",
                "$isOpponent"
              ],
              lastPlayer: {
                $last: "$enemyPlayersFromRotation.v.player"
              },
              lastDate: {
                $last: "$date"
              },
              type: {
                $last: "$type"
              }
            }
          }
        ]
      }
    },
    {
      $unionWith:
      {
        coll: SCOUT_EVENT_COLLECTION_NAME,
        pipeline: [
          {
            $match: {
              type: "playerInPosition",
              scoutId: params.scout.id,
              $and: [
                { 'points.friends.sets': friendsSet },
                { 'points.enemy.sets': enemySet },
              ]
            }
          },
          {
            $sort: {
              date: 1
            }
          },
          {
            $group: {
              _id: [
                {
                  $toString: "$position"
                },
                "$playerIsOpponent"
              ],
              lastPlayer: {
                $last: "$player"
              },
              lastDate: {
                $last: "$date"
              },
              type: {
                $last: "$type"
              }
            }
          }
        ]
      }
    },
    {
      $unionWith:
      {
        coll: SCOUT_EVENT_COLLECTION_NAME,
        pipeline: [
          {
            $match: {
              type: "playerSubstitution",
              scoutId: params.scout.id,
              $and: [
                { 'points.friends.sets': friendsSet },
                { 'points.enemy.sets': enemySet },
              ]
            }
          },
          {
            $sort: {
              date: 1
            }
          },
          {
            $group: {
              _id: [
                {
                  $toString: "$position"
                },
                "$playerIsOpponent"
              ],
              lastPlayer: {
                $last: "$playerIn"
              },
              lastDate: {
                $last: "$date"
              },
              type: {
                $last: "$type"
              }
            }
          }
        ]
      }
    },
    {
      $unionWith: {
        coll: SCOUT_EVENT_COLLECTION_NAME,
        pipeline: [
          {
            $match: {
              type: "liberoSubstitution",
              inOrOut: "in",
              scoutId: params.scout.id,
              $and: [
                { 'points.friends.sets': friendsSet },
                { 'points.enemy.sets': enemySet },
              ]
            }
          },
          {
            $sort: {
              date: 1
            }
          },
          {
            $group: {
              _id: [
                {
                  $toString: "$position"
                },
                "$opponent"
              ],
              lastPlayer: {
                $last: "$libero"
              },
              lastDate: {
                $last: "$date"
              },
              type: {
                $last: "$type"
              }
            }
          }
        ]
      }
    },
    {
      $unionWith: {
        coll: SCOUT_EVENT_COLLECTION_NAME,
        pipeline: [
          {
            $match: {
              type: "liberoSubstitution",
              inOrOut: "out",
              scoutId: params.scout.id,
              $and: [
                { 'points.friends.sets': friendsSet },
                { 'points.enemy.sets': enemySet },
              ]
            }
          },
          {
            $sort: {
              date: 1
            }
          },
          {
            $group: {
              _id: [
                {
                  $toString: "$position"
                },
                "$opponent"
              ],
              lastPlayer: {
                $last: "$player"
              },
              lastDate: {
                $last: "$date"
              },
              type: {
                $last: "$type"
              }
            }
          }
        ]
      }
    },
    {
      $sort:
      {
        lastDate: 1
      }
    },
    {
      $group:
      {
        _id: "$_id",
        player: {
          $last: "$lastPlayer"
        }
      }
    },
    {
      $match:
      {
        player: {
          $ne: null
        }
      }
    }
  ]
}