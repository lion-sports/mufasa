export function totalAnalysis(params?: {
}) {
  return [
    {
      $group: {
        _id: ["$playerId"],
        player: {
          $last: "$player"
        },
        blockHandsOut: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $eq: ["$type", "block"]
                  },
                  {
                    $eq: ["$result", "handsOut"]
                  }
                ]
              },
              1,
              0
            ]
          }
        },
        blockPoint: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $eq: ["$type", "block"]
                  },
                  {
                    $eq: ["$result", "point"]
                  }
                ]
              },
              1,
              0
            ]
          }
        },
        blockTouch: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $eq: ["$type", "block"]
                  },
                  {
                    $eq: ["$result", "touch"]
                  }
                ]
              },
              1,
              0
            ]
          }
        },
        blockPutBack: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $eq: ["$type", "block"]
                  },
                  {
                    $eq: ["$result", "putBack"]
                  }
                ]
              },
              1,
              0
            ]
          }
        },
        receivePlusPlus: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $eq: ["$type", "receive"]
                  },
                  {
                    $eq: ["$result", "++"]
                  }
                ]
              },
              1,
              0
            ]
          }
        },
        receivePlus: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $eq: ["$type", "receive"]
                  },
                  {
                    $eq: ["$result", "+"]
                  }
                ]
              },
              1,
              0
            ]
          }
        },
        receiveMinus: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $eq: ["$type", "receive"]
                  },
                  {
                    $eq: ["$result", "-"]
                  }
                ]
              },
              1,
              0
            ]
          }
        },
        receiveSlash: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $eq: ["$type", "receive"]
                  },
                  {
                    $eq: ["$result", "/"]
                  }
                ]
              },
              1,
              0
            ]
          }
        },
        receiveError: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $eq: ["$type", "receive"]
                  },
                  {
                    $eq: ["$result", "x"]
                  }
                ]
              },
              1,
              0
            ]
          }
        },
        serveError: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $eq: ["$type", "serve"]
                  },
                  {
                    $eq: ["$result", "error"]
                  }
                ]
              },
              1,
              0
            ]
          }
        },
        servePoint: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $eq: ["$type", "serve"]
                  },
                  {
                    $eq: ["$result", "point"]
                  }
                ]
              },
              1,
              0
            ]
          }
        },
        serveReceived: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $eq: ["$type", "serve"]
                  },
                  {
                    $eq: ["$result", "received"]
                  }
                ]
              },
              1,
              0
            ]
          }
        },
        spikeError: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $eq: ["$type", "spike"]
                  },
                  {
                    $eq: ["$result", "error"]
                  }
                ]
              },
              1,
              0
            ]
          }
        },
        spikePoint: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $eq: ["$type", "spike"]
                  },
                  {
                    $eq: ["$result", "point"]
                  }
                ]
              },
              1,
              0
            ]
          }
        },
        spikeDefense: {
          $sum: {
            $cond: [
              {
                $and: [
                  {
                    $eq: ["$type", "spike"]
                  },
                  {
                    $eq: ["$result", "defense"]
                  }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        player: "$player",
        block: {
          handsOut: "$blockHandsOut",
          point: "$blockPoint",
          putBack: "$blockPutBack",
          touch: "$blockTouch"
        },
        receive: {
          '++': "$receivePlusPlus",
          '+': "$receivePlus",
          '-': "$receiveMinus",
          '/': "$receiveSlash",
          'x': "$receiveError"
        },
        serve: {
          error: "$serveError",
          point: "$servePoint",
          received: "$serveReceived"
        },
        spike: {
          error: "$spikeError",
          point: "$spikePoint",
          received: "$spikeReceived"
        },
      }
    },
    {
      $match: {
        player: {
          $ne: null
        }
      }
    },
    {
      $sort: {
        "player.shirtNumber": 1
      }
    },
  ]
}