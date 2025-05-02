import Teammate from '#app/Models/Teammate'
import Factory from '@adonisjs/lucid/factories'
import UserFactory from './UserFactory.js'

export default Factory.define(Teammate, (_params) => {
    return {
      //
    }
  })
  .relation('user', () => UserFactory)
  .build()
