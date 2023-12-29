import { ApplicationContract } from '@ioc:Adonis/Core/Application'

/**
 * Provider to bind bull to the container
 */
export default class BullProvider {
  constructor(protected app: ApplicationContract) {}

  public async register() {
    this.app.container.bind('Breeze/BullExceptionHandler', () => {
      const { BullExceptionHandler } = require('../src/BullExceptionHandler')
      return BullExceptionHandler
    })

    this.app.container.singleton('Breeze', () => {
      const app = this.app.container.use('Adonis/Core/Application')
      const config = this.app.container
        .use('Adonis/Core/Config')
        .get('bull', {})
      const Logger = this.app.container.use('Adonis/Core/Logger')

      const jobs = require(app.startPath('jobs'))?.default || []
      const { BullManager } = require('../src/BullManager')

      return new BullManager(this.app.container, Logger, config, jobs)
    })

    this.app.container.alias('Breeze', 'Bull')
  }

  public async shutdown() {
    await this.app.container
      .use<'Breeze'>('Breeze')
      .shutdown()
  }
}
