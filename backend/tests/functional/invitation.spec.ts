import Teammate from '#app/Models/Teammate';
import TeamsManager from '#app/managers/teams.manager';
import User from '#app/Models/User'
import Team from '#app/Models/Team'
import { test } from '@japa/runner'
import { TeamFactory, UserFactory } from '#database/factories/index'
import GroupFactory from '#database/factories/GroupFactory';
import InvitationsManager from '#app/managers/invitations.manager';

test.group('Invitations', (group) => {
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

  test('invite a non exising user to a team', async ({ client, assert }) => {
    const response = await client.post('/invitations/inviteUser').json({
      user: {
        email: 'gabriele.garlaschelli@gmail.com'
      },
      team: {
        id: team.id
      }
    }).loginAs(loggedInUser)


    const invitation = response.body()
    response.assertAgainstApiSpec()
    assert.equal(invitation.status, 'pending', 'invitation should be pending')
    assert.equal(invitation.team.id, team.id, 'invitation should be for the right team')
    assert.equal(invitation.invitedEmail, 'gabriele.garlaschelli@gmail.com', 'invitation should be at the right user')
  })

  test('invite a exising user to a team', async ({ client, assert }) => {
    let invitedUser = await UserFactory.create()

    const response = await client.post('/invitations/inviteUser').json({
      user: {
        email: invitedUser.email
      },
      team: {
        id: team.id
      }
    }).loginAs(loggedInUser)


    const invitation = response.body()
    response.assertAgainstApiSpec()
    assert.equal(invitation.status, 'pending', 'invitation should be pending')
    assert.equal(invitation.team.id, team.id, 'invitation should be for the right team')
    assert.equal(invitation.invitedEmail, invitedUser.email, 'invitation should be at the right user')
  })

  test('get my invitations', async ({ client, assert }) => {
    let invitedUser = await UserFactory.create()

    await client.post('/invitations/inviteUser').json({
      user: {
        email: invitedUser.email
      },
      team: {
        id: team.id
      }
    }).loginAs(loggedInUser)

    const response = await client.get('/invitations/list').loginAs(invitedUser)

    
    const invitation = response.body()
    response.assertAgainstApiSpec()
    assert.isTrue(invitation.data.length > 0, 'should has at least one invitation')
  })

  test('accept an invitations', async ({ client, assert }) => {
    let invitedUser = await UserFactory.create()

    const inviteUserResponse = await client.post('/invitations/inviteUser').json({
      user: {
        email: invitedUser.email
      },
      team: {
        id: team.id
      }
    }).loginAs(loggedInUser)

    const invitationToAccept = inviteUserResponse.body()

    const response = await client.post('/invitations/accept').json({
      invitation: {
        id: invitationToAccept.id
      }
    }).loginAs(invitedUser)

    const invitation = response.body()
    response.assertAgainstApiSpec()
    assert.equal(invitation.status, 'accepted', 'invitation should be accepted')

    let teammate = await Teammate.query()
      .where('teamId', team.id)
      .where('userId', invitedUser.id)

    assert.isTrue(teammate.length > 0, 'should have created the teammate')


    await client.post('/invitations/accept').json({
      invitation: {
        id: invitationToAccept.id
      }
    }).loginAs(invitedUser)

    teammate = await Teammate.query()
      .where('teamId', team.id)
      .where('userId', invitedUser.id)

    assert.isTrue(teammate.length == 1, 'should have not duplicate the invitation')
  })

  test('reject an invitations', async ({ client, assert }) => {
    let invitedUser = await UserFactory.create()

    const inviteUserResponse = await client.post('/invitations/inviteUser').json({
      user: {
        email: invitedUser.email
      },
      team: {
        id: team.id
      }
    }).loginAs(loggedInUser)

    const invitationToReject = inviteUserResponse.body()

    const response = await client.post('/invitations/reject').json({
      invitation: {
        id: invitationToReject.id
      }
    }).loginAs(invitedUser)

    const invitation = response.body()
    response.assertAgainstApiSpec()
    assert.equal(invitation.status, 'rejected', 'invitation should be rejected')
  })

  test('discard an invitations', async ({ client, assert }) => {
    let invitedUser = await UserFactory.create()

    const inviteUserResponse = await client.post('/invitations/inviteUser').json({
      user: {
        email: invitedUser.email
      },
      team: {
        id: team.id
      }
    }).loginAs(loggedInUser)

    const invitationToDiscard = inviteUserResponse.body()

    const response = await client.post('/invitations/discard').json({
      invitation: {
        id: invitationToDiscard.id
      }
    }).loginAs(loggedInUser)

    const invitation = response.body()
    response.assertAgainstApiSpec()
    assert.equal(invitation.status, 'discarded', 'invitation should be discarded')
  })

  test('remove a user from a team', async ({ client, assert }) => {
    let invitedUser = await UserFactory.create()
    let group = await GroupFactory.create()
    await group.related('team').associate(team)

    const inviteUserResponse = await client.post('/invitations/inviteUser').json({
      user: {
        email: invitedUser.email
      },
      team: {
        id: team.id
      },
      group: {
        id: group.id
      }
    }).loginAs(loggedInUser)

    const invitationToAccept = inviteUserResponse.body()

    assert.equal(invitationToAccept.groupId, group.id, 'invitation must have the group id')

    await client.post('/invitations/accept').json({
      invitation: {
        id: invitationToAccept.id
      }
    }).loginAs(invitedUser)

    await client.post(`/teams/${team.id}/removeUser`).json({
      user: {
        id: invitedUser.id
      },
    }).loginAs(loggedInUser)

    let teammate = await Teammate.query()
      .where('teamId', team.id)
      .where('userId', invitedUser.id)

    assert.isTrue(teammate.length == 0, 'should have remove the teammate')
  })

  test('spontaneus exit from a team', async ({ client, assert }) => {
    let invitedUser = await UserFactory.create()

    const inviteUserResponse = await client.post('/invitations/inviteUser').json({
      user: {
        email: invitedUser.email
      },
      team: {
        id: team.id
      }
    }).loginAs(loggedInUser)

    const invitationToAccept = inviteUserResponse.body()

    await client.post('/invitations/accept').json({
      invitation: {
        id: invitationToAccept.id
      }
    }).loginAs(invitedUser)

    await client.post(`/teams/${team.id}/exit`).loginAs(invitedUser)

    let teammate = await Teammate.query()
      .where('teamId', team.id)
      .where('userId', invitedUser.id)

    assert.isTrue(teammate.length == 0, 'should have remove the teammate')
  })

  test('update a teammates', async ({ client, assert }) => {
    let invitedUser = await UserFactory.create()

    const inviteUserResponse = await client.post('/invitations/inviteUser').json({
      user: {
        email: invitedUser.email
      },
      team: {
        id: team.id
      }
    }).loginAs(loggedInUser)

    const invitationToAccept = inviteUserResponse.body()

    await client.post('/invitations/accept').json({
      invitation: {
        id: invitationToAccept.id
      }
    }).loginAs(invitedUser)

    let teammate = await Teammate.query()
      .where('teamId', team.id)
      .where('userId', invitedUser.id)
      .firstOrFail()

    let response = await client.put(`/teammates/${teammate.id}`).json({
      alias: 'alias',
      defaultRole: 'setter',
      availableRoles: ['setter', 'outsideHitter']
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    await teammate.refresh()

    assert.equal(teammate.alias, 'alias', 'should have update alias')
    assert.equal(teammate.defaultRole, 'setter', 'should have update the default role')
    assert.equal(teammate.availableRoles.length, 2, 'should have update the available roles')
  })

  test('invite user by url to a team', async ({ client, assert }) => {
    let group = await GroupFactory.create()
    await group.related('team').associate(team)

    const response = await client.post('/invitations/inviteUserByUrl').json({
      team: {
        id: team.id
      },
      group: {
        id: group.id
      }
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const body = response.body()
    assert.isString(body.url, 'should return a url')
    assert.include(body.url, '/auth/signup', 'url should contain signup path')
  })

  test('invite user by url to a team and validate token', async ({ client, assert }) => {
    let group = await GroupFactory.create()
    await group.related('team').associate(team)

    const response = await client.post('/invitations/inviteUserByUrl').json({
      team: {
        id: team.id
      },
      group: {
        id: group.id
      }
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const body = response.body()
    assert.isString(body.url, 'should return a url')
    assert.include(body.url, '/auth/signup', 'url should contain signup path')

    // Extract token from url
    const urlObj = new URL(body.url)
    const token = urlObj.searchParams.get('token')
    assert.isString(token, 'token should be present in url')

    // Validate token using InvitationsManager directly
    const manager = new InvitationsManager()
    const result = await manager.validateInvitation({
      data: { token: token! },
      context: { user: loggedInUser }
    })
    assert.isTrue(result.valid, 'invitation token should be valid')
    assert.exists(result.invitation, 'invitation should be returned')
  })
})
