import { assert } from 'chai'
import { test } from '@japa/runner'
import { BookingFactory, ClubFactory, PlaceFactory, UserFactory } from '#database/factories/index'
import User from '#models/User'
import Place from '#models/Place'
import Club from '#models/Club'

test.group('Booking', (group) => {
  let loggedInUser: User
  let place: Place
  let club: Club

  group.setup(async () => {
    loggedInUser = await UserFactory.create()

    club = await ClubFactory.create()
    await club.related('owner').associate(loggedInUser)

    place = await PlaceFactory.merge({ clubId: club.id }).create()
  })

  test('get a paginated list of bookings', async ({ client }) => {
    let booking = await BookingFactory.create()
    await booking.related('place').associate(place)
    await booking.related('createdByUser').associate(loggedInUser)

    const response = await client.get('/bookings').loginAs(loggedInUser)
    const bookings = response.body().data

    response.assertAgainstApiSpec()
    assert.isTrue(bookings.length > 0, 'should have some bookings in the list')
  })

  test('request new booking', async ({ client }) => {
    const from = new Date(Date.now() + 3600 * 1000).toISOString()
    const to = new Date(Date.now() + 2 * 3600 * 1000).toISOString()

    const response = await client
      .post('/bookings/request')
      .json({
        placeId: place.id,
        from,
        to,
        notes: 'Prova di una nota'
      })
      .loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const { booking } = response.body()
    assert.equal(booking.placeId, place.id, 'should have the right placeId')
    assert.equal(booking.status, 'confirmed', 'should have status requested')
    assert.equal(booking.notes, 'Prova di una nota', 'should have set the notes')
  })

  test('update an existing booking', async ({ client }) => {
    let booking = await BookingFactory.create()
    await booking.related('place').associate(place)
    await booking.related('createdByUser').associate(loggedInUser)

    const newNotes = 'Updated notes for the booking'
    const newFrom = new Date(Date.now() + 3 * 3600 * 1000)
    const newTo = new Date(Date.now() + 4 * 3600 * 1000)

    const response = await client
      .put(`/bookings/${booking.id}`)
      .json({
        notes: newNotes,
        from: newFrom,
        to: newTo
      })
      .loginAs(loggedInUser)

    response.assertAgainstApiSpec()
    const updatedBooking = response.body()
    assert.equal(updatedBooking.id, booking.id, 'should update the correct booking')
    assert.equal(updatedBooking.notes, newNotes, 'should update the notes')
    assert.equal(new Date(updatedBooking.from).getTime(), newFrom.getTime(), 'should update the from date')
    assert.equal(new Date(updatedBooking.to).getTime(), newTo.getTime(), 'should update the to date')
  })

  test('confirm existing booking', async ({ client }) => {
    let booking = await BookingFactory.merge({ status: 'requested' }).create()
    await booking.related('place').associate(place)
    await booking.related('createdByUser').associate(loggedInUser)

    const response = await client.post(`/bookings/${booking.id}/confirm`).loginAs(loggedInUser)
    response.assertAgainstApiSpec()
    const { booking: confirmedBooking } = response.body()
    assert.equal(confirmedBooking.id, booking.id, 'should confirm the correct booking')
    assert.equal(confirmedBooking.status, 'confirmed', 'should update the booking status')
  })

  test('get a booking', async ({ client }) => {
    let booking = await BookingFactory.create()
    await booking.related('place').associate(place)
    await booking.related('createdByUser').associate(loggedInUser)

    const response = await client.get(`/bookings/${booking.id}`).loginAs(loggedInUser)
    response.assertAgainstApiSpec()
    const bookingResp = response.body()
    assert.equal(booking.id, bookingResp.id, 'should return the correct booking')
  })
})
