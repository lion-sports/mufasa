import { describe, test, assert } from 'vitest';
import { getNextAutomatedEvents } from 'src/scouts/volleyball/automations';
import { FIRST_POINT, ScoringSystemConfig, ScoutEventPlayer, ScoutInfoSettings, VolleyballScoutEventPosition, VolleyballScoutStash } from 'src/main';

describe('automations', () => {
  let friendScoutEventPlayer: ScoutEventPlayer = {
    id: 1,
    scoutId: 1,
    aliases: ['Alias'],
    role: 'center',
    shirtNumber: 10,
    shirtPrimaryColor: undefined,
    shirtSecondaryColor: undefined,
    isOpponent: false
  }

  let enemyScoutEventPlayer: ScoutEventPlayer = {
    id: 2,
    scoutId: 1,
    aliases: ['Alias'],
    role: 'center',
    shirtNumber: 10,
    shirtPrimaryColor: undefined,
    shirtSecondaryColor: undefined,
    isOpponent: true
  }

  let scoutId: number = 1
  let teamId: number = 1
  let createdByUserId: number = 1
  let position: VolleyballScoutEventPosition = 4
  let scoutInfo: {
    settings: ScoutInfoSettings
  } = {
    settings: {
      automations: {
        autoPoint: {
          enemy: ['blockHandsOut', 'receiveError', 'serveError', 'spikeError']
        }
      }
    }
  }

  let scoringSystemConfig: ScoringSystemConfig = {
    points: {
      mode: 'winPoints',
      winPoints: 25,
      hasAdvantages: true
    },
    set: {
      mode: 'winSet',
      winSets: 3
    },
    tieBreak: {
      mode: 'winPoints',
      winPoints: 15,
      hasAdvantages: true
    }
  }

  test('block - hands out', async () => {
    let automatedEvents = getNextAutomatedEvents({
      event: {
        type: 'block',
        player: friendScoutEventPlayer,
        playerId: friendScoutEventPlayer.id,
        result: 'handsOut',
        position: position,
        date: new Date(),
        scoutId: scoutId,
        sport: 'volleyball',
        teamId: teamId,
        createdByUserId,
        points: FIRST_POINT
      },
      context: {
        scoutInfo,
        scoringSystem: scoringSystemConfig,
        stash: {
          points: FIRST_POINT,
          phase: 'serve',
          playersServePositions: {
            enemy: {
              '1': { player: enemyScoutEventPlayer }
            },
            friends: {
              '1': { player: friendScoutEventPlayer }
            }
          }
        }
      }
    })

    assert.isTrue(automatedEvents.events.some((ae) => ae.type == 'pointScored' ), 'should have generate a point scored event')
    assert.isTrue(automatedEvents.events.some((ae) => ae.type == 'teamRotation' && ae.opponent ), 'should have generate a team rotation scored event')
    assert.equal(automatedEvents.context.stash?.points?.enemy.points, 1, 'should have add a point to enemy')
  })

  test('receive - x', async () => {
    let automatedEvents = getNextAutomatedEvents({
      event: {
        type: 'receive',
        player: friendScoutEventPlayer,
        playerId: friendScoutEventPlayer.id,
        result: 'x',
        position: position,
        date: new Date(),
        scoutId: scoutId,
        sport: 'volleyball',
        teamId: teamId,
        createdByUserId,
        points: FIRST_POINT
      },
      context: {
        scoutInfo,
        scoringSystem: scoringSystemConfig,
        stash: {
          points: FIRST_POINT,
          phase: 'defenseBreak',
          playersServePositions: {
            enemy: {
              '1': { player: enemyScoutEventPlayer }
            },
            friends: {
              '1': { player: friendScoutEventPlayer }
            }
          }
        }
      }
    })

    assert.isTrue(automatedEvents.events.some((ae) => ae.type == 'pointScored'), 'should have generate a point scored event')
    assert.isTrue(automatedEvents.events.some((ae) => ae.type == 'teamRotation' && ae.opponent), 'should have generate a team rotation scored event')
    assert.equal(automatedEvents.context.stash?.points?.enemy.points, 1, 'should have add a point to enemy')
  })

  test('serve - error', async () => {
    let automatedEvents = getNextAutomatedEvents({
      event: {
        type: 'serve',
        player: friendScoutEventPlayer,
        playerId: friendScoutEventPlayer.id,
        result: 'error',
        date: new Date(),
        scoutId: scoutId,
        sport: 'volleyball',
        teamId: teamId,
        createdByUserId,
        points: FIRST_POINT
      },
      context: {
        scoutInfo,
        scoringSystem: scoringSystemConfig,
        stash: {
          points: FIRST_POINT,
          phase: 'serve',
          playersServePositions: {
            enemy: {
              '1': { player: enemyScoutEventPlayer }
            },
            friends: {
              '1': { player: friendScoutEventPlayer }
            }
          }
        }
      }
    })

    assert.isTrue(automatedEvents.events.some((ae) => ae.type == 'pointScored'), 'should have generate a point scored event')
    assert.isTrue(automatedEvents.events.some((ae) => ae.type == 'teamRotation' && ae.opponent), 'should have generate a team rotation scored event')
    assert.equal(automatedEvents.context.stash?.points?.enemy.points, 1, 'should have add a point to enemy')
  })

  test('spike - error', async () => {
    let automatedEvents = getNextAutomatedEvents({
      event: {
        type: 'spike',
        player: friendScoutEventPlayer,
        playerId: friendScoutEventPlayer.id,
        result: 'error',
        date: new Date(),
        scoutId: scoutId,
        sport: 'volleyball',
        teamId: teamId,
        createdByUserId,
        points: FIRST_POINT,
        position: position,
      },
      context: {
        scoutInfo,
        scoringSystem: scoringSystemConfig,
        stash: {
          points: FIRST_POINT,
          phase: 'defenseBreak',
          playersServePositions: {
            enemy: {
              '1': { player: enemyScoutEventPlayer }
            },
            friends: {
              '1': { player: friendScoutEventPlayer }
            }
          }
        }
      }
    })

    assert.isTrue(automatedEvents.events.some((ae) => ae.type == 'pointScored'), 'should have generate a point scored event')
    assert.isTrue(automatedEvents.events.some((ae) => ae.type == 'teamRotation' && ae.opponent), 'should have generate a team rotation scored event')
    assert.equal(automatedEvents.context.stash?.points?.enemy.points, 1, 'should have add a point to enemy')
  })

  test('team rotation', async () => {
    let automatedEvents = getNextAutomatedEvents({
      event: {
        type: 'teamRotation',
        date: new Date(),
        scoutId: scoutId,
        sport: 'volleyball',
        teamId: teamId,
        createdByUserId,
        points: FIRST_POINT,
        rotationType: 'forward',
        fromPositions: {
          enemy: {
            '1': { player: enemyScoutEventPlayer }
          },
          friends: {
            '1': { player: friendScoutEventPlayer }
          }
        },
        opponent: false
      },
      context: {
        scoutInfo,
        scoringSystem: scoringSystemConfig,
        stash: {
          points: FIRST_POINT,
          phase: 'defenseBreak',
          playersServePositions: {
            enemy: {
              '1': { player: enemyScoutEventPlayer }
            },
            friends: {
              '1': { player: friendScoutEventPlayer }
            }
          }
        }
      }
    })

    assert.equal(automatedEvents.context.stash?.playersServePositions?.friends[6]?.player.id, 1, 'should have rotated friends players')
  })
})