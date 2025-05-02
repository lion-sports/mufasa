import Widget from '#app/Models/Widget'
import Factory from '@adonisjs/lucid/factories'

export default Factory.define(Widget, ({ faker }) => {
  return {
    componentName: faker.lorem.word(),
    height: faker.number.int({ min: 1, max: 4 }),
    width: faker.number.int({ min: 1, max: 4 }),
    left: faker.number.int({ min: 1, max: 4 }),
    top: faker.number.int({ min: 1, max: 4 }),
  }
}).build()
