import Team from '#app/Models/Team'
import Factory from '@adonisjs/lucid/factories'
import UserFactory from './UserFactory.js'
import TeammateFactory from './TeammateFactory.js'

export default Factory.define(Team, ({ faker }) => {
    return {
      name: faker.word.words(3),
      notes: faker.company.catchPhraseDescriptor() 
    }
  })
  .relation('owner', () => UserFactory)
  .relation('teammates', () => TeammateFactory)
  .relation('teammateUsers', () => UserFactory)
  .build()
