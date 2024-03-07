import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { string } from '@ioc:Adonis/Core/Helpers'
import { SimplePaginatorMetaKeys } from '@ioc:Adonis/Lucid/Database'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import FipavBot from 'App/Telegram/fipav.bot'
import TelegramBot from 'node-telegram-bot-api'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    // Register your own bindings
  }

  public async boot() {
    // IoC container is ready
    const { default: Env } = await import('@ioc:Adonis/Core/Env')
    const { default: Application } = await import('@ioc:Adonis/Core/Application')

    if(Application.environment == 'web') {
      const token = Env.get('TELEGRAM_FIPAV_BOT_TOKEN')
      const publicUrl = Env.get('PUBLIC_URL')
  
      if(!!publicUrl && !!token) {
        const { default: Route } = await import('@ioc:Adonis/Core/Route')
  
        let fipavBot = new FipavBot({
          token,
          webHookUrl: `${publicUrl}/bot${token}`
        })
  
        Route.post(`/bot${token}`, ({ request, response }) => {
          // @ts-ignore
          let update: TelegramBot.Update = request.body()
  
          fipavBot.bot.processUpdate(update)
          response.send(200)
        })
      } else if(!!token) {
        new FipavBot({ token })
      } else {
        console.warn('missing telegram bot token')
      }
    }

  }

  public async ready() {
    const Db = this.app.container.use('Adonis/Lucid/Database')
    const Orm = this.app.container.use('Adonis/Lucid/Orm')

    class CamelCaseNameStrategy extends Orm.SnakeCaseNamingStrategy {
      public tableName(model: LucidModel) {
        return string.pluralize(string.snakeCase(model.name))
      }

      public columnName(_model: LucidModel, attributeName: string): string {
        return string.camelCase(attributeName)
      }

      public serializedName(_model: LucidModel, attributeName: string): string {
        return string.camelCase(attributeName)
      }

      paginationMetaKeys(): SimplePaginatorMetaKeys {
        return {
          total: 'total',
          perPage: 'perPage',
          currentPage: 'currentPage',
          lastPage: 'lastPage',
          firstPage: 'firstPage',
          firstPageUrl: 'firstPageUrl',
          lastPageUrl: 'lastPageUrl',
          nextPageUrl: 'nextPageUrl',
          previousPageUrl: 'previousPageUrl',
        }
      }
    }
    
    // Orm.ModelPaginator.namingStrategy = new CamelCaseNameStrategy()
    // Orm.BaseModel.namingStrategy = new CamelCaseNameStrategy()
    Db.SimplePaginator.namingStrategy = new CamelCaseNameStrategy()
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
