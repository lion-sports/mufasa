import FipavBot from '#app/Telegram/fipav.bot'
import TelegramBot from 'node-telegram-bot-api'
import { ApplicationService } from "@adonisjs/core/types";
import scoutSocket from '#app/managers/scout/scouts.socket';
import { AuthorizationHelpers } from '#app/managers/authorization.manager';

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  public register() {
    // Register your own bindings
  }

  public async boot() {
    // IoC container is ready
    const { default: Env } = await import('#start/env')

    if(this.app.getEnvironment() == 'web') {
      const token = Env.get('TELEGRAM_FIPAV_BOT_TOKEN')
      const publicUrl = Env.get('PUBLIC_URL')
  
      if(!!publicUrl && !!token) {
        const { default: Route } = await import('@adonisjs/core/services/router')
  
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
    if (this.app.getEnvironment() === 'web' || this.app.getEnvironment() === 'test') {
      let { default: Ws } = await import('../app/Services/Ws.js')
      // let { default: scoutSocket } = await import('app/managers/scout/scouts.socket.js')
      // let { AuthorizationHelpers } = await import('app/managers/authorization.manager.js')

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
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
