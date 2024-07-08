import { writable } from 'svelte/store'


let store = writable<PhantomProvider | null>(null)
export default store
