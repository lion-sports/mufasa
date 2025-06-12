import { Server } from 'socket.io'
import server from '@adonisjs/core/services/server'
import redis from '@adonisjs/redis/services/main'
import { Secret } from '@adonisjs/core/helpers'
import User from '#app/Models/User';
import { DefaultEventsMap } from 'node_modules/socket.io/dist/typed-events.js'
import db from '@adonisjs/lucid/services/db';

class Ws {
  public io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, { user: User }>
  private booted = false

  public boot() {
    if (this.booted) {
      return
    }

    this.booted = true

    this.io = new Server(server.getNodeServer(), {
      cors: {
        origin: '*',
      },
      transports: ['websocket'],
    })

    this.io.use(async (socket, next) => {
      let token: string | undefined = socket.handshake.auth.token
      if(!token) {
        next(new Error('token not present'))
        return
      }
      
      let accessToken = await User.accessTokens.verify(new Secret(token))
      if(!accessToken) {
        next(new Error('token not present'))
        return
      }

      const users = await db.query()
        .from('users')
        .whereIn('id', b => {
          b
            .select('tokenable_id')
            .from('auth_access_tokens')
            .where('id', accessToken.identifier.toString())
        })

      if (users.length == 0) {
        next(new Error('user not found'))
        return
      }

      socket.data = {
        ...(socket.data || {}),
        user: await User.query().where('id', users[0].id).firstOrFail()
      }

      next()
    })

    redis.subscribe('socket:emit', (data) => {
      let parsedData = JSON.parse(data)
      this.io.emit(parsedData.event, parsedData.data)
    })
  }

  emit(event: string, data: any) {
    redis.publish(
      `socket:emit`,
      JSON.stringify({
        event: event,
        data: data,
      })
    )
  }

  public roomName(params: {
    team: { id: number },
    namespace?: string
  }): string {
    return `teams:${params.team.id}${!!params.namespace ? ':' + params.namespace : ''}`
  }
}

export default new Ws()



