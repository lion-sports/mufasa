import { BaseCommand, flags } from '@adonisjs/core/build/standalone'

export default class Listen extends BaseCommand {
  public static commandName = 'bull:listen'
  public static description = 'Start the Bull listener'
  public static settings = {
    loadApp: true,
    stayAlive: true,
  }

  /**
   * Custom port for the bull-board
   */
  @flags.number({
    description: "Run bull's dashboard in the provided port",
    alias: 'p',
  })
  public port: number

  /**
   * Execute command
   */
  public async run(): Promise<void> {
    const bull = this.application.container.use('Breeze')
    bull.process()

    // have to do this because without the process exit immediatly
    while(true) {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(undefined)
        }, 30000);
      })
    }
  }
}
