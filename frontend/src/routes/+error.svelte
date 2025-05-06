<script lang="ts">
	import { Icon } from '@likable-hair/svelte'
	import { page } from '$app/stores'
	import '../app.css'

	let mapper: Record<number, string> = {
		404: "We have not found what you're looking for 😥",
		401: "you don't have permissions to access this page",
		500: 'Something went wrong'
	}

	let message = $derived(mapper[$page.status])
</script>

<div
	style:height="100vh"
	style:width="100vw"
	style:display="flex"
	style:flex-direction="column"
	style:align-items="center"
	style:justify-content="center"
>
	<div class="status">{$page.status}</div>
	<div class="message">{message}</div>
	{#if $page.error?.message}
		<div class="text-small mb-4">{$page.error?.message}</div>
	{/if}
	<div>
		<a href="/">
			<span style:font-size="1.5rem" style:color="rgb(var(--global-color-light-primary-300))"
				>Home</span
			>
		</a>
	</div>
</div>

<style>
	:global(body) {
		background-color: rgb(var(--global-color-background-100));
	}

	.status {
		font-weight: 700;
		font-size: 6rem;
		margin-bottom: 5vh;
		color: rgb(var(--global-color-light-primary-600));
	}

	.message {
		font-size: 1.5rem;
		margin-bottom: 2vh;
	}

	/* :global(body) {
		margin: 0px;
	}

	:global(html) {
		background-color: var(--global-background-color) !important;
	}

	:global(html),
	:global(body) {
		height: 100%;
	} */

	:global(input:-webkit-autofill),
	:global(input:-webkit-autofill:hover),
	:global(input:-webkit-autofill:focus),
	:global(input:-webkit-autofill:active) {
		-webkit-box-shadow: 0 0 0 30px var(--global-color-background-100) inset !important;
	}

	:global(input:-webkit-autofill) {
		-webkit-text-fill-color: rgb(var(--global-color-contrast-900)) !important;
	}
</style>
