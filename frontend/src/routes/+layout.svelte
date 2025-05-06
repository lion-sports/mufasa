<script lang="ts">
	import { run } from 'svelte/legacy'

	import type { LayoutData } from './$types'
	import user from '$lib/stores/auth/user'
	import '../app.css'
	import NProgress from 'nprogress'
	import { navigating } from '$app/stores'
	import { Toaster } from '$lib/components/ui/sonner'

	/************************************
	 ***** NProgress for page loader *****
	 *************************************/

	// configuration docs: https://github.com/rstacruz/nprogress#configuration

	import 'nprogress/nprogress.css'

	NProgress.configure({
		minimum: 0.16,
		template: `<div class="bar" style="background-color: rgb(var(--global-color-primary-500)); height: 4px" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div style="border-top-color: #FFFFFF; border-left-color: #FFFFFF" class="spinner-icon"></div></div>`
	})

	run(() => {
		if ($navigating) {
			NProgress.start()
		}
		if (!$navigating) {
			NProgress.done()
		}
	})

	interface Props {
		/*************************************
		 ***** Loading current user store *****
		 **************************************/
		data: LayoutData
		children?: import('svelte').Snippet
	}

	let { data, children }: Props = $props()
	user.set(data.user)
</script>

<svelte:head>
	<title>Lion Sport</title>
</svelte:head>

<Toaster />

{@render children?.()}
