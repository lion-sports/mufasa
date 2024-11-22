import Dashboard from 'App/Models/Dashboard'
import Factory from '@ioc:Adonis/Lucid/Factory'
import WidgetFactory from './WidgetFactory'

export default Factory.define(Dashboard, ({ faker }) => {
  return {
    name: faker.lorem.word(),
    active: false,
  }
})
  .relation('widgets', () => WidgetFactory)
  .build()
