import Place from '#models/Place'
import Factory from '@adonisjs/lucid/factories'
import ClubFactory from './ClubFactory.js'

export default Factory.define(Place, ({ faker }) => {
  return {
    name: faker.animal.dog(),
    address: faker.location.streetAddress(),
    description: faker.lorem.paragraph(2)
  }
})
  .relation('club', () => ClubFactory)
  .build()