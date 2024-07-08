<script lang="ts">
	import AuthService from '$lib/services/auth/auth.service'
	import { goto } from '$app/navigation'
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import LabelAndTextfield from '$lib/components/common/LabelAndTextfield.svelte'
	import { Icon } from '@likable-hair/svelte'
	import LabelAndCheckbox from '$lib/components/common/LabelAndCheckbox.svelte'
	import ConnectWallet from '$lib/components/wallet/ConnectWallet.svelte'
	import SolanaLogo from '$lib/components/wallet/SolanaLogo.svelte'

	let email: string = '',
		password: string = '',
		error: boolean = false,
		errorMessage: string | undefined = undefined,
		loading: boolean = false,
		generateRefreshToken: boolean = false

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

	function openWallet () {
		openConnectWallet = true;
	}

	let openConnectWallet: boolean = false;

</script>

<div class="card-container">
	<div class="card">
		<div class="text-2xl mb-2">Log in</div>
		<StandardButton style="secondary" on:click={loginWithGoogle} class="!w-full mt-2 mb-4">
			<Icon name="mdi-google" --icon-size="12pt" />
			<span style:margin-left="10px"> Log in with Google </span>
		</StandardButton>
		<StandardButton style="secondary" on:click={openWallet} class="!w-full mt-2 mb-4">
			<Icon name="mdi-wallet" --icon-size="12pt" />
			<span style:margin-left="10px"> Connect Wallet </span>
		</StandardButton>
		<hr />
		<form style:margin-top="20px">
			<div>
				<LabelAndTextfield
					label="Email o Username"
					placeholder="email o username"
					name="email"
					class={{
						label: 'box-border w-full',
						input: {
							container: '!box-border !w-full'
						}
					}}
					bind:value={email}
					{error}
				/>
			</div>
			<div style:margin-top="10px">
				<LabelAndTextfield
					label="Password"
					name="password"
					type="password"
					class={{
						label: 'box-border w-full',
						input: {
							container: '!box-border !w-full'
						}
					}}
					bind:value={password}
					{error}
				/>
			</div>
		</form>
		{#if error}
			<div
				style:margin-top="20px"
				style:margin-bottom="20px"
				style:text-align="center"
				style:color="rgb(var(--global-color-error-400))"
			>
				{errorMessage}
			</div>
		{/if}
		<div class="mt-4 mb-4">
			<LabelAndCheckbox label="Remember me" id="remember-me" bind:value={generateRefreshToken} />
		</div>
		<div style:margin-top="20px" style:margin-bottom="20px">
			<StandardButton on:click={login} {loading} --button-width="100%" class="mt-3"
				>Login</StandardButton
			>
		</div>
		<a href="/" class="forgot-password mb-4"> Forgot password? </a>
		<hr />
		<div class="text-center mt-4 mb-4">
			<span class="opacity-50"> Don't have an account? </span>
			<br />
			<a href="/auth/signup" style:color="rgb(var(--global-color-primary-400))">Sign up</a>
		</div>
	</div>
</div>

<ConnectWallet bind:connectWalletDialog={openConnectWallet}/>

<style>
	.card-container {
		height: 100vh;
		width: 100vw;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		background-color: rgb(var(--global-color-background-200));
	}

	.card {
		padding: 10px 20px 10px 20px;
		box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
		border-radius: 10px;
		box-sizing: border-box;
		z-index: 20;
		background-color: rgb(var(--global-color-background-100));
	}

	@media (min-width: 425px) {
		.card {
			max-width: 90vw;
			width: 300px;
		}
	}

	@media (max-width: 424.98px) {
		.card {
			width: 100vw;
			height: 100vh;
			border-radius: 0px;
			overflow: auto;
		}
	}

	.forgot-password {
		text-align: center;
		display: block;
		color: rgb(var(--global-color-primary-400));
	}
</style>
