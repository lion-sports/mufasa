import Teammate from 'App/Models/Teammate'
import Factory from '@ioc:Adonis/Lucid/Factory'
import UserFactory from './UserFactory'

export default Factory.define(Teammate, (_params) => {
    return {
      //
    }
  })
  .relation('user', () => UserFactory)
  .build()
