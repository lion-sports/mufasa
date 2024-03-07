import EventSessionModel from 'App/Models/EventSession'
import type User from 'App/Models/User'
import { test } from '@japa/runner'
import { UserFactory } from 'Database/factories'

test.group('EventSessions', (group) => {
  let loggedInUser: User

  group.setup(async () => {
    loggedInUser = await UserFactory.create()
  })

  test('create a new event session', async ({ client, assert }) => {
    const response = await client.post('/eventSessions').json({
      name: 'Preseason',
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
    }).loginAs(loggedInUser)

    let eventSessionToDestroy = response.body()

    response = await client.delete('/eventSessions/' + eventSessionToDestroy.id).loginAs(loggedInUser)

    let results = await EventSessionModel.query().where('id', eventSessionToDestroy.id)
    assert.isTrue(results.length == 0, "should have destroy the event session")
  })
})
