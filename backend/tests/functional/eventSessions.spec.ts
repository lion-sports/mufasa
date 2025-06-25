import EventSession from '#app/Models/EventSession'
import type User from '#app/Models/User'
import { test } from '@japa/runner'
import { UserFactory, EventFactory, EventSessionFactory, TeamFactory } from '#database/factories/index'
import Event from '#app/Models/Event'
import Team from '#models/Team'

// Helper to create a user, event session, and events
async function setupUserAndSessionWithEvents() {
  const user = await UserFactory.create()
  const eventSession = await EventSessionFactory.merge({ name: 'Test Session', ownedByUserId: user.id }).create()
  const events = await EventFactory.createMany(2)
  return { user, eventSession, events }
}

test.group('EventSessions', (group) => {
  let loggedInUser: User
  let team: Team

  group.setup(async () => {
    team = await TeamFactory.with('owner').create()
    await team.load('owner')
    loggedInUser = team.owner
  })

  test('create a new event session', async ({ client, assert }) => {
    const response = await client.post('/eventSessions').json({
      name: 'Preseason',
      teamId: team.id
    }).loginAs(loggedInUser)


    const eventSession = response.body()
    response.assertAgainstApiSpec()
    assert.equal(eventSession.name, 'Preseason', 'should have the right name')
    assert.isTrue(!!eventSession.uid, 'should have a uid')
  })

  test('get a paginated list of my existing event sessions', async ({ client }) => {
    const response = await client.get('/eventSessions').loginAs(loggedInUser)
    response.assertAgainstApiSpec()
  })

  test('get an event session', async ({ client, assert }) => {
    let response = await client.post('/eventSessions').json({
      name: 'Holidays',
      teamId: team.id
    }).loginAs(loggedInUser)

    let eventSessionToGet = response.body()

    response = await client.get('/eventSessions/' + eventSessionToGet.id).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const eventSession = response.body()
    assert.equal(eventSessionToGet.id, eventSession.id, "should return the correct event session")
    assert.equal(eventSessionToGet.name, eventSession.name, "should return the correct event session name")
  })

  test('update an existing event session', async ({ client, assert }) => {
    let response = await client.post('/eventSessions').json({
      name: 'Summer cup',
      teamId: team.id
    }).loginAs(loggedInUser)

    let eventSessionToUpdate = response.body()

    response = await client.put('/eventSessions/' + eventSessionToUpdate.id).json({
      name: 'Summer cup 2022'
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const eventSession = response.body()
    assert.equal(eventSessionToUpdate.id, eventSession.id, "should return the correct event session")
    assert.equal(eventSession.name, 'Summer cup 2022', "should have updated the session name")
  })

  test('destroy an existing event session', async ({ client, assert }) => {
    let response = await client.post('/eventSessions').json({
      name: 'League',
      teamId: team.id
    }).loginAs(loggedInUser)

    let eventSessionToDestroy = response.body()

    response = await client.delete('/eventSessions/' + eventSessionToDestroy.id).loginAs(loggedInUser)

    let results = await EventSession.query().where('id', eventSessionToDestroy.id)
    assert.isTrue(results.length == 0, "should have destroy the event session")
  })

  
  test('addEvents attaches events to an event session', async ({ client, assert }) => {
    const events = await EventFactory.merge({ teamId: team.id }).createMany(2)
    const eventSession = await EventSessionFactory.merge({ teamId: team.id, ownedByUserId: loggedInUser.id }).create()

    const response = await client.post(`/eventSessions/${eventSession.id}/addEvents`).json({
      events: events.map((e: Event) => ({ id: e.id })),
      eventSession: { id: eventSession.id }
    }).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const session = response.body()
    assert.equal(session.id, eventSession.id)
    assert.isArray(session.events)
    assert.sameMembers((session.events as any[]).map((e: any) => e.id), events.map((e: Event) => e.id))
  })

  test('removeEvents detaches events from an event session', async ({ client, assert }) => {
    const events = await EventFactory.merge({ teamId: team.id }).createMany(2)
    const eventSession = await EventSessionFactory.merge({ teamId: team.id, ownedByUserId: loggedInUser.id }).create()

    // Attach first
    await eventSession.related('events').attach(events.map((e: Event) => e.id))
    const response = await client.post(`/eventSessions/${eventSession.id}/removeEvents`).json({
      events: events.map((e: Event) => ({ id: e.id })),
      eventSession: { id: eventSession.id }
    }).loginAs(loggedInUser)
    response.assertAgainstApiSpec()
    const session = response.body()
    assert.equal(session.id, eventSession.id)
    assert.isArray(session.events)
    assert.lengthOf(session.events, 0)
  })

  test('setEvents syncs events for an event session', async ({ client, assert }) => {
    const events = await EventFactory.merge({ teamId: team.id }).createMany(2)
    const eventSession = await EventSessionFactory.merge({ teamId: team.id, ownedByUserId: loggedInUser.id }).create()

    // Attach only the first event
    await eventSession.related('events').attach([events[0].id])
    const response = await client.post(`/eventSessions/${eventSession.id}/setEvents`).json({
      events: events.map((e: Event) => ({ id: e.id })),
      eventSession: { id: eventSession.id }
    }).loginAs(loggedInUser)
    response.assertAgainstApiSpec()
    const session = response.body()
    assert.equal(session.id, eventSession.id)
    assert.isArray(session.events)
    assert.sameMembers((session.events as any[]).map((e: any) => e.id), events.map((e: Event) => e.id))
  })
})
