import Group from '#app/Models/Group'
import Factory from '@adonisjs/lucid/factories'
import ClubFactory from './ClubFactory.js'
import TeamFactory from './TeamFactory.js'

export default Factory.define(Group, (_params) => {
  return {
  }
})
.relation('club', () => ClubFactory)
.relation('team', () => TeamFactory)
.build()
