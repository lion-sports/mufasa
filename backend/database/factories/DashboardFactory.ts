import Dashboard from '#app/Models/Dashboard'
import Factory from '@adonisjs/lucid/factories'
import WidgetFactory from './WidgetFactory.js'

export default Factory.define(Dashboard, ({ faker }) => {
  return {
    name: faker.lorem.word(),
    active: false,
  }
})
  .relation('widgets', () => WidgetFactory)
  .build()
