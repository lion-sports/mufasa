import User from '#app/Models/User'
import Team from '#app/Models/Team'
import { test } from '@japa/runner'
import { EventFactory, TeamFactory } from '#database/factories/index'
import Teammate from '#app/Models/Teammate';
import TeammateFactory from '#database/factories/TeammateFactory';
import Event from '#app/Models/Event';
import Scout from '#app/Models/Scout';
import Player from '#app/Models/Player';

test.group('Players', (group) => {  
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

  test('create a new player', async ({ client, assert }) => {
    const response = await client.post('/players').json({
      scoutId: scout.id,
      teammateId: teammate.id,
      role: 'outsideHitter'
    }).loginAs(loggedInUser)

    const player = response.body()
    response.assertAgainstApiSpec()
    assert.equal(player.scoutId, scout.id, 'should set the right scout id')
    assert.equal(player.role, 'outsideHitter', 'should set the right role')
  })

  test('get a paginated list of mine existing players', async ({ client, assert }) => {
    await client.post('/players').json({
      scoutId: scout.id,
      teammateId: teammate.id,
      role: 'outsideHitter'
    }).loginAs(loggedInUser)

    const response = await client.get('/players').qs({
      page: 1,
      perPage: 200
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    let paginatedPlayers = response.body()

    assert.equal(paginatedPlayers.meta.perPage, 200, "should use the right pagination")
    assert.equal(paginatedPlayers.meta.total, paginatedPlayers.data.length, "should return the right rows")
  })

  test('get a player', async ({ client, assert }) => {
    let createPlayerResponse = await client.post('/players').json({
      scoutId: scout.id,
      teammateId: teammate.id,
      role: 'outsideHitter'
    }).loginAs(loggedInUser)

    let player = createPlayerResponse.body()
    const response = await client.get('/players/' + player.id).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const playerResponse = response.body()
    assert.equal(playerResponse.id, player.id, "should return the correct player")
  })

  test('update an existing player', async ({ client, assert }) => {
    let createPlayerResponse = await client.post('/players').json({
      scoutId: scout.id,
      teammateId: teammate.id,
      role: 'outsideHitter'
    }).loginAs(loggedInUser)

    let player = createPlayerResponse.body()
    const response = await client.put('/players/' + player.id).json({
      aliases: ['alias 1'],
      role: 'middleBlocker'
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const playerResponse = response.body()
    assert.equal(playerResponse.id, player.id, "should update the correct player")
    assert.equal(playerResponse.aliases[0], 'alias 1', "should update the player aliases")
    assert.equal(playerResponse.role, 'middleBlocker', "should update the player role")
  })

  test('destroy an existing scout', async ({ client, assert }) => {
    let createPlayerResponse = await client.post('/players').json({
      scoutId: scout.id,
      teammateId: teammate.id,
      role: 'outsideHitter'
    }).loginAs(loggedInUser)

    let player = createPlayerResponse.body()
    await client.delete('/players/' + player.id).loginAs(loggedInUser)

    let playerFromDatabase = await Player.query()
      .where('id', player.id)
      .first()

    assert.notExists(playerFromDatabase, 'should have destroyed the player')
  })
})
