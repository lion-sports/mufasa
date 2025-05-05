import { writable } from 'svelte/store'
import type { User } from '../../services/auth/auth.service'
import socketService from '$lib/services/common/socket.service'
import { browser } from '$app/environment'
import AuthService from '../../services/auth/auth.service'

let store = writable<User | undefined>(undefined)
export default store

store.subscribe(async (newUser) => {
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
