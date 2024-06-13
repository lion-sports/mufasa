import Convocation from 'App/Models/Convocation';
import Teammate from 'App/Models/Teammate';
import { DateTime } from 'luxon';
import User from 'App/Models/User'
import Team from 'App/Models/Team'
import { test } from '@japa/runner'
import { TeamFactory, UserFactory } from 'Database/factories'


test.group('Convocations', (group) => {
  let loggedInUser: User
  let team: Team
  let teammateToConvocate: Teammate

  group.setup(async () => {
    team = await TeamFactory.with('owner').with('teammateUsers').create()

    teammateToConvocate = await Teammate.create({
      userId: (await UserFactory.create()).id,
      teamId: team.id
    })

    loggedInUser = await User.query().whereHas('teams', builder => {
      builder.where('teams.id', team.id)
    }).firstOrFail()

    team.ownerId = loggedInUser.id
    await team.save()
  })

  test('confirm convocation', async ({ client, assert }) => {
    let response = await client.post('/events').json({
      event: {
        name: "Evento con convocazioni",
        start: DateTime.local(2022, 5, 15, 9, 0, 0),
        end: DateTime.local(2022, 5, 15, 11, 0, 0),
        description: "Descrizione dell'evento",
        status: 'confirmed',
        team: {
          id: team.id
        },
        convocations: [
          { teammateId: teammateToConvocate.id }
        ]
      }
    }).loginAs(loggedInUser)

    const event = response.body()

    let convocation: Convocation = await Convocation.query()
      .where('eventId', event.id)
      .firstOrFail()

    response = await client.post('/convocations/' + convocation.id + '/confirm').loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    await convocation.refresh()
    assert.equal(convocation.confirmationStatus, 'confirmed', 'should confirm the convocation')
  })

  test('deny convocation', async ({ client, assert }) => {
    let response = await client.post('/events').json({
      event: {
        name: "Evento con convocazioni",
        start: DateTime.local(2022, 5, 15, 9, 0, 0),
        end: DateTime.local(2022, 5, 15, 11, 0, 0),
        description: "Descrizione dell'evento",
        status: 'confirmed',
        team: {
          id: team.id
        },
        convocations: [
          { teammateId: teammateToConvocate.id }
        ]
      }
    }).loginAs(loggedInUser)

    const event = response.body()

    let convocation: Convocation = await Convocation.query()
      .where('eventId', event.id)
      .firstOrFail()

    response = await client.post('/convocations/' + convocation.id + '/deny').loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    await convocation.refresh()
    assert.equal(convocation.confirmationStatus, 'denied', 'should confirm the convocation')
  })

  test('convocate to an event', async ({ client, assert }) => {
    let responseFromEvent = await client.post('/events').json({
      event: {
        name: "Evento con convocazioni",
        start: DateTime.local(2022, 5, 15, 9, 0, 0),
        end: DateTime.local(2022, 5, 15, 11, 0, 0),
        description: "Descrizione dell'evento",
        status: 'confirmed',
        team: {
          id: team.id
        },
      }
    }).loginAs(loggedInUser)

    const event = responseFromEvent.body()

    let response = await client.post('/events/' + event.id + '/convocate').json({
      teammates: [
        {
          id: teammateToConvocate.id
        }
      ]
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()

    let convocation: Convocation = await Convocation.query()
      .where('eventId', event.id)
      .where('teammateId', teammateToConvocate.id)
      .firstOrFail()

    assert.equal(convocation.confirmationStatus, 'pending', 'should create the pending convocation')
  })

  test('unconvocate from an event', async ({ client, assert }) => {
    let responseFromEvent = await client.post('/events').json({
      event: {
        name: "Evento con convocazioni",
        start: DateTime.local(2022, 5, 15, 9, 0, 0),
        end: DateTime.local(2022, 5, 15, 11, 0, 0),
        description: "Descrizione dell'evento",
        status: 'confirmed',
        team: {
          id: team.id
        },
        convocations: [
          { teammateId: teammateToConvocate.id }
        ]
      }
    }).loginAs(loggedInUser)

    const event = responseFromEvent.body()

    let response = await client.post('/events/' + event.id + '/unConvocate').json({
      teammates: [
        {
          id: teammateToConvocate.id
        }
      ]
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()

    let convocation = await Convocation.query()
      .where('eventId', event.id)
      .where('teammateId', teammateToConvocate.id)
      .first()

    assert.notExists(convocation, 'should have removed the convocation')
  })
})
