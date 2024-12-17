import { TeamFilter } from "../analysis/scoutAnalysis.manager"

export function analysis(params?: {
  scoutIds?: number[],
  sets?: number[],
  team?: TeamFilter
}) {
  return [
    ...(!params?.scoutIds ? [] : [
      {
        $match: {
          scoutId: {
            $in: params.scoutIds.map((si) => Number(si))
          }
        }
      }
    ]),
    {
      $addFields: {
        setNumber: {
          $add: [
            "$points.enemy.sets",
            "$points.friends.sets",
            1
          ]
        },
        isOpponent: "$player.isOpponent"
      }
    },
    ...(!params?.sets ? [] : [
      {
        $match: {
          setNumber: {
            $in: params.sets.map((s) => Number(s))
          }
        }
      }
    ]),
    ...(!params?.sets ? [] : [
      {
        $match: {
          setNumber: {
            $in: params.sets.map((s) => Number(s))
          }
        }
      }
    ]),
    ...(!!params?.team && params.team !== 'both' ? [
      {
        $match: {
          isOpponent: params.team === 'opponent'
        }
      }
    ] : []),
    {
      $addFields: {
        opponentPointIndicator: {
          $add: [
            {
              $multiply: [
                "$points.enemy.sets",
                10000
              ]
            },
            "$points.enemy.points"
          ]
        },
        friendsPointIndicator: {
          $add: [
            {
              $multiply: [
                "$points.friends.sets",
                10000
              ]
            },
            "$points.friends.points"
          ]
        },
        pointIdentifier: {
          $concat: [
            {
              $toString: "$points.friends.sets"
            },
            "_",
            {
              $toString: "$points.friends.points"
            },
            "_",
            {
              $toString: "$points.enemy.sets"
            },
            "_",
            {
              $toString: "$points.enemy.points"
            }
          ]
        }
      }
    },
    {
      $fill: {
        sortBy: {
          date: 1
        },
        output: {
          phase: {
            method: "locf"
          }
        }
      }
    }
  ]
}