import User from 'App/Models/User'
import Team from 'App/Models/Team'
import { test } from '@japa/runner'
import { EventFactory, TeamFactory } from 'Database/factories'
import Teammate from 'App/Models/Teammate';
import TeammateFactory from 'Database/factories/TeammateFactory';
import Event from 'App/Models/Event';
import Scout from 'App/Models/Scout';

test.group('Scouts', (group) => {
  let loggedInUser: User
  let team: Team
  let teammate: Teammate
  let teammate2: Teammate
  let event: Event

  group.setup(async () => {
    team = await TeamFactory.with('owner').create()
    await team.load('owner')
    loggedInUser = team.owner
    await team.related('teammateUsers').save(team.owner)

    teammate = await TeammateFactory.with('user').create()
    teammate.teamId = team.id
    teammate.defaultRole = 'setter'
    await teammate.save()

    await teammate.related('shirts').create({
      number: 10
    })
    await teammate.load('shirts')

    teammate2 = await TeammateFactory.with('user').create()
    teammate2.teamId = team.id
    teammate2.defaultRole = 'middleBlocker'
    await teammate2.save()

    await teammate2.related('shirts').create({
      number: 23
    })
    await teammate2.load('shirts')

    event = await EventFactory.create()
    event.teamId = team.id
    await event.save()

    await event.related('convocations').create({
      teammateId: teammate.id
    })

    await event.related('convocations').create({
      teammateId: teammate2.id
    })
  })

  test('create a new scout', async ({ client, assert }) => {
    const scoringSystemResponse = await client.post('/scoringSystems').json({
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

    let scoringSystem = scoringSystemResponse.body()

    const response = await client.post('/scouts').json({
      sport: 'volleyball',
      name: 'Nome dello scout',
      startedAt: new Date(),
      eventId: event.id,
      scoringSystemId: scoringSystem.id,
      scoutInfo: {
        general: {
          opponent: {
            name: 'Il nome avversario'
          }
        }
      }
    }).loginAs(loggedInUser)

    const scout = response.body()
    response.assertAgainstApiSpec()
    assert.equal(scout.name, 'Nome dello scout', 'should have the right name')
    assert.equal(scout.scoringSystemId, scoringSystem.id, 'should have the scoring system')
    assert.equal(scout.players.length, 2, 'should have created a player with the convocation')
    assert.equal(scout.players[0].role, teammate.defaultRole, 'should have created the players with the right role')
    assert.exists(scout.scoutInfo, 'should have created a row of scout info')
    assert.equal(scout.scoutInfo.general.opponent.name, 'Il nome avversario', 'shoud have set the opponent name')
  })

  test('get a paginated list of mine existing scouts', async ({ client, assert }) => {
    await client.post('/scouts').json({
      sport: 'volleyball',
      name: 'Nome dello scout',
      startedAt: new Date(),
      eventId: event.id
    }).loginAs(loggedInUser)

    const response = await client.get('/scouts').qs({
      page: 1,
      perPage: 200
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    let paginatedScout = response.body()

    assert.equal(paginatedScout.meta.perPage, 200, "should use the right pagination")
    assert.equal(paginatedScout.meta.total, paginatedScout.data.length, "should return the right rows")
  })

  test('get a scout', async ({ client, assert }) => {
    let createScoutResponse = await client.post('/scouts').json({
      sport: 'volleyball',
      name: 'Nome dello scout',
      startedAt: new Date(),
      eventId: event.id
    }).loginAs(loggedInUser)

    let scout = createScoutResponse.body()
    const response = await client.get('/scouts/' + scout.id).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const scoutResponse = response.body()
    assert.equal(scoutResponse.id, scout.id, "should return the correct scout")
  })

  test('update an existing scout', async ({ client, assert }) => {
    let createScoutResponse = await client.post('/scouts').json({
      sport: 'volleyball',
      name: 'Nome dello scout',
      startedAt: new Date(),
      eventId: event.id,
      scoutInfo: {
        general: {
          friendsFieldSide: 'right'
        }
      }
    }).loginAs(loggedInUser)

    let scout = createScoutResponse.body()
    const response = await client.put('/scouts/' + scout.id).json({
      name: 'il nuovo nome dello scout',
      scoutInfo: {
        general: {
          opponent: {
            name: 'nome nuovo'
          }
        }
      }
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const scoutResponse = response.body()
    assert.equal(scoutResponse.id, scout.id, "should update the correct scout")
    assert.equal(scoutResponse.name, 'il nuovo nome dello scout', "should update the scout")
    assert.exists(scoutResponse.scoutInfo, 'should have the row of scout info')
    assert.equal(scoutResponse.scoutInfo.general.opponent.name, 'nome nuovo', 'shoud have set the opponent name')
    assert.equal(scoutResponse.scoutInfo.general.friendsFieldSide, 'right', 'shoud have not updated the friends field side')
  })

  test('import teammates to an existing scout', async ({ client, assert }) => {
    let createScoutResponse = await client.post('/scouts').json({
      sport: 'volleyball',
      name: 'Nome dello scout',
      startedAt: new Date(),
      eventId: event.id
    }).loginAs(loggedInUser)

    let scout = createScoutResponse.body()

    let teammate3 = await TeammateFactory.with('user').create()
    teammate3.teamId = team.id
    teammate3.defaultRole = 'oppositeHitter'
    await teammate3.save()

    await teammate3.related('shirts').create({
      number: 32
    })
    await teammate3.load('shirts')

    await event.related('convocations').create({
      teammateId: teammate3.id,
      confirmationStatus: 'confirmed'
    })

    const response = await client.post('/scouts/' + scout.id + '/importTeammates').json({
      importShirts: true,
      importRoles: true,
      importAbsents: false
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()

    let scoutFromDatabase = await Scout
      .query()
      .where('id', scout.id)
      .preload('players')
      .firstOrFail()

    assert.equal(scoutFromDatabase.players.length, 3, 'should have imported all the players')
    assert.equal(scoutFromDatabase.players.find((p) => p.teammateId == teammate3.id)?.role, teammate3.defaultRole, 'should have imported the default role')
    assert.equal(scoutFromDatabase.players.find((p) => p.teammateId == teammate3.id)?.shirtNumber, teammate3.shirts[0].number, 'should have imported the default role')
  })

  test('destroy an existing scout', async ({ client, assert }) => {
    let createScoutResponse = await client.post('/scouts').json({
      sport: 'volleyball',
      name: 'Nome dello scout',
      startedAt: new Date(),
      eventId: event.id
    }).loginAs(loggedInUser)

    let scout = createScoutResponse.body()
    await client.delete('/scouts/' + scout.id).loginAs(loggedInUser)

    let scoutFromDatabase = await Scout.query()
      .where('id', scout.id)
      .first()

    assert.notExists(scoutFromDatabase, 'should have destroyed the scout')
  })
})
