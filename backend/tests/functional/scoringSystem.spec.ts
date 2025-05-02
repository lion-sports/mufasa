import User from '#app/Models/User'
import Team from '#app/Models/Team'
import { test } from '@japa/runner'
import { EventFactory, TeamFactory } from '#database/factories/index'
import Teammate from '#app/Models/Teammate';
import TeammateFactory from '#database/factories/TeammateFactory';
import Event from '#app/Models/Event';
import Scout from '#app/Models/Scout';
import ScoringSystem from '#app/Models/ScoringSystem';

test.group('ScoringSystems', (group) => {
  let loggedInUser: User
  let team: Team
  let teammate: Teammate
  let event: Event
  let scout: Scout

  group.setup(async () => {
    team = await TeamFactory.with('owner').create()
    await team.load('owner')
    loggedInUser = team.owner
    await team.related('teammateUsers').save(team.owner)

    teammate = await TeammateFactory.with('user').create()
    teammate.teamId = team.id
    await teammate.save()

    event = await EventFactory.create()
    event.teamId = team.id
    event.createdByUserId = loggedInUser.id
    await event.save()

    scout = await Scout.create({
      eventId: event.id
    })
  })

  test('create a new scoring system', async ({ client, assert }) => {
    const response = await client.post('/scoringSystems').json({
      public: false,
      name: 'Prova',
      sport: 'volleyball',
      config: {
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
          winPoints: 25,
          hasAdvantages: true
        }
      },
      createdForTeamId: team.id
    }).loginAs(loggedInUser)

    const scoringSystem = response.body()
    response.assertAgainstApiSpec()
    assert.equal(scoringSystem.createdForTeamId, team.id, 'should set the right createdForTeamId')
  })

  test('get a paginated list of mine existing scoring systems', async ({ client, assert }) => {
    await client.post('/scoringSystems').json({
      public: false,
      name: 'Prova',
      sport: 'volleyball',
      config: {
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
          winPoints: 25,
          hasAdvantages: true
        }
      },
      createdForTeamId: team.id
    }).loginAs(loggedInUser)

    const response = await client.get('/scoringSystems').qs({
      page: 1,
      perPage: 200
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    let paginatedScoringSystem = response.body()

    assert.equal(paginatedScoringSystem.meta.perPage, 200, "should use the right pagination")
    assert.equal(paginatedScoringSystem.meta.total, paginatedScoringSystem.data.length, "should return the right rows")
  })

  test('get a scoring system', async ({ client, assert }) => {
    let createScoringSystemResponse = await client.post('/scoringSystems').json({
      public: false,
      name: 'Prova',
      sport: 'volleyball',
      config: {
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
          winPoints: 25,
          hasAdvantages: true
        }
      },
      createdForTeamId: team.id
    }).loginAs(loggedInUser)

    let scoringSystem = createScoringSystemResponse.body()
    const response = await client.get('/scoringSystems/' + scoringSystem.id).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const scoringSystemResponse = response.body()
    assert.equal(scoringSystemResponse.config.set.mode, 'winSet', "should return the correct config")
  })

  test('update an existing scoring system', async ({ client, assert }) => {
    let createScoringSystemResponse = await client.post('/scoringSystems').json({
      public: false,
      name: 'Prova',
      sport: 'volleyball',
      config: {
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
          winPoints: 25,
          hasAdvantages: true
        }
      },
      createdForTeamId: team.id
    }).loginAs(loggedInUser)

    let scoringSystem = createScoringSystemResponse.body()
    const response = await client.put('/scoringSystems/' + scoringSystem.id).json({
      name: 'Prova modificata',
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const scoringSystemResponse = response.body()
    assert.equal(scoringSystemResponse.id, scoringSystem.id, "should update the correct scoring system")
    assert.equal(scoringSystemResponse.name, 'Prova modificata', "should update the scoring system")
  })

  test('destroy an existing scoring system', async ({ client, assert }) => {
    let createScoringSystemResponse = await client.post('/scoringSystems').json({
      public: false,
      name: 'Prova',
      sport: 'volleyball',
      config: {
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
          winPoints: 25,
          hasAdvantages: true
        }
      },
      createdForTeamId: team.id
    }).loginAs(loggedInUser)

    let scoringSystem = createScoringSystemResponse.body()
    await client.delete('/scoringSystems/' + scoringSystem.id).loginAs(loggedInUser)

    let scoringSystemFromDatabase = await ScoringSystem.query()
      .where('id', scoringSystem.id)
      .first()

    assert.notExists(scoringSystemFromDatabase, 'should have destroyed the scoring system')
  })
})
