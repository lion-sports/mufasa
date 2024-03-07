import Team from 'App/Models/Team'
import Factory from '@ioc:Adonis/Lucid/Factory'
import UserFactory from './UserFactory'
import TeammateFactory from './TeammateFactory'

export default Factory.define(Team, ({ faker }) => {
    return {
      name: faker.random.words(3),
      notes: faker.company.catchPhraseDescriptor() 
    }
  })
  .relation('owner', () => UserFactory)
  .relation('teammates', () => TeammateFactory)
  .relation('teammateUsers', () => UserFactory)
  .build()
