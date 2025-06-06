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
    if (this.app.environment === 'web' || this.app.environment === 'test') {
      let { default: Ws } = await import('../app/Services/Ws')
      let { default: scoutSocket } = await import('App/managers/scout/scouts.socket')
      let { AuthorizationHelpers } = await import('App/managers/authorization.manager')

      Ws.boot()

      Ws.io.on('connection', async (socket) => {
        await socket.data.user.load('teams')

        for(let i = 0; i < socket.data.user.teams.length; i += 1) {
          const team = socket.data.user.teams[i]
          let canManageScout = await AuthorizationHelpers.userCanInTeam({
            data: {
              user: socket.data.user,
              team: { id: team.id },
              action: 'manage',
              resource: 'scout'
            }
          })

          if(canManageScout) socket.join(Ws.roomName({ team, namespace: 'scout' }))

          socket.on(Ws.roomName({ team, namespace: `scout:add` }), async (data) => {
            try {
              await scoutSocket.handleEvent({
                data: {
                  event: 'scout:add',
                  data: data,
                },
                context: {
                  user: socket.data.user
                }
              })
            } catch(err) {
              console.log(err)
            }
          })

          socket.on(Ws.roomName({ team, namespace: `scout:undo` }), async (data) => {
            try {
              await scoutSocket.handleEvent({
                data: {
                  event: 'scout:undo',
                  data: data,
                },
                context: {
                  user: socket.data.user
                }
              })
            } catch (err) {
              console.log(err)
            }
          })

          socket.on(Ws.roomName({ team, namespace: `scout:restart` }), async (data) => {
            try {
              await scoutSocket.handleEvent({
                data: {
                  event: 'scout:restart',
                  data: data,
                },
                context: {
                  user: socket.data.user
                }
              })
            } catch (err) {
              console.log(err)
            }
          })
        }

      })
    }

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
