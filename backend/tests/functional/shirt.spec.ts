import User from 'App/Models/User'
import TeamsManager from 'App/managers/teams.manager';
import Team from 'App/Models/Team'
import { test } from '@japa/runner'
import { TeamFactory } from 'Database/factories'
import Teammate from 'App/Models/Teammate';
import TeammateFactory from 'Database/factories/TeammateFactory';

test.group('Shirts', (group) => {
  let loggedInUser: User
  let team: Team
  let teammate: Teammate

  group.setup(async () => {
    team = await TeamFactory.with('owner').create()
    await team.load('owner')
    loggedInUser = team.owner
    await team.related('teammateUsers').save(team.owner)

    teammate = await TeammateFactory.with('user').create()
    teammate.teamId = team.id
    await teammate.save()
  })

  test('create a new shirt', async ({ client, assert }) => {
    const response = await client.post('/shirts').json({
      number: 1,
      name: 'il numero uno',
      primaryColor: '#fff',
      secondaryColor: '#000',
      teammateId: teammate.id
    }).loginAs(loggedInUser)


    const shirt = response.body()
    response.assertAgainstApiSpec()
    assert.equal(shirt.name, 'il numero uno', 'should have the right name')
  })

  // test('get a paginated list of mine existing teams', async ({ client, assert }) => {
  //   const response = await client.get('/teams').qs({
  //     page: 1,
  //     perPage: 200
  //   }).loginAs(loggedInUser)
  //   response.assertAgainstApiSpec()
  //   let teams = response.body()

  //   assert.equal(teams.meta.perPage, 200, "should use the right pagination")
  //   assert.equal(teams.meta.total, teams.data.length, "should return the right rows")
  // })

  // test('get a team', async ({ client, assert }) => {
  //   const team = await TeamFactory.with('owner').with('teammateUsers').create()
  //   const user = await User.query().whereHas('teams', (builder) => builder.where('teams.id', team.id)).firstOrFail()
  //   const response = await client.get('/teams/' + team.id).loginAs(user)

  //   response.assertAgainstApiSpec()
  //   const teamResponse = response.body()
  //   assert.equal(teamResponse.id, team.id, "should return the correct team")
  // })

  // test('update an existing team', async ({ client, assert }) => {
  //   const response = await client.put('/teams/' + team.id).json({
  //     name: 'il nuovo nome'
  //   }).loginAs(loggedInUser)

  //   response.assertAgainstApiSpec()
  //   const teamResponse = response.body()
  //   assert.equal(teamResponse.id, team.id, "should update the correct team")
  //   assert.equal(teamResponse.name, 'il nuovo nome', "should update the team")
  // })

  // test('update a preference of an existing team', async ({ client, assert }) => {
  //   let response = await client.post('/teams/' + team.id + '/updatePreference').json({
  //     preference: 'confirmPresenceByDefault',
  //     value: true
  //   }).loginAs(loggedInUser)

  //   response.assertAgainstApiSpec()
  //   const teamResponse = response.body()
  //   assert.equal(teamResponse.id, team.id, "should update the correct team")
  //   assert.equal(teamResponse.preferences.confirmPresenceByDefault, true, "should update the team preference")

  //   let error = false
  //   try {
  //     response = await client.post('/teams/' + team.id + '/updatePreference').json({
  //       preference: 'pippo',
  //       value: true
  //     }).loginAs(loggedInUser)
  //   } catch {
  //     error = true
  //   }

  //   assert.isTrue(error, 'unknow preference should not be set')
  // })

  // test('get absences in latest events', async ({ client }) => {
  //   let response = await client.get('/teams/absencesInLatestEvents').qs({
  //     forLastEvents: 10
  //   }).loginAs(loggedInUser)

  //   response.assertAgainstApiSpec()
  // })
})
