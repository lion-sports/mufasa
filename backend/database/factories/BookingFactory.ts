import Booking from '#models/Booking'
import Factory from '@adonisjs/lucid/factories'
import PlaceFactory from './PlaceFactory.js'
import UserFactory from './UserFactory.js'
import { DateTime } from 'luxon'

export default Factory.define(Booking, ({ faker }) => {
  const from = DateTime.now().plus({ days: faker.number.int({ min: 1, max: 10 }) })
  const to = from.plus({ hours: faker.number.int({ min: 1, max: 4 }) })
  return {
    from,
    to,
    status: faker.helpers.arrayElement(['requested', 'confirmed']),
  }
})
  .relation('place', () => PlaceFactory)
  .relation('createdByUser', () => UserFactory)
  .build()
