import { writable } from 'svelte/store'
import type { User } from '../../services/auth/auth.service'
import socketService from '$lib/services/common/socket.service'
import { browser } from '$app/environment'

let store = writable<User | undefined>(undefined)
export default store

store.subscribe(async (newUser) => {
  const { default: AuthService } = await import('$lib/services/auth/auth.service')

  if (browser) {
    if (!!newUser) {
      let service = new AuthService({ fetch })
      if (!!service.authToken) {
        socketService.connect({ token: service.authToken })
      }
    } else {
      socketService.disconnect()
    }
  }
})
