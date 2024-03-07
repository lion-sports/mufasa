import User from 'App/Models/User'
import Factory from '@ioc:Adonis/Lucid/Factory'

export default Factory.define(User, ({ faker }) => {
  return {
    email: faker.internet.exampleEmail(),
    password: faker.internet.password(),
    rememberMeToken: faker.internet.password(),
    name: faker.internet.userName()
  }
}).build()
