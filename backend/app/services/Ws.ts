import { Server } from 'socket.io'
import AdonisServer from '@ioc:Adonis/Core/Server'
import Redis from '@ioc:Adonis/Addons/Redis'

class Ws {
  public io: Server
  private booted = false

  public boot() {
    if (this.booted) {
      return
    }

    this.booted = true
    this.io = new Server(AdonisServer.instance!, {
      cors: {
        origin: '*'
      }
    })

    Redis.subscribe('socket:emit', (data) => {
      let parsedData = JSON.parse(data)
      this.io.emit(parsedData.event, parsedData.data)
    })
  }

  emit(event: string, data: any) {
    Redis.publish(`socket:emit`, JSON.stringify({
      event: event,
      data: data
    }))
  }
}

export default new Ws()
