import EventSession from '#app/Models/EventSession'
import { cuid } from '@adonisjs/core/helpers'
import Factory from '@adonisjs/lucid/factories'

export default Factory.define(EventSession, ({ faker }) => {
  return {
    uid: cuid(),
    name: faker.company.catchPhrase()
  }
}).build()
