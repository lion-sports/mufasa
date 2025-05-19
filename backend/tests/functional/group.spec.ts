import Group from '#app/Models/Group';
import User from '#app/Models/User'
import Team from '#app/Models/Team'
import { test } from '@japa/runner'
import { TeamFactory } from '#database/factories/index'

test.group('Groups', (group) => {
  let teamsAndOwners: {
    team: Team
    owner: User
  }[] = []

  group.setup(async () => {
    await TeamFactory.with('owner').with('teammateUsers').createMany(3)
    let queryResults = await User.query().preload('ownedTeams').has('ownedTeams', '>', 0)
    teamsAndOwners = queryResults.map((el) => {
      return {
        team: el.ownedTeams[0],
        owner: el
      }
    })
  })

  test('create a new group', async ({ client, assert }) => {
    let teamAndOwner = teamsAndOwners[0]
    const response = await client.post('/groups').json({
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

    const group = response.body()
    response.assertAgainstApiSpec()
    assert.equal(group.name, 'Allenatore', 'should have the right name')
    assert.equal(group.convocable, true, 'should have the right convocable')
    assert.isTrue(group.cans.Team.update, 'should has set the cans')
  })

  test('get a group', async ({ client, assert }) => {
    let teamAndOwner = teamsAndOwners[0]

    let response = await client.post('/groups').json({
      name: 'Preparatore atletico',
      team: teamAndOwner.team
    }).loginAs(teamAndOwner.owner)

    let group = response.body()
    response = await client.get('/groups/' + group.id).loginAs(teamAndOwner.owner)

    response.assertAgainstApiSpec()
    const groupResponse = response.body()
    assert.equal(groupResponse.id, group.id, "should return the correct group")
  })

  test('update a existing group', async ({ client, assert }) => {
    let teamAndOwner = teamsAndOwners[0]

    let response = await client.post('/groups').json({
      name: 'Massaggiatore',
      team: teamAndOwner.team
    }).loginAs(teamAndOwner.owner)

    let group = response.body()
    response = await client.put('/groups/' + group.id).json({
      name: 'Massaggiatore (stagione estiva)',
      convocable: false,
      cans: {
        Team: {
          create: true
        }
      }
    }).loginAs(teamAndOwner.owner)

    response.assertAgainstApiSpec()
    const groupResponse = response.body()
    assert.equal(groupResponse.id, group.id, "should return the correct group")
    assert.equal(groupResponse.name, 'Massaggiatore (stagione estiva)', "should have updated correctly")
    assert.equal(groupResponse.convocable, false, "should have updated correctly the convocable")
    assert.isTrue(groupResponse.cans.Team.create, 'should has set the cans')
  })

  test('destroy an existing group', async ({ client, assert }) => {
    let teamAndOwner = teamsAndOwners[0]

    let response = await client.post('/groups').json({
      name: 'Contadino',
      team: teamAndOwner.team
    }).loginAs(teamAndOwner.owner)

    let group = response.body()
    response = await client.delete('/groups/' + group.id).loginAs(teamAndOwner.owner)

    let existingGroup = await Group.query()
      .whereHas('team', builder => builder.where('teams.id', teamAndOwner.team.id))
      .where('id', group.id)

    assert.isTrue(existingGroup.length == 0, "should destroy the group")
  })
})
