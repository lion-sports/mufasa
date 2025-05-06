<script lang="ts">
	import { run } from 'svelte/legacy'
	import { onMount } from 'svelte'
	import { writable } from 'svelte/store'
	import { PublicKey } from '@solana/web3.js'
	import StandardDialog from '../common/StandardDialog.svelte'
	import SolanaLogo from './SolanaLogo.svelte'
	import { goto } from '$app/navigation'
	import phantom from '$lib/stores/provider/phantom'
	import AuthService from '$lib/services/auth/auth.service'
	import StandardButton from '../common/StandardButton.svelte'

	interface Props {
		connectWalletDialog?: boolean
	}

	let { connectWalletDialog = $bindable(false) }: Props = $props()
	let error: boolean = $state(false),
		errorMessage: string | undefined = $state(undefined),
		generateRefreshToken: boolean = false

	const walletAvail = writable(false)

	const connected = writable(false)
	let currentPublicKey: string = $state('')

	onMount(() => {
		currentPublicKey = ''
		if (window?.solana?.isPhantom) {
			phantom.set(window.solana)
			walletAvail.set(true)
			window.solana.connect({ onlyIfTrusted: true })
		}
	})

	run(() => {
		if ($phantom) {
			$phantom.on('connect', (publicKey: PublicKey) => {
				connected.set(true)
				currentPublicKey = publicKey.toBase58()
			})
			$phantom.on('disconnect', () => {
				connected.set(false)
				currentPublicKey = ''
			})
		}
	})

	async function handleConnectPhantom() {
		const authService = new AuthService({ fetch })
		await authService.connectPhantom()
	}

	function loginOrSignup() {
		const service = new AuthService({ fetch })

		if (currentPublicKey) {
			service
				.login({
					data: {
						email: currentPublicKey + '@lion.it',
						password: currentPublicKey,
						generateRefreshToken
					}
				})
				.then(() => {
					setTimeout(() => {
						goto('/')
					}, 200)
				})
				.catch((err) => {
					signup()
				})
		}
	}

	function signup() {
		if (currentPublicKey) {
			const service = new AuthService({ fetch })
			service
				.signup({
					data: {
						email: currentPublicKey + '@lion.it',
						password: currentPublicKey,
						firstname: currentPublicKey,
						lastname: currentPublicKey,
						solanaPublicKey: currentPublicKey
					}
				})
				.then(() => {
					goto('/')
				})
				.catch((err) => {
					console.log(err)
					if (!!err.message && err.message.includes('E_INVALID_AUTH_PASSWORD')) {
						errorMessage = 'Credenziali errate'
					} else if (!!err.message && err.message.includes('E_ROW_NOT_FOUND')) {
						errorMessage = "Sembra che l'utenta non esista"
					} else {
						errorMessage = 'Ops, qualcosa è andato storto'
					}

					error = true
				})
		}
	}

	async function handleDisconnectPhantom() {
		const authService = new AuthService({ fetch })
		await authService.disconnectPhantom()
	}

	async function handleLoginMetamask() {
		const authService = new AuthService({ fetch })

		const { data } = await authService.loginWithMetamask()

		if (data.address) {
			connectWalletDialog = false
			currentPublicKey = data.address
		}
	}
</script>

<StandardDialog bind:open={connectWalletDialog}>
	<div class="w-full px-4 pt-2 gap-2" style="overflow:hidden">
		<div class="font-bold text-2xl">Connetti un Wallet</div>

		{#if $walletAvail}
			{#if $connected}
				<p>Your public key is</p>
				<p>{currentPublicKey}</p>
			{/if}
		{:else}
			<p>
				Oops!!! Phantom is not available. Go get it <a href="https://phantom.app/"
					>https://phantom.app/</a
				>.
			</p>
		{/if}

		<div class="w-full mt-10 flex justify-between">
			{#if $connected}
				<button disabled={!$connected} onclick={handleDisconnectPhantom}>Disconnect</button>
				<StandardButton disabled={!$connected} on:click={loginOrSignup}>Log In</StandardButton>
			{:else}
				<div
					style="border-radius: 999px; width: 100%; background-color: rgb(var(--global-color-contract-900));"
				>
					<div class="w-full px-4 py-1.5 flex items-center justify-between gap-2">
						<div class="rounded-full overflow-hidden">
							<SolanaLogo width="35px" height="auto" />
						</div>
						<StandardButton
							on:click={handleConnectPhantom}
							--button-background-color="rgb(var(--global-color-grey-950))"
							--button-height="35px"
							>Phantom
						</StandardButton>
					</div>
					<!-- <div class="flex items-center justify-between gap-2">
						<MetamaskLogo></MetamaskLogo>
						<StandardButton
							on:click={handleLoginMetamask}
							--button-background-color="rgb(var(--global-color-grey-950))">MetaMask</StandardButton
						>
					</div> -->
				</div>
			{/if}
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
		</div>
	</div>
</StandardDialog>

<style>
</style>
