<script lang="ts">
	import { onMount } from 'svelte'
	import type { PageData } from './$types'
	import AuthService from '$lib/services/auth/auth.service'
	import { goto, invalidateAll } from '$app/navigation'
	import user from '$lib/stores/auth/user'

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	onMount(async () => {
		// if (!!data.token && !!data.expiresAt) {
		//   let service = new AuthService({ fetch })
		//   await service.loginWithGoogleCallback({
		//     token: data.token,
		//     expiresAt: new Date(data.expiresAt),
		//     refreshTokenExpiresAt: !!data.refreshTokenExpiration ? new Date(data.refreshTokenExpiration) : undefined,
		//     refreshToken: data.refreshToken,
		//   })
		// }

		let service = new AuthService({ fetch })
		let fetchedUser = await service.me()
		$user = fetchedUser
		await invalidateAll()
		goto('/')
	})
</script>
