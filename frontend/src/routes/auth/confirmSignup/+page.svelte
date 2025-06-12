<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import { Icon } from '@likable-hair/svelte'
	import type { PageData } from './$types'
	import AuthService from '@/lib/services/auth/auth.service'
	import { addSuccessToast } from '@/lib/components/ui/sonner'

	interface Props {
		data: PageData
	}

	let { data }: Props = $props()

	let verificationSuccessful = $state(false)
	let isLoading = $state(true)

	onMount(async () => {
		if (data.token) {
			const service = new AuthService({ fetch })
			await service
				.verifySignup({ token: data.token })
				.then(() => {
					verificationSuccessful = true
					addSuccessToast({ title: 'Verifica avvenuta con successo' })
				})
				.catch(() => (verificationSuccessful = false))
				.finally(() => (isLoading = false))

			if (verificationSuccessful) goto('/auth/login')
		}
	})
</script>

<div
	class="h-screen w-full flex justify-center items-center flex-col"
	style:background-color="rgb(var(--global-color-background-200))"
>
	<div
		class="card rounded-[10px] box-border z-20 overflow-hidden"
		style:box-shadow="rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
		style:background-color="rgb(var(--global-color-background-100))"
	>
		<div class="login-box-container flex">
			<!-- Login Box -->
			<div class="flex-grow basis-3/5 xl:basis-1/2 h-full px-8 py-[20px]">
				<div class="h-full flex flex-col">
					<div class="flex justify-between">
						<div>LioNN</div>
						<div
							class="px-2.5 py-1 flex justify-center items-center gap-1.5 border border-[rgb(var(--global-color-background-400))] rounded-full"
						>
							<div class="w-3 h-3 flex justify-center items-center rounded-full overflow-hidden">
								<img width="12px" height="auto" src="/flag-uk.jpg" alt="uk-flag" />
							</div>
							<span class="text-xs"> EN </span>
						</div>
					</div>

					<!-- Credentials Box -->
					<div class="w-full flex-grow flex justify-center items-center">
						<div class="w-full flex flex-col items-center justify-center">
							<div class="text-2xl my-3">
								{#if isLoading}
									Verifica in corso...
								{:else if verificationSuccessful}
									<div class="flex items-center gap-2">
										<div
											class="text-white w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
										>
											<Icon name="mdi-check" />
										</div>
										Email Verificata!
									</div>
								{:else}
									Verifica Fallita!
								{/if}
							</div>

							<div class="w-full mt-5 text-center">
								{#if isLoading}
									<p>Attendi...</p>
								{:else if verificationSuccessful}
									<p>Reindirizzamento...</p>
								{:else}
									<p>
										Purtroppo c'è stato un errore durante la verifica di questa email. Per favore
										prova di nuovo.
									</p>
								{/if}
							</div>

							<!-- Next Button -->
							<div class="w-full mt-5">
								<StandardButton
									on:click={() => goto('/auth/login')}
									disabled={isLoading}
									--button-border-radius="999px"
									--button-width="100%"
								>
									{#if isLoading}
										<svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
											<circle
												class="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												stroke-width="4"
											></circle>
											<path
												class="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										Loading...
									{:else}
										Go to Login
									{/if}
								</StandardButton>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Gradient Box -->
			<div class="gradient-box basis-2/5 xl:basis-1/2 hidden lg:block">
				<div
					class="h-full px-8 py-[20px] flex flex-col items-end text-[rgb(var(--global-color-primary-foreground))]"
				>
					<div>Logo</div>
					<div class="flex-grow grid items-end">
						<div class="text-right text-3xl font-[300] tracking-wide">
							IL SUPPORTO TECNICO DI CUI HAI BISOGNO
						</div>
					</div>

					<div class="text-right mt-6">
						<div class="leading-tighter text-sm">Gestisci al meglio la tua squadra</div>
						<div class="leading-tighter text-sm">monitorandola in ogni suo aspetto.</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.gradient-box {
		background: linear-gradient(200deg, #3cb2ab 50%, rgb(var(--global-color-primary-500)) 90%);
		background-size: 100% 100%;
	}

	@media (min-width: 640px) {
		.login-box-container {
			max-width: 65vw;
			width: 65vw;
			height: 70vh;
		}
	}

	@media (max-width: 639.98px) {
		.login-box-container {
			width: 100vw;
			height: 100vh;
			border-radius: 0px;
			overflow: auto;
		}
	}

	/* .forgot-password {
    text-align: center;
    display: block;
    color: rgb(var(--global-color-primary-400));
  } */
</style>
