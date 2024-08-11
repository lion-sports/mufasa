import Convocation from 'App/Models/Convocation';
import Teammate from 'App/Models/Teammate';
import { DateTime } from 'luxon';
import User from 'App/Models/User'
import Team from 'App/Models/Team'
import { test } from '@japa/runner'
import { TeamFactory, UserFactory } from 'Database/factories'
import PointScoredScoutEvent from 'App/managers/scout/events/volleyball/PointScoredScoutEvent';
import { ScoringSystemConfig } from 'App/Models/ScoringSystem';

test.group('Increment score', (group) => {
  let loggedInUser: User
  let team: Team
  let classicScoringSystemConfig: ScoringSystemConfig = {
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
  let underScoringSystemConfig: ScoringSystemConfig = {
    points: {
      mode: 'winPoints',
      winPoints: 25,
      hasAdvantages: true
    },
    set: {
      mode: 'totalSet',
      totalSets: 3
    },
    tieBreak: {
      mode: 'winPoints',
      winPoints: 15,
      hasAdvantages: true
    }
  }

  group.setup(async () => {
    team = await TeamFactory.with('owner').with('teammateUsers').create()

    loggedInUser = await User.query().whereHas('teams', builder => {
      builder.where('teams.id', team.id)
    }).firstOrFail()

    team.ownerId = loggedInUser.id
    await team.save()
  })

  test('classic - increment score', async ({ client, assert }) => {
    let newScore = await PointScoredScoutEvent.incrementScore({
      data: {
        currentScore: {
          enemy: {
            points: 0,
            sets: 0
          },
          friends: {
            points: 0,
            sets: 0
          },
        },
        scoringSystemConfig: classicScoringSystemConfig,
        opponent: false
      }
    })

    assert.equal(newScore.friends.points, 1, 'should have correct points')
    assert.equal(newScore.friends.sets, 0, 'should have correct sets')

    newScore = await PointScoredScoutEvent.incrementScore({
      data: {
        currentScore: {
          enemy: {
            points: 24,
            sets: 0
          },
          friends: {
            points: 23,
            sets: 0
          },
        },
        scoringSystemConfig: classicScoringSystemConfig,
        opponent: true
      }
    })

    assert.equal(newScore.enemy.points, 0, 'should have correct points')
    assert.equal(newScore.enemy.sets, 1, 'should have correct sets')

    newScore = await PointScoredScoutEvent.incrementScore({
      data: {
        currentScore: {
          enemy: {
            points: 17,
            sets: 1
          },
          friends: {
            points: 17,
            sets: 1
          },
        },
        scoringSystemConfig: classicScoringSystemConfig,
        opponent: true
      }
    })

    assert.equal(newScore.enemy.points, 18, 'should have correct points')
    assert.equal(newScore.friends.points, 17, 'should have correct points')
    assert.equal(newScore.enemy.sets, 1, 'should have correct sets')
    assert.equal(newScore.friends.sets, 1, 'should have correct sets')
  })

  test('classic - increment score - advantages', async ({ client, assert }) => {
    let newScore = await PointScoredScoutEvent.incrementScore({
      data: {
        currentScore: {
          enemy: {
            points: 24,
            sets: 0
          },
          friends: {
            points: 24,
            sets: 0
          },
        },
        scoringSystemConfig: classicScoringSystemConfig,
        opponent: true
      }
    })

    assert.equal(newScore.enemy.points, 25, 'should have correct points')
    assert.equal(newScore.friends.points, 24, 'should have correct points')
    assert.equal(newScore.enemy.sets, 0, 'should have correct sets')
    assert.equal(newScore.friends.sets, 0, 'should have correct sets')

    newScore = await PointScoredScoutEvent.incrementScore({
      data: {
        currentScore: {
          enemy: {
            points: 28,
            sets: 0
          },
          friends: {
            points: 29,
            sets: 0
          },
        },
        scoringSystemConfig: classicScoringSystemConfig,
        opponent: false
      }
    })

    assert.equal(newScore.enemy.points, 0, 'should have correct points')
    assert.equal(newScore.friends.points, 0, 'should have correct points')
    assert.equal(newScore.enemy.sets, 0, 'should have correct sets')
    assert.equal(newScore.friends.sets, 1, 'should have correct sets')
  })

  test('classic - increment score - tie break', async ({ client, assert }) => {
    let newScore = await PointScoredScoutEvent.incrementScore({
      data: {
        currentScore: {
          enemy: {
            points: 0,
            sets: 2
          },
          friends: {
            points: 0,
            sets: 2
          },
        },
        scoringSystemConfig: classicScoringSystemConfig,
        opponent: false
      }
    })

    assert.equal(newScore.friends.points, 1, 'should have correct points')
    assert.equal(newScore.enemy.points, 0, 'should have correct points')
    assert.equal(newScore.friends.sets, 2, 'should have correct sets')
    assert.equal(newScore.enemy.sets, 2, 'should have correct sets')

    newScore = await PointScoredScoutEvent.incrementScore({
      data: {
        currentScore: {
          enemy: {
            points: 15,
            sets: 2
          },
          friends: {
            points: 15,
            sets: 2
          },
        },
        scoringSystemConfig: classicScoringSystemConfig,
        opponent: true
      }
    })

    assert.equal(newScore.friends.points, 15, 'should have correct points')
    assert.equal(newScore.enemy.points, 16, 'should have correct points')
    assert.equal(newScore.friends.sets, 2, 'should have correct sets')
    assert.equal(newScore.enemy.sets, 2, 'should have correct sets')

    newScore = await PointScoredScoutEvent.incrementScore({
      data: {
        currentScore: {
          enemy: {
            points: 15,
            sets: 2
          },
          friends: {
            points: 16,
            sets: 2
          },
        },
        scoringSystemConfig: classicScoringSystemConfig,
        opponent: false
      }
    })

    assert.equal(newScore.friends.sets, 3, 'should have correct sets')
    assert.equal(newScore.enemy.sets, 2, 'should have correct sets')
    assert.equal(newScore.friends.won, true, 'should have won')
  })

  test('under - increment score', async ({ client, assert }) => {
    let newScore = await PointScoredScoutEvent.incrementScore({
      data: {
        currentScore: {
          enemy: {
            points: 19,
            sets: 1
          },
          friends: {
            points: 20,
            sets: 0
          },
        },
        scoringSystemConfig: underScoringSystemConfig,
        opponent: false
      }
    })

    assert.equal(newScore.friends.points, 21, 'should have correct points')
    assert.equal(newScore.friends.sets, 0, 'should have correct sets')

    newScore = await PointScoredScoutEvent.incrementScore({
      data: {
        currentScore: {
          enemy: {
            points: 24,
            sets: 0
          },
          friends: {
            points: 23,
            sets: 0
          },
        },
        scoringSystemConfig: classicScoringSystemConfig,
        opponent: true
      }
    })

    assert.equal(newScore.enemy.points, 0, 'should have correct points')
    assert.equal(newScore.enemy.sets, 1, 'should have correct sets')

    newScore = await PointScoredScoutEvent.incrementScore({
      data: {
        currentScore: {
          enemy: {
            points: 17,
            sets: 2
          },
          friends: {
            points: 17,
            sets: 0
          },
        },
        scoringSystemConfig: classicScoringSystemConfig,
        opponent: true
      }
    })

    assert.equal(newScore.enemy.points, 18, 'should have correct points')
    assert.equal(newScore.friends.points, 17, 'should have correct points')
    assert.equal(newScore.enemy.sets, 2, 'should have correct sets')
    assert.equal(newScore.friends.sets, 0, 'should have correct sets')
  })

  test('under - increment score - tie break', async ({ client, assert }) => {
    let newScore = await PointScoredScoutEvent.incrementScore({
      data: {
        currentScore: {
          enemy: {
            points: 5,
            sets: 1
          },
          friends: {
            points: 10,
            sets: 1
          },
        },
        scoringSystemConfig: underScoringSystemConfig,
        opponent: false
      }
    })

    assert.equal(newScore.friends.points, 11, 'should have correct points')
    assert.equal(newScore.enemy.points, 5, 'should have correct points')
    assert.equal(newScore.friends.sets, 1, 'should have correct sets')
    assert.equal(newScore.enemy.sets, 1, 'should have correct sets')

    newScore = await PointScoredScoutEvent.incrementScore({
      data: {
        currentScore: {
          enemy: {
            points: 15,
            sets: 1
          },
          friends: {
            points: 15,
            sets: 1
          },
        },
        scoringSystemConfig: underScoringSystemConfig,
        opponent: true
      }
    })

    assert.equal(newScore.friends.points, 15, 'should have correct points')
    assert.equal(newScore.enemy.points, 16, 'should have correct points')
    assert.equal(newScore.friends.sets, 1, 'should have correct sets')
    assert.equal(newScore.enemy.sets, 1, 'should have correct sets')

    newScore = await PointScoredScoutEvent.incrementScore({
      data: {
        currentScore: {
          enemy: {
            points: 15,
            sets: 1
          },
          friends: {
            points: 16,
            sets: 1
          },
        },
        scoringSystemConfig: underScoringSystemConfig,
        opponent: false
      }
    })

    assert.equal(newScore.friends.sets, 2, 'should have correct sets')
    assert.equal(newScore.enemy.sets, 1, 'should have correct sets')
    assert.equal(newScore.friends.won, true, 'should have won')
  })
})
