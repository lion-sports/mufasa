import ConvocationModel from 'App/Models/Convocation';
import TeammateModel from 'App/Models/Teammate';
import { DateTime } from 'luxon';
import UserModel from 'App/Models/User'
import type User from 'App/Models/User'
import type Team from 'App/Models/Team'
import type Teammate from 'App/Models/Teammate'
import type Convocation from 'App/Models/Convocation'
import { test } from '@japa/runner'
import { TeamFactory, UserFactory } from 'Database/factories'


test.group('Convocations', (group) => {
  let loggedInUser: User
  let team: Team
  let teammateToConvocate: Teammate

  group.setup(async () => {
    team = await TeamFactory.with('owner').with('teammateUsers').create()

    teammateToConvocate = await TeammateModel.create({
      userId: (await UserFactory.create()).id,
      teamId: team.id
    })

    loggedInUser = await UserModel.query().whereHas('teams', builder => {
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

    let convocation: Convocation = await ConvocationModel.query()
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

    let convocation: Convocation = await ConvocationModel.query()
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

    let convocation: Convocation = await ConvocationModel.query()
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

    let convocation = await ConvocationModel.query()
      .where('eventId', event.id)
      .where('teammateId', teammateToConvocate.id)
      .first()

    assert.notExists(convocation, 'should have removed the convocation')
  })
})
