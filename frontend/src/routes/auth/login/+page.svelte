<script lang="ts">
	import AuthService from '$lib/services/auth/auth.service'
	import { goto } from '$app/navigation'
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import LabelAndTextfield from '$lib/components/common/LabelAndTextfield.svelte'
	import { Checkbox, Icon } from '@likable-hair/svelte'
	import LabelAndCheckbox from '$lib/components/common/LabelAndCheckbox.svelte'
	import ConnectWallet from '$lib/components/wallet/ConnectWallet.svelte'
	import SolanaLogo from '$lib/components/wallet/SolanaLogo.svelte'
	import CredentialForm from '@/lib/components/auth/CredentialForm.svelte'
	import StandardTextfield from '@/lib/components/common/StandardTextfield.svelte'
	import StandardCheckbox from '@/lib/components/common/StandardCheckbox.svelte'

	let email: string = '',
		password: string = '',
		error: boolean = false,
		errorMessage: string | undefined = undefined,
		loading: boolean = false,
		generateRefreshToken: boolean = false,
		showPassword: boolean = false

	function login() {
		error = false
		errorMessage = undefined
		loading = true

		const service = new AuthService({ fetch })
		service
			.login({
				data: {
					email,
					password,
					generateRefreshToken
				}
			})
			.then(() => {
				setTimeout(() => {
					goto('/')
				}, 200)
			})
			.catch((err) => {
				if (!!err.message && err.message.includes('E_INVALID_AUTH_PASSWORD')) {
					errorMessage = 'Credenziali errate'
				} else if (!!err.message && err.message.includes('E_ROW_NOT_FOUND')) {
					errorMessage = "Sembra che l'utenta non esista"
				} else {
					errorMessage = 'Ops, qualcosa è andato storto'
				}

				error = true
			})
			.finally(() => {
				loading = false
			})
	}

	function loginWithGoogle() {
		const service = new AuthService({ fetch })
		service.loginWithGoogle()
	}

	function openWallet() {
		openConnectWallet = true
	}

	let openConnectWallet: boolean = false
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
			<div class="flex-grow sm:basis-1/2 h-full px-8 py-[20px]">
				<div class="h-full flex flex-col">
					<div class="flex justify-between">
						<div>LioNN</div>
						<div>@ en</div>
					</div>

					<!-- Credentials Box -->
					<div class="w-full flex-grow flex justify-center items-center">
						<div class="w-full flex flex-col items-center justify-center">
							<div class="text-2xl mb-5">Welcome to LiONN</div>

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
								<svelte:fragment slot="append-inner">
									<button on:click={() => (showPassword = !showPassword)}>
										<Icon name={showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'} />
									</button>
								</svelte:fragment>
							</StandardTextfield>

							<a class="mt-2 ml-auto text-xs tracking-tight" href="/"> Forgot password? </a>

							<!-- Next Button -->
							<div class="w-full mt-5">
								<StandardButton --button-border-radius="999px" --button-width="100%"
									>Login</StandardButton
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

							<div>
								<button
									on:click={loginWithGoogle}
									class="mt-2 mb-4 w-10 h-10 rounded-full bg-[rgb(var(--global-color-background-400))] hover:bg-[rgb(var(--global-color-background-500))] transition-all"
								>
									<Icon name="mdi-google" --icon-size="12pt" />
								</button>
							</div>
						</div>
					</div>
					<div
						class="mx-auto mt-5 pt-5 flex sm:flex-col md:flex-row items-center gap-2 sm:gap-0 md:gap-2 text-sm"
					>
						<div>Don't have an account?</div>
						<a class="text-[rgb(var(--global-color-primary-500))]" href="/"> Sign up </a>
					</div>
				</div>
			</div>

			<!-- Gradient Box -->
			<div class="gradient-box basis-0 sm:basis-1/2 hidden sm:block">
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
			max-width: 75vw;
			width: 75vw;
			height: 65vh;
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
