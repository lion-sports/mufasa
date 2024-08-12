import { Role, VolleyballRole } from "App/Models/Teammate";
import ScoutEvent, { ScoutEventJson } from "../../ScoutEvent";
import { VolleyballPoints, VolleyballPlayersPosition, VolleyballScoutEventPosition, VolleyballScoutEventAnchor, VolleyballPlayersDynamicPosition } from "./common";
import lodash from 'lodash'
import { ScoutEventPlayer } from "App/Models/Player";

export type TeamRotationScoutExtraProperties = {
  opponent: boolean,
  newPositions: VolleyballPlayersPosition
}
export type TeamRotationScoutEventJson = ScoutEventJson<'teamRotation', 'volleyball'> & TeamRotationScoutExtraProperties

export type RotationType = 'backward' | 'forward'

export const SETTER_POSITION_TO_ROLES_POSITIONS: {
  [Key in VolleyballScoutEventPosition]?: {
    serve: {
      [Key in VolleyballScoutEventPosition]?: `${Role}${':1' | ':2' | ''}`
    },
    defenseBreak: {
      [Key in VolleyballScoutEventPosition]?: `${Role}${':1' | ':2' | ''}`
    },
    defenseSideOut: {
      [Key in VolleyballScoutEventPosition]?: `${Role}${':1' | ':2' | ''}`
    }
  }
} = {
  1: {
    serve: {
      1: 'setter',
      2: 'outsideHitter:1',
      3: 'middleBlocker:2',
      4: 'oppositeHitter',
      5: 'outsideHitter:2',
      6: 'libero'
    },
    defenseBreak: {
      1: 'setter',
      2: 'oppositeHitter',
      3: 'middleBlocker:2',
      4: 'outsideHitter:1',
      5: 'libero',
      6: 'outsideHitter:2'
    },
    defenseSideOut: {
      1: 'setter',
      2: 'outsideHitter:1',
      3: 'middleBlocker:2',
      4: 'oppositeHitter',
      5: 'libero',
      6: 'outsideHitter:2'
    },
  },
  2: {
    serve: {
      1: 'middleBlocker:1',
      2: 'setter',
      3: 'outsideHitter:1',
      4: 'middleBlocker:2',
      5: 'oppositeHitter',
      6: 'outsideHitter:2'
    },
    defenseBreak: {
      1: 'oppositeHitter',
      2: 'setter',
      3: 'middleBlocker:2',
      4: 'outsideHitter:1',
      5: 'middleBlocker:2',
      6: 'outsideHitter:2'
    },
    defenseSideOut: {
      1: 'oppositeHitter',
      2: 'setter',
      3: 'middleBlocker:2',
      4: 'outsideHitter:1',
      5: 'libero',
      6: 'outsideHitter:2'
    },
  },
  3: {
    serve: {
      1: 'outsideHitter:2',
      2: 'middleBlocker:1',
      3: 'setter',
      4: 'outsideHitter:1',
      5: 'libero',
      6: 'oppositeHitter'
    },
    defenseBreak: {
      1: 'oppositeHitter',
      2: 'setter',
      3: 'middleBlocker:1',
      4: 'outsideHitter:1',
      5: 'libero',
      6: 'outsideHitter:2'
    },
    defenseSideOut: {
      1: 'oppositeHitter',
      2: 'setter',
      3: 'middleBlocker:1',
      4: 'outsideHitter:1',
      5: 'libero',
      6: 'outsideHitter:2'
    },
  }, 
  4: {
    serve: {
      1: 'oppositeHitter',
      2: 'outsideHitter:2',
      3: 'middleBlocker:1',
      4: 'setter',
      5: 'outsideHitter:1',
      6: 'libero'
    },
    defenseBreak: {
      1: 'oppositeHitter',
      2: 'setter',
      3: 'middleBlocker:1',
      4: 'outsideHitter:2',
      5: 'libero',
      6: 'outsideHitter:1'
    },
    defenseSideOut: {
      1: 'oppositeHitter',
      2: 'setter',
      3: 'middleBlocker:1',
      4: 'outsideHitter:2',
      5: 'libero',
      6: 'outsideHitter:1'
    },
  },
  5: {
    serve: {
      1: 'middleBlocker:2',
      2: 'oppositeHitter',
      3: 'outsideHitter:2',
      4: 'middleBlocker:1',
      5: 'setter',
      6: 'outsideHitter:1'
    },
    defenseBreak: {
      1: 'setter',
      2: 'oppositeHitter',
      3: 'middleBlocker:1',
      4: 'outsideHitter:2',
      5: 'middleBlocker:2',
      6: 'outsideHitter:1'
    },
    defenseSideOut: {
      1: 'setter',
      2: 'oppositeHitter',
      3: 'middleBlocker:1',
      4: 'outsideHitter:2',
      5: 'libero',
      6: 'outsideHitter:1'
    },
  },
  6: {
    serve: {
      1: 'outsideHitter:1',
      2: 'middleBlocker:2',
      3: 'oppositeHitter',
      4: 'outsideHitter:2',
      5: 'libero',
      6: 'setter'
    },
    defenseBreak: {
      1: 'setter',
      2: 'oppositeHitter',
      3: 'middleBlocker:2',
      4: 'outsideHitter:2',
      5: 'libero',
      6: 'outsideHitter:1'
    },
    defenseSideOut: {
      1: 'setter',
      2: 'oppositeHitter',
      3: 'middleBlocker:2',
      4: 'outsideHitter:2',
      5: 'libero',
      6: 'outsideHitter:1'
    },
  }
}

export const SETTER_POSITION_TO_ROLES_RECEIVES_POSITIONS: {
  [Key in VolleyballScoutEventPosition]?: {
    positions: {
      [Key in `${Role}${':1'|':2'|''}`]?: {
        position: VolleyballScoutEventPosition,
        anchor: VolleyballScoutEventAnchor
      }
    }
  }
} = {
  1: {
    positions: {
      'setter': {
        position: 1,
        anchor: 7
      },
      'outsideHitter:1': {
        position: 1,
        anchor: 13
      },
      'middleBlocker:2': {
        position: 3,
        anchor: 13
      },
      'oppositeHitter': {
        position: 4,
        anchor: 13
      },
      'outsideHitter:2': {
        position: 5,
        anchor: 13
      },
      'libero': {
        position: 6,
        anchor: 13
      },
    }
  },
  2: {
    positions: {
      'setter': {
        position: 3,
        anchor: 18
      },
      'outsideHitter:1': {
        position: 5,
        anchor: 13
      },
      'middleBlocker:2': {
        position: 4,
        anchor: 9
      },
      'oppositeHitter': {
        position: 6,
        anchor: 9
      },
      'outsideHitter:2': {
        position: 6,
        anchor: 13
      },
      'libero': {
        position: 1,
        anchor: 13
      },
    }
  },
  3: {
    positions: {
      'setter': {
        position: 3,
        anchor: 18
      },
      'outsideHitter:1': {
        position: 5,
        anchor: 13
      },
      'middleBlocker:1': {
        position: 2,
        anchor: 7
      },
      'oppositeHitter': {
        position: 6,
        anchor: 7
      },
      'outsideHitter:2': {
        position: 1,
        anchor: 13
      },
      'libero': {
        position: 6,
        anchor: 13
      },
    }
  },
  4: {
    positions: {
      'setter': {
        position: 4,
        anchor: 19
      },
      'outsideHitter:1': {
        position: 6,
        anchor: 13
      },
      'middleBlocker:1': {
        position: 4,
        anchor: 9
      },
      'oppositeHitter': {
        position: 1,
        anchor: 7
      },
      'outsideHitter:2': {
        position: 5,
        anchor: 13
      },
      'libero': {
        position: 1,
        anchor: 13
      },
    }
  },
  5: {
    positions: {
      'setter': {
        position: 3,
        anchor: 9
      },
      'outsideHitter:1': {
        position: 6,
        anchor: 13
      },
      'middleBlocker:1': {
        position: 4,
        anchor: 9
      },
      'oppositeHitter': {
        position: 2,
        anchor: 7
      },
      'outsideHitter:2': {
        position: 5,
        anchor: 13
      },
      'libero': {
        position: 1,
        anchor: 13
      },
    }
  },
  6: {
    positions: {
      'setter': {
        position: 3,
        anchor: 13
      },
      'outsideHitter:1': {
        position: 1,
        anchor: 13
      },
      'middleBlocker:2': {
        position: 2,
        anchor: 7
      },
      'oppositeHitter': {
        position: 2,
        anchor: 19
      },
      'outsideHitter:2': {
        position: 5,
        anchor: 13
      },
      'libero': {
        position: 6,
        anchor: 13
      },
    }
  }
}


export default class TeamRotationScoutEvent extends ScoutEvent<
  {
    opponent: boolean,
    rotationType: RotationType,
    fromPositions: VolleyballPlayersPosition
  }, 
  'teamRotation', 
  VolleyballPoints,
  TeamRotationScoutExtraProperties
> {
  public type = 'teamRotation' as const
  public newPositions: VolleyballPlayersPosition

  constructor(params) {
    let newPosition = TeamRotationScoutEvent.rotate({
      position: params.fromPositions,
      opponent: params.opponent,
      rotationType: params.rotationType
    })

    super({
      ...params,
      opponent: params.opponent,
      rotationType: params.rotationType,
      newPosition: newPosition
    })

    this.type = params.type
  }

  protected getExtraProperties(): TeamRotationScoutExtraProperties {
    return {
      opponent: this.event.opponent,
      newPositions: this.newPositions
    }
  }

  public static rotate(params: {
    position: VolleyballPlayersPosition,
    opponent: boolean,
    rotationType?: 'backword' | 'forward'
  }): VolleyballPlayersPosition {
    let newPosition: typeof params.position = lodash.cloneDeep(params.position)

    if(params.opponent) {
      if(params.rotationType == 'backword') {
        newPosition.enemy[1] = params.position.enemy[2]
        newPosition.enemy[2] = params.position.enemy[3]
        newPosition.enemy[3] = params.position.enemy[4]
        newPosition.enemy[4] = params.position.enemy[5]
        newPosition.enemy[5] = params.position.enemy[6]
        newPosition.enemy[6] = params.position.enemy[1]
      } else {
        newPosition.enemy[1] = params.position.enemy[6]
        newPosition.enemy[2] = params.position.enemy[1]
        newPosition.enemy[3] = params.position.enemy[2]
        newPosition.enemy[4] = params.position.enemy[3]
        newPosition.enemy[5] = params.position.enemy[4]
        newPosition.enemy[6] = params.position.enemy[5]
      }
    } else {
      if (params.rotationType == 'backword') {
        newPosition.friends[1] = params.position.friends[2]
        newPosition.friends[2] = params.position.friends[3]
        newPosition.friends[3] = params.position.friends[4]
        newPosition.friends[4] = params.position.friends[5]
        newPosition.friends[5] = params.position.friends[6]
        newPosition.friends[6] = params.position.friends[1]
      } else {
        newPosition.friends[1] = params.position.friends[6]
        newPosition.friends[2] = params.position.friends[1]
        newPosition.friends[3] = params.position.friends[2]
        newPosition.friends[4] = params.position.friends[3]
        newPosition.friends[5] = params.position.friends[4]
        newPosition.friends[6] = params.position.friends[5]
      }
    }

    return newPosition
  }

  public static getPlayersPositions(params: {
    positions: VolleyballPlayersPosition
  }): {
    playersServePositions: VolleyballPlayersPosition,
    playersReceivePositions?: VolleyballPlayersDynamicPosition | undefined,
    playersDefenseBreakPositions: VolleyballPlayersPosition,
    playersDefenseSideoutPositions: VolleyballPlayersPosition,
  } {
    let playersServePositions: VolleyballPlayersPosition = lodash.cloneDeep(params.positions),
      playersReceivePositions: VolleyballPlayersDynamicPosition,
      playersDefenseBreakPositions: VolleyballPlayersPosition = lodash.cloneDeep(params.positions),
      playersDefenseSideoutPositions: VolleyballPlayersPosition = lodash.cloneDeep(params.positions)

    playersServePositions.enemy = this.getPhasePosition({
      phase: 'serve',
      friendsOrEnemyPositions: params.positions.enemy
    })

    playersServePositions.friends = this.getPhasePosition({
      phase: 'serve',
      friendsOrEnemyPositions: params.positions.friends
    })

    playersDefenseBreakPositions.enemy = this.getPhasePosition({
      phase: 'defenseBreak',
      friendsOrEnemyPositions: params.positions.enemy
    })

    playersDefenseBreakPositions.friends = this.getPhasePosition({
      phase: 'defenseBreak',
      friendsOrEnemyPositions: params.positions.friends
    })

    playersDefenseBreakPositions.enemy = this.getPhasePosition({
      phase: 'defenseSideOut',
      friendsOrEnemyPositions: params.positions.enemy
    })

    playersDefenseBreakPositions.friends = this.getPhasePosition({
      phase: 'defenseSideOut',
      friendsOrEnemyPositions: params.positions.friends
    })

    playersReceivePositions = {}
    if(!!playersReceivePositions) {
      playersReceivePositions.enemy = this.getReceivePositions({
        friendsOrEnemyPositions: params.positions.enemy
      })

      playersReceivePositions.friends = this.getReceivePositions({
        friendsOrEnemyPositions: params.positions.friends
      })
    }

    return {
      playersServePositions,
      playersReceivePositions,
      playersDefenseBreakPositions,
      playersDefenseSideoutPositions
    }
  }

  public static getPhasePosition(params: {
    phase: 'serve' | 'defenseBreak' | 'defenseSideOut'
    friendsOrEnemyPositions: VolleyballPlayersPosition['friends'] | VolleyballPlayersPosition['enemy']
  }): VolleyballPlayersPosition['friends'] | VolleyballPlayersPosition['enemy'] {
    let result: typeof params.friendsOrEnemyPositions = lodash.cloneDeep(params.friendsOrEnemyPositions)

    let setterPosition = this.findRolePositions({
      friendsOrEnemyPositions: params.friendsOrEnemyPositions,
      role: 'setter'
    })
    if (!setterPosition) return result

    let rolesPositions = SETTER_POSITION_TO_ROLES_POSITIONS[setterPosition]
    if (!rolesPositions) return result

    const mapper: Record<string, {
      role: Role,
      line?: 'first' | 'second'
    }> = {
      'setter': {
        role: 'setter'
      },
      'oppositeHitter': {
        role: 'oppositeHitter'
      },
      'libero': {
        role: 'libero'
      },
      'outsideHitter:1': {
        role: 'outsideHitter',
        line: [1, 2, 3].includes(setterPosition) ? 'first' : 'second'
      },
      'outsideHitter:2': {
        role: 'outsideHitter',
        line: [4, 5, 6].includes(setterPosition) ? 'first' : 'second'
      },
      'middleBlocker:1': {
        role: 'middleBlocker',
        line: [3, 4, 5].includes(setterPosition) ? 'first' : 'second'
      },
      'middleBlocker:2': {
        role: 'middleBlocker',
        line: [1, 2, 6].includes(setterPosition) ? 'first' : 'second'
      }
    }

    let loopPositions: VolleyballScoutEventPosition[] = [1, 2, 3, 4, 5, 6]
    for(let i = 0; i < loopPositions.length; i += 1) {
      let position = loopPositions[i]
      let rolePosition = rolesPositions[params.phase][position]
      if(!rolePosition) continue

      let positionSpec = this.findRoleInPositions({
        friendsOrEnemyPositions: params.friendsOrEnemyPositions,
        role: mapper[rolePosition].role,
        line: mapper[rolePosition].line
      })
      if(!positionSpec) continue

      result[position] = positionSpec
    }

    return result
  }

  public static getReceivePositions(params: {
    friendsOrEnemyPositions: VolleyballPlayersPosition['friends'] | VolleyballPlayersPosition['enemy']
  }): VolleyballPlayersDynamicPosition['friends'] {
    let result: NonNullable<VolleyballPlayersDynamicPosition['friends']> = {}

    let setterPosition = this.findRolePositions({
      friendsOrEnemyPositions: params.friendsOrEnemyPositions,
      role: 'setter'
    })
    if (!setterPosition) return result

    let dynamicPosition = SETTER_POSITION_TO_ROLES_RECEIVES_POSITIONS[setterPosition]
    if(!dynamicPosition) return result

    for(const [actualRole, value] of Object.entries(dynamicPosition.positions)) {
      let mapper: Record<string, {
        role: Role,
        line?: 'first' | 'second'
      }> = {
        'setter': {
          role: 'setter'
        },
        'oppositeHitter': {
          role: 'oppositeHitter'
        },
        'libero': {
          role: 'libero'
        },
        'outsideHitter:1': {
          role: 'outsideHitter',
          line: [1, 2, 3].includes(setterPosition) ? 'first' : 'second'
        },
        'outsideHitter:2': {
          role: 'outsideHitter',
          line: [4, 5, 6].includes(setterPosition) ? 'first' : 'second'
        },
        'middleBlocker:1': {
          role: 'middleBlocker',
          line: [3, 4, 5].includes(setterPosition) ? 'first' : 'second'
        },
        'middleBlocker:2': {
          role: 'middleBlocker',
          line: [1, 2, 6].includes(setterPosition) ? 'first' : 'second'
        }
      }

      let positionSpec = this.findRoleInPositions({
        friendsOrEnemyPositions: params.friendsOrEnemyPositions,
        role: mapper[actualRole].role,
        line: mapper[actualRole].line
      })

      if (!positionSpec && actualRole === 'libero') {
        positionSpec = this.findRoleInPositions({
          friendsOrEnemyPositions: params.friendsOrEnemyPositions,
          role: 'middleBlocker',
          line: 'second'
        })
      }

      if(!positionSpec) continue

      result[positionSpec.player.id] = value
    }
    
    return result
  }

  private static findRolePositions(params: {
    friendsOrEnemyPositions: VolleyballPlayersPosition['friends'] | VolleyballPlayersPosition['enemy'],
    role: Role,
    line?: 'first' | 'second'
  }): VolleyballScoutEventPosition | undefined {
    let playerPosition: VolleyballScoutEventPosition | undefined = undefined
    let busyPositions = Object.keys(params.friendsOrEnemyPositions)
    for (let i = 0; i < busyPositions.length; i += 1) {
      // @ts-ignore
      let position = busyPositions[i] as VolleyballScoutEventPosition

      if (!!params.line && (
        (params.line == 'second' && [2, 3, 4].includes(Number(position))) ||
        (params.line == 'first' && [1, 6, 5].includes(Number(position)))
      )) continue

      let positionSpec: typeof params.friendsOrEnemyPositions['1'] = params.friendsOrEnemyPositions?.[position]

      if (!!positionSpec && positionSpec.player.role == params.role) {
        playerPosition = position
      }
    }

    return Number(playerPosition) as VolleyballScoutEventPosition
  }

  private static findRoleInPositions(params: {
    friendsOrEnemyPositions: VolleyballPlayersPosition['friends'] | VolleyballPlayersPosition['enemy'],
    role: Role,
    line?: 'first' | 'second'
  }): {
    player: ScoutEventPlayer,
    anchor?: VolleyballScoutEventAnchor
  } | undefined {
    let friendsBusyPositions = Object.keys(params.friendsOrEnemyPositions)
    for (let i = 0; i < friendsBusyPositions.length; i += 1) {
      // @ts-ignore
      let position = friendsBusyPositions[i] as VolleyballScoutEventPosition

      if (!!params.line && (
        (params.line == 'second' && [2, 3, 4].includes(Number(position))) ||
        (params.line == 'first' && [1, 6, 5].includes(Number(position)))
      )) continue

      let positionSpec: typeof params.friendsOrEnemyPositions['1'] = params.friendsOrEnemyPositions?.[position]

      if (!!positionSpec && positionSpec.player.role == params.role) {
        return positionSpec
      }
    }
    return undefined
  }
}