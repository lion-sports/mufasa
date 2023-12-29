import Role from 'App/Models/Role'
import Factory from '@ioc:Adonis/Lucid/Factory'
import PermissionFactory from './PermissionFactory'

export default Factory.define(Role, ({ faker }) => {
  return {
    name: faker.animal.dog()
  }
}).relation('permissions', () => PermissionFactory).build()