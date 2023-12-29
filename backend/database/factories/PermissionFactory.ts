import Permission from 'App/Models/Permission'
import Factory from '@ioc:Adonis/Lucid/Factory'
import RoleFactory from './RoleFactory'

export default Factory.define(Permission, ({ faker }) => {
  return {
    action: faker.word.verb(),
    resource: faker.word.noun()
  }
}).relation('roles', () => RoleFactory).build()