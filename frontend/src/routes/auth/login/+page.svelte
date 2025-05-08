<script lang="ts">
	import AuthService from '$lib/services/auth/auth.service'
	import { goto } from '$app/navigation'
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import { Icon } from '@likable-hair/svelte'
	import ConnectWallet from '$lib/components/wallet/ConnectWallet.svelte'
	import StandardTextfield from '@/lib/components/common/StandardTextfield.svelte'
	import { slide } from 'svelte/transition'
	import { onMount } from 'svelte'

	let email: string = $state(''),
		password: string = $state(''),
		error: boolean = $state(false),
		errorMessage: string | undefined = $state(undefined),
		loading: boolean = $state(false),
		generateRefreshToken: boolean = $state(false),
		showPassword: boolean = $state(false)

	function login() {
		if (!email || !password) {
			error = true
			errorMessage = 'Fill in all the required fields.'
			return
		}

		error = false
		errorMessage = undefined
		loading = true

		const service = new AuthService({ fetch })
		service
			.login({ data: { email, password, generateRefreshToken } })
			.then(() => setTimeout(() => goto('/'), 200))
			.catch((err) => {
				if (!!err.message && err.message.includes('E_INVALID_AUTH_PASSWORD')) {
					errorMessage = 'Wrong email or password.'
				} else if (!!err.message && err.message.includes('E_INVALID_AUTH_UID')) {
					errorMessage = "This user doesn't exists."
				} else {
					errorMessage = 'Ops, something went wrong.'
				}

				error = true
			})
			.finally(() => (loading = false))
	}

	function loginWithGoogle() {
		const service = new AuthService({ fetch })
		service.loginWithGoogle()
	}

	function openWallet() {
		openConnectWallet = true
	}

	let openConnectWallet: boolean = $state(false)

	onMount(() => {
		// Listening for enter events to login with email & password
		const handleEnterKeyPressed = (e: KeyboardEvent) => {
			if (e.key == 'Enter' && email && password) login()
		}

		addEventListener('keydown', handleEnterKeyPressed)
		return () => removeEventListener('keydown', handleEnterKeyPressed)
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
							<div class="text-2xl my-3">Welcome to LiONN</div>

							<div class="w-full mt-5">
								<StandardTextfield
									{error}
									type="text"
									bind:value={email}
									placeholder="Email"
									--simple-textfield-width="100%"
								/>

								<StandardTextfield
									{error}
									type={showPassword ? 'text' : 'password'}
									bind:value={password}
									placeholder="Password"
									--simple-textfield-width="100%"
								>
									{#snippet appendInner()}
										<button
											onclick={() => (showPassword = !showPassword)}
											class="flex items-center"
										>
											<Icon name={showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'} />
										</button>
									{/snippet}
								</StandardTextfield>
							</div>

							<div class="mt-2 flex items-center w-full text-xs">
								{#if error && errorMessage}
									<span
										transition:slide={{ axis: 'y' }}
										class="text-[rgb(var(--global-color-error-500))]">{errorMessage}</span
									>
								{/if}
								<a class="ml-auto tracking-tight" href="/"> Forgot password? </a>
							</div>

							<!-- Next Button -->
							<div class="w-full mt-5">
								<StandardButton
									on:click={login}
                  {loading}
									--button-border-radius="999px"
									--button-width="100%">Login</StandardButton
								>
							</div>

							<div class="w-full flex items-center gap-3 my-8">
								<div
									class="border-t border-[rgb(var(--global-color-background-400))] border-[1.3px] w-full"
								></div>
								<div class="flex-grow min-w-fit text-sm">or continue with</div>
								<div
									class="border-t border-[rgb(var(--global-color-background-400))] border-[1.3px] w-full"
								></div>
							</div>

							<div class="flex justify-center items-center gap-4 mb-4">
								<button
									class="w-10 h-10 rounded-full bg-[rgb(var(--global-color-background-400))] hover:bg-[rgb(var(--global-color-background-500))] transition-all"
									onclick={loginWithGoogle}
								>
									<Icon name="mdi-google" --icon-size="12pt" />
								</button>

								<button
									class="w-10 h-10 rounded-full bg-[rgb(var(--global-color-background-400))] hover:bg-[rgb(var(--global-color-background-500))] transition-all"
									onclick={openWallet}
								>
									<Icon name="mdi-wallet" --icon-size="12pt" />
								</button>
							</div>
						</div>
					</div>
					<div
						class="mx-auto flex sm:flex-col md:flex-row items-center gap-2 sm:gap-0 md:gap-2 text-sm"
					>
						<div>Don't have an account?</div>
						<a class="text-[rgb(var(--global-color-primary-500))]" href="/auth/signup"> Sign up </a>
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

<ConnectWallet bind:connectWalletDialog={openConnectWallet} />

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
