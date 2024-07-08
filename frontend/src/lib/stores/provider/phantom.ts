import type { PhantomProvider } from '$lib/services/phantom/phantom.service'
import { writable } from 'svelte/store'

let store = writable<PhantomProvider | null>(null)
export default store
