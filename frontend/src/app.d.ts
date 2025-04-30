import type { InteractivityProps } from '@threlte/extras'

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

  namespace Threlte {
    interface UserProps extends InteractivityProps { }
  }
}

export {}
