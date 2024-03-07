import ConvocationModel from 'App/Models/Convocation';
import TeammateModel from 'App/Models/Teammate';
import { DateTime } from 'luxon';
import UserModel from 'App/Models/User'
import type User from 'App/Models/User'
import type Team from 'App/Models/Team'
import type Teammate from 'App/Models/Teammate'
import { test } from '@japa/runner'
import { TeamFactory, UserFactory } from 'Database/factories'
import EventModel from 'App/Models/Event';


test.group('Events', (group) => {
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

  test('create a new event', async ({ client, assert }) => {
    const response = await client.post('/events').json({
      event: {
        name: "Evento casuale",
        start: DateTime.local(2022, 5, 15, 9, 0, 0),
        end: DateTime.local(2022, 5, 15, 11, 0, 0),
        description: "Descrizione dell'evento",
        status: 'confirmed',
        team: {
          id: team.id
        }
      }
    }).loginAs(loggedInUser)


    const event = response.body()
    response.assertAgainstApiSpec()
    assert.equal(event.name, 'Evento casuale', 'should create the right event')
  })

  test('create a new event with frequency', async ({ client, assert }) => {
    const response = await client.post('/events/createWithFrequency').json({
      event: {
        name: "Evento casuale",
        start: DateTime.local(2022, 5, 15, 9, 0, 0),
        end: DateTime.local(2022, 5, 15, 11, 0, 0),
        description: "Descrizione dell'evento",
        status: 'confirmed',
        team: {
          id: team.id
        }
      },
      rule: {
        frequency: 'week',
        from: DateTime.local(2022, 5, 15),
        to: DateTime.local(2022, 6, 15),
        daysOfWeek: [1, 4]
      }
    }).loginAs(loggedInUser)


    const events = response.body()
    response.assertAgainstApiSpec()
    assert.equal(events.length, 9, 'should be the right number of events')
  })

  test('create a new event with convocations', async ({ client, assert }) => {
    const response = await client.post('/events').json({
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
    response.assertAgainstApiSpec()
    assert.equal(event.name, 'Evento con convocazioni', 'should create the right event')

    const convocation = await ConvocationModel.query()
      .where('eventId', event.id)
      .where('teammateId', teammateToConvocate.id)
      .first()

    assert.isTrue(!!convocation, "should create the convocation")
    
  })

  test('get an event', async ({ client, assert }) => {
    let response = await client.post('/events').json({
      event: {
        name: "Evento casuale",
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

    const createdEvent = response.body()

    response = await client.get('/events/' + createdEvent.id).loginAs(loggedInUser)

    const events = response.body()
    response.assertAgainstApiSpec()
    assert.isTrue(!!events, 'should find and event')
  })

  test('get a list of events', async ({ client, assert }) => {
    await client.post('/events').json({
      event: {
        name: "Evento casuale",
        start: DateTime.local(2022, 5, 15, 9, 0, 0),
        end: DateTime.local(2022, 5, 15, 11, 0, 0),
        description: "Descrizione dell'evento",
        status: 'confirmed',
        team: {
          id: team.id
        }
      }
    }).loginAs(loggedInUser)

    const response = await client.get('/events').qs({
      filters: {
        from: DateTime.local(2022, 5, 15).toISO(),
        to: DateTime.local(2022, 5, 23).toISO(),
      },
    }).loginAs(loggedInUser)


    const events = response.body()
    response.assertAgainstApiSpec()
    assert.isTrue(events.length > 0, 'should find some events')
  })

  test('not get a list of other team events', async ({ client, assert }) => {
    let externalTeam = await TeamFactory.with('owner').with('teammateUsers').create()

    let externalLoggedInUser = await UserModel.query().whereHas('teams', builder => {
      builder.where('teams.id', externalTeam.id)
    }).firstOrFail()

    externalTeam.ownerId = externalLoggedInUser.id
    await externalTeam.save()

    await client.post('/events').json({
      event: {
        name: "Evento casuale da esterno",
        start: DateTime.local(2022, 5, 15, 9, 0, 0),
        end: DateTime.local(2022, 5, 15, 11, 0, 0),
        description: "Descrizione dell'evento",
        status: 'confirmed',
        team: {
          id: externalTeam.id
        }
      }
    }).loginAs(externalLoggedInUser)

    const response = await client.get('/events').qs({
      filters: {
        from: DateTime.local(2022, 5, 15).toISO(),
        to: DateTime.local(2022, 5, 23).toISO(),
      },
    }).loginAs(externalLoggedInUser)

    const events = response.body()
    assert.isTrue(events.length == 1, 'should find the only team events')
  })

  test('update an event', async ({ client, assert }) => {
    let response = await client.post('/events').json({
      event: {
        name: "Evento casuale",
        start: DateTime.local(2022, 5, 15, 9, 0, 0),
        end: DateTime.local(2022, 5, 15, 11, 0, 0),
        description: "Descrizione dell'evento",
        status: 'confirmed',
        team: {
          id: team.id
        }
      }
    }).loginAs(loggedInUser)

    let eventToUpdate = response.body()

    response = await client.put('/events/' + eventToUpdate.id).json({
      start: DateTime.local(2022, 5, 15, 11, 30, 0),
      end: DateTime.local(2022, 5, 15, 12, 30, 0)
    }).loginAs(loggedInUser)

    const event = response.body()
    response.assertAgainstApiSpec()

    const start = DateTime.fromISO(event.start)
    assert.equal(start.get('hour'), 11, "should update the start hour")
    assert.equal(start.get('minute'), 30, "should update the start minute")
    const end = DateTime.fromISO(event.end)
    assert.equal(end.get('hour'), 12, "should update the end hour")
    assert.equal(end.get('minute'), 30, "should update the end minute")
  })

  test('copy a week', async ({ client, assert }) => {
    await client.post('/events').json({
      event: {
        name: "Evento da copiare",
        start: DateTime.local(2022, 7, 16, 9, 0, 0),
        end: DateTime.local(2022, 7, 16, 11, 0, 0),
        description: "Descrizione dell'evento",
        status: 'confirmed',
        team: {
          id: team.id
        }
      }
    }).loginAs(loggedInUser)

    await client.post('/events').json({
      event: {
        name: "Evento da copiare 2",
        start: DateTime.local(2022, 7, 17, 15, 0, 0),
        end: DateTime.local(2022, 7, 17, 17, 0, 0),
        description: "Descrizione dell'evento",
        status: 'confirmed',
        team: {
          id: team.id
        }
      }
    }).loginAs(loggedInUser)


    let response = await client.post('/events/copyWeek').json({
      fromWeekNumber: DateTime.local(2022, 7, 16, 15, 0, 0).get('weekNumber'),
      fromWeekYear: DateTime.local(2022, 7, 16, 15, 0, 0).get('weekYear'),
      toWeekNumber: DateTime.local(2022, 7, 16, 15, 0, 0).get('weekNumber') + 1,
      toWeekYear: DateTime.local(2022, 7, 16, 15, 0, 0).get('weekYear') + 1,
      team: {
        id: team.id
      }
    }).loginAs(loggedInUser)
    
    response.assertAgainstApiSpec()

    const eventListResponse = await client.get('/events').qs({
      filters: {
        from: DateTime.local(2022, 7, 16).toISO(),
        to: DateTime.local(2022, 7, 30).toISO(),
      },
    }).loginAs(loggedInUser)

    
    let copiedEvents = eventListResponse.body()
    assert.isTrue(copiedEvents.length > 0, 'should copy the event')
    assert.isTrue(!!copiedEvents.find((event) => event.name == 'Evento da copiare'), 'should copy the event')
  })

  test('destroy an event', async ({ client, assert }) => {
    let response = await client.post('/events').json({
      event: {
        name: "Evento casuale",
        start: DateTime.local(2022, 5, 15, 9, 0, 0),
        end: DateTime.local(2022, 5, 15, 11, 0, 0),
        description: "Descrizione dell'evento",
        status: 'confirmed',
        team: {
          id: team.id
        }
      }
    }).loginAs(loggedInUser)

    let eventToDelete = response.body()

    await client.delete('/events/' + eventToDelete.id).loginAs(loggedInUser)
    const results = await EventModel.query().where('id', eventToDelete.id)

    assert.equal(results.length, 0, 'should have remove the event')
  })

  
})
