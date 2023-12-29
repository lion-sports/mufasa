import User from 'App/Models/User'
import Factory from '@ioc:Adonis/Lucid/Factory'

export default Factory.define(User, ({ faker }) => {
    return {
      email: faker.internet.exampleEmail(),
      firstname: faker.name.firstName(),
      lastname: faker.name.lastName(),
      password: faker.internet.password(),
      rememberMeToken: faker.internet.password()
    }
  })
  .state('system', (user) => user.system = true )
  .build()
