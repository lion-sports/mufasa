import User from '#app/Models/User'
import TeamsManager from '#app/managers/teams.manager';
import Team from '#app/Models/Team'
import { test } from '@japa/runner'
import { TeamFactory } from '#database/factories/index'

test.group('Teams', (group) => {
  let loggedInUser: User
  let team: Team

  group.setup(async () => {
    team = await TeamFactory.with('owner').create()
    await team.load('owner')
    loggedInUser = team.owner

    let manager = new TeamsManager()
    team = await manager.create({
      data: {
        name: team.name,
        notes: team.notes
      },
      context: {
        user: loggedInUser,
      }
    })
  })

  test('create a new team', async ({ client, assert }) => {
    const response = await client.post('/teams').json({
      name: 'Il mio team',
      notes: `# Come si struttura il mio team`,
      sport: 'volleyball'
    }).loginAs(loggedInUser)


    const team = response.body()
    response.assertAgainstApiSpec()
    assert.equal(team.name, 'Il mio team', 'should have the right name')
    assert.equal(team.sport, 'volleyball', 'should have the right sport')
  })

  test('get a paginated list of mine existing teams', async ({ client, assert }) => {
    const response = await client.get('/teams').qs({
      page: 1,
      perPage: 200
    }).loginAs(loggedInUser)
    response.assertAgainstApiSpec()
    let teams = response.body()

    assert.equal(teams.meta.perPage, 200, "should use the right pagination")
    assert.equal(teams.meta.total, teams.data.length, "should return the right rows")
  })

  test('get a team', async ({ client, assert }) => {
    const team = await TeamFactory.with('owner').with('teammateUsers').create()
    const user = await User.query().whereHas('teams', (builder) => builder.where('teams.id', team.id)).firstOrFail()
    const response = await client.get('/teams/' + team.id).loginAs(user)

    response.assertAgainstApiSpec()
    const teamResponse = response.body()
    assert.equal(teamResponse.id, team.id, "should return the correct team")
  })

  test('update an existing team', async ({ client, assert }) => {
    const response = await client.put('/teams/' + team.id).json({
      name: 'il nuovo nome'
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const teamResponse = response.body()
    assert.equal(teamResponse.id, team.id, "should update the correct team")
    assert.equal(teamResponse.name, 'il nuovo nome', "should update the team")
  })

  test('update a preference of an existing team', async ({ client, assert }) => {
    let response = await client.post('/teams/' + team.id + '/updatePreference').json({
      preference: 'confirmPresenceByDefault',
      value: true
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const teamResponse = response.body()
    assert.equal(teamResponse.id, team.id, "should update the correct team")
    assert.equal(teamResponse.preferences.confirmPresenceByDefault, true, "should update the team preference")

    let error = false
    try {
      response = await client.post('/teams/' + team.id + '/updatePreference').json({
        preference: 'pippo',
        value: true
      }).loginAs(loggedInUser)
      error = response.status() == 500
    } catch {
      error = true
    }

    assert.isTrue(error, 'unknow preference should not be set')
  })

  test('get absences in latest events', async ({ client }) => {
    let response = await client.get('/teams/absencesInLatestEvents').qs({
      forLastEvents: 10
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
  })
})
