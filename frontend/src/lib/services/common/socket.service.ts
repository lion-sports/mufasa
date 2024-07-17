import io, { Socket } from 'socket.io-client'
import UrlService from '$lib/services/common/urls.service'

export type CallbackFunction = ((data: any) => void) | ((data: any) => Promise<void>)

class SocketService {
  public io: Socket | undefined = undefined
  private callbacks: Record<string, CallbackFunction[]> = {}

  constructor() { }

  public async connect(params: { token: string }) {
    this.io = io(UrlService.socket, {
      auth: {
        token: params.token
      },
      transports: ['websocket']
    })

    for (const [eventName, callbacks] of Object.entries(this.callbacks)) {
      for (let i = 0; i < callbacks.length; i += 1) {
        this.io.on(eventName, callbacks[i])
      }
    }
  }

  public async disconnect() {
    if (!!this.io) {
      this.io.disconnect()
    }
  }

  public async on(eventName: string, callback: CallbackFunction) {
    if (!this.callbacks[eventName]) this.callbacks[eventName] = []

    this.callbacks[eventName].push(callback)
    this.io?.on(eventName, callback)
  }

  public async off(eventName: string, callback: CallbackFunction) {
    if (!this.callbacks[eventName]) this.callbacks[eventName] = []

    this.callbacks[eventName] = this.callbacks[eventName].filter((cb) => cb !== callback)
    this.io?.off(eventName, callback)
  }
}

export default new SocketService()
