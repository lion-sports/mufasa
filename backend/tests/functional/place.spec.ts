import { test } from '@japa/runner'
import { assert } from 'chai'
import { ClubFactory, PlaceFactory, UserFactory } from '#database/factories/index'
import User from '#models/User'
import Club from '#models/Club'

test.group('Place', (group) => {
  let loggedInUser: User
  let club: Club

  group.setup(async () => {
    loggedInUser = await UserFactory.create()

    club = await ClubFactory.create()
    await club.related('owner').associate(loggedInUser)
  })

  test('get a paginated list of places', async ({ client }) => {
    let place = await PlaceFactory.create()
    await place.related('club').associate(club)

    const response = await client.get('/places').loginAs(loggedInUser)
    const places = response.body().data

    response.assertAgainstApiSpec()
    assert.isTrue(places.length > 0, 'should have some places in the list')
  })

  test('create new place', async ({ client }) => {
    const response = await client
      .post('/places')
      .json({
        name: 'some name',
        clubId: club.id
      })
      .loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const place = response.body()
    assert.equal(place.name, 'some name', 'should have the right name')
  })

  test('update existing place', async ({ client }) => {
    const newPlace = await PlaceFactory.create()
    const response = await client
      .put('/places/' + newPlace.id)
      .json({
        name: 'UpdatedName'
      })
      .loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const place = response.body()
    assert.equal(newPlace.id, place.id, 'should update the correct place')
    assert.equal(place.name, 'UpdatedName', 'should update the place')
  })

  test('get a place', async ({ client }) => {
    const newPlace = await PlaceFactory.create()
    const response = await client.get('/places/' + newPlace.id).loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const place = response.body()
    assert.equal(newPlace.id, place.id, 'should return the correct place')
  })
})