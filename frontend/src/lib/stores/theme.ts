import { browser } from '$app/environment';
import { writable } from "svelte/store";

const store = writable<'light' | 'dark'>('light')
export default store

store.subscribe((theme) => {
  if(browser)
    document.body.setAttribute('data-theme', theme)
})