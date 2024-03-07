import RoleModel from 'App/Models/Role';
import UserModel from 'App/Models/User'
import type User from 'App/Models/User'
import type Team from 'App/Models/Team'
import { test } from '@japa/runner'
import { TeamFactory } from 'Database/factories'

test.group('Roles', (group) => {
  let teamsAndOwners: {
    team: Team
    owner: User
  }[] = []

  group.setup(async () => {
    await TeamFactory.with('owner').with('teammateUsers').createMany(3)
    let queryResults = await UserModel.query().preload('ownedTeams').has('ownedTeams', '>', 0)
    teamsAndOwners = queryResults.map((el) => {
      return {
        team: el.ownedTeams[0],
        owner: el
      }
    })
  })

  test('create a new role', async ({ client, assert }) => {
    let teamAndOwner = teamsAndOwners[0]
    const response = await client.post('/roles').json({
      name: 'Allenatore',
      team: teamAndOwner.team,
      convocable: true,
      cans: {
        Team: {
          update: true
        },
        Invitation: {
          accept: true
        }
      }
    }).loginAs(teamAndOwner.owner)

    const role = response.body()
    response.assertAgainstApiSpec()
    assert.equal(role.name, 'Allenatore', 'should have the right name')
    assert.equal(role.convocable, true, 'should have the right convocable')
    assert.isTrue(role.cans.Team.update, 'should has set the cans')
  })

  test('get a paginated list of roles for an existing teams', async ({ client, assert }) => {
    let teamAndOwner = teamsAndOwners[0]

    await client.post('/roles').json({
      name: 'Giocatore',
      team: teamAndOwner.team
    }).loginAs(teamAndOwner.owner)

    const response = await client.get(`/teams/${teamAndOwner.team.id}/roles`).qs({
      page: 1,
      perPage: 200
    }).loginAs(teamAndOwner.owner)

    response.assertAgainstApiSpec()
    let roles = response.body()

    assert.equal(roles.meta.perPage, 200, "should use the right pagination")
    assert.equal(roles.meta.total, roles.data.length, "should return the right rows")
  })

  test('get a role', async ({ client, assert }) => {
    let teamAndOwner = teamsAndOwners[0]

    let response = await client.post('/roles').json({
      name: 'Preparatore atletico',
      team: teamAndOwner.team
    }).loginAs(teamAndOwner.owner)

    let role = response.body()
    response = await client.get('/roles/' + role.id).loginAs(teamAndOwner.owner)

    response.assertAgainstApiSpec()
    const roleResponse = response.body()
    assert.equal(roleResponse.id, role.id, "should return the correct role")
  })

  test('update a existing role', async ({ client, assert }) => {
    let teamAndOwner = teamsAndOwners[0]

    let response = await client.post('/roles').json({
      name: 'Massaggiatore',
      team: teamAndOwner.team
    }).loginAs(teamAndOwner.owner)

    let role = response.body()
    response = await client.put('/roles/' + role.id).json({
      name: 'Massaggiatore (stagione estiva)',
      convocable: false,
      cans: {
        Team: {
          create: true
        }
      }
    }).loginAs(teamAndOwner.owner)

    response.assertAgainstApiSpec()
    const roleResponse = response.body()
    assert.equal(roleResponse.id, role.id, "should return the correct role")
    assert.equal(roleResponse.name, 'Massaggiatore (stagione estiva)', "should have updated correctly")
    assert.equal(roleResponse.convocable, false, "should have updated correctly the convocable")
    assert.isTrue(roleResponse.cans.Team.create, 'should has set the cans')
  })

  test('destroy an existing role', async ({ client, assert }) => {
    let teamAndOwner = teamsAndOwners[0]

    let response = await client.post('/roles').json({
      name: 'Contadino',
      team: teamAndOwner.team
    }).loginAs(teamAndOwner.owner)

    let role = response.body()
    response = await client.delete('/roles/' + role.id).loginAs(teamAndOwner.owner)

    let existingRole = await RoleModel.query()
      .whereHas('team', builder => builder.where('teams.id', teamAndOwner.team.id))
      .where('id', role.id)

    assert.isTrue(existingRole.length == 0, "should destroy the role")
  })
})
