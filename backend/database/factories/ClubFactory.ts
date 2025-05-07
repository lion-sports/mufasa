import Club from '#models/Club'
import Factory from '@adonisjs/lucid/factories'

export default Factory.define(Club, ({ faker }) => {
  return {
    name: faker.internet.username(),
    completeName: faker.company.name(),
    bio: faker.lorem.paragraph(3),
    sport: 'volleyball' as const,
    logoMediaId: null
  }
})
  .build()