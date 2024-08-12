import { Server } from 'socket.io'
import { createAdapter } from "@socket.io/redis-adapter";
import AdonisServer from '@ioc:Adonis/Core/Server'
import { Redis } from "ioredis";
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

    const pubClient = new Redis();
    const subClient = pubClient.duplicate();

    this.io = new Server(AdonisServer.instance, {
      cors: {
        origin: '*',
      },
      transports: ['websocket'],
      adapter: createAdapter(pubClient, subClient)
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
  }

  emit(event: string, data: any) {
    this.io.emit(event, data)
  }

  public roomName(params: {
    team: { id: number },
    namespace?: string
  }): string {
    return `teams:${params.team.id}${!!params.namespace ? ':' + params.namespace : ''}`
  }
}

export default new Ws()
