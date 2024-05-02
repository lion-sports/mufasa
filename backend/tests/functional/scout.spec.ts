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
  let event: Event

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
    await event.save()
  })

  test('create a new scout', async ({ client, assert }) => {
    const response = await client.post('/scouts').json({
      sport: 'volleyball',
      name: 'Nome dello scout',
      startedAt: new Date(),
      eventId: event.id
    }).loginAs(loggedInUser)


    const scout = response.body()
    response.assertAgainstApiSpec()
    assert.equal(scout.name, 'Nome dello scout', 'should have the right name')
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
      eventId: event.id
    }).loginAs(loggedInUser)

    let scout = createScoutResponse.body()
    const response = await client.put('/scouts/' + scout.id).json({
      name: 'il nuovo nome dello scout'
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const scoutResponse = response.body()
    assert.equal(scoutResponse.id, scout.id, "should update the correct scout")
    assert.equal(scoutResponse.name, 'il nuovo nome dello scout', "should update the scout")
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
