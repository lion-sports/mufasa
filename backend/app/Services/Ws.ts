import { Server } from 'socket.io'
import AdonisServer from '@ioc:Adonis/Core/Server'
import Redis from '@ioc:Adonis/Addons/Redis'
import { createHash } from 'crypto'
import { base64 } from '@poppinss/utils/build/helpers'
import Database from '@ioc:Adonis/Lucid/Database';
import User from 'App/Models/User';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

class Ws {
  public io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, { user: User }>
  private booted = false

  public boot() {
    if (this.booted) {
      return
    }

    this.booted = true

    this.io = new Server(AdonisServer.instance!, {
      cors: {
        origin: '*',
      },
      transports: ['websocket'],
    })

    this.io.use(async (socket, next) => {
      let token: string | undefined = socket.handshake.auth.token
      if (!token) {
        next(new Error('token not present'))
        return
      }

      let parts = token.split('.')

      if (parts.length !== 2) {
        next(new Error('token not valid'))
        return
      }

      const tokenId = base64.urlDecode(parts[0], undefined, true)
      if (!tokenId) {
        next(new Error('token not valid'))
        return
      }

      if (parts[1].length !== 60) {
        next(new Error('token not valid'))
        return
      }

      let tokenValue: string = createHash('sha256').update(parts[1]).digest('hex')

      let tokenRow = await Database.query().from('api_tokens').where('id', tokenId).first()

      if (!tokenRow || tokenRow.token !== tokenValue) {
        next(new Error('not authorized'))
        return
      }

      socket.data = {
        ...(socket.data || {}),
        user: await User.query().where('id', tokenRow.userId).firstOrFail()
      }

      next()
    })

    Redis.subscribe('socket:emit', (data) => {
      let parsedData = JSON.parse(data)
      this.io.emit(parsedData.event, parsedData.data)
    })
  }

  emit(event: string, data: any) {
    Redis.publish(
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
