import User from '#app/Models/User'
import Factory from '@adonisjs/lucid/factories'

export default Factory.define(User, ({ faker }) => {
  return {
    email: faker.internet.exampleEmail(),
    password: faker.internet.password(),
    name: faker.internet.username()
  }
}).build()
