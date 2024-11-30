export function totalAnalysis(params?: {}) {

  return [
    [
      {
        $addFields: {
          setNumber: {
            $add: [
              "$points.enemy.sets",
              "$points.friends.sets"
            ]
          }
        }
      },
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
      },
      // TODO
      // this lookup query is too slow, try to find a way to get if the point has been win or not
      // however the result is accettable if the events are fews (300-500)
      // {
      //   $lookup: {
      //     from: "scout_events",
      //     localField: "scoutId",
      //     foreignField: "scoutId",
      //     let: {
      //       pointIdentifier: "$pointIdentifier"
      //     },
      //     pipeline: [
      //       {
      //         $match: {
      //           type: "pointScored"
      //         }
      //       },
      //       {
      //         $project: {
      //           pointIdentifier: {
      //             $concat: [
      //               {
      //                 $toString:
      //                   "$points.friends.sets"
      //               },
      //               "_",
      //               {
      //                 $toString:
      //                   "$points.friends.points"
      //               },
      //               "_",
      //               {
      //                 $toString: "$points.enemy.sets"
      //               },
      //               "_",
      //               {
      //                 $toString:
      //                   "$points.enemy.points"
      //               }
      //             ]
      //           },
      //           pointScoredBy: {
      //             $cond: [
      //               "$opponent",
      //               "opponent",
      //               "friends"
      //             ]
      //           },
      //           scoutId: "$scoutId"
      //         }
      //       },
      //       {
      //         $match: {
      //           $expr: {
      //             $eq: [
      //               "$pointIdentifier",
      //               "$$pointIdentifier"
      //             ]
      //           }
      //         }
      //       }
      //     ],
      //     as: "pointInfo"
      //   }
      // }
    ]
  ]
}