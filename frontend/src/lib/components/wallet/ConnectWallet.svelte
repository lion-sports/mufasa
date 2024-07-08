<script lang="ts">
	import { onMount } from 'svelte'
	import { writable } from 'svelte/store'
	import { PublicKey, Connection, clusterApiUrl } from '@solana/web3.js'
	import StandardDialog from '../common/StandardDialog.svelte'
	import { Button, Card } from '@likable-hair/svelte'
	import SolanaLogo from './SolanaLogo.svelte'
	import { goto } from '$app/navigation'
	import phantom from '$lib/stores/provider/phantom'
	import MetamaskLogo from './MetamaskLogo.svelte'
	import AuthService from '$lib/services/auth/auth.service'
	import StandardButton from '../common/StandardButton.svelte'

	export let connectWalletDialog: boolean = false

	const walletAvail = writable(false)

	const connected = writable(false)
	const pubKey = writable<PublicKey | null>(null)

	onMount(() => {
		if (window?.solana?.isPhantom) {
			phantom.set(window.solana)
			walletAvail.set(true)
			window.solana.connect({ onlyIfTrusted: true })
		}
	})

	$: if ($phantom) {
		$phantom.on('connect', (publicKey: PublicKey) => {
			connected.set(true)
			pubKey.set(publicKey)
		})
		$phantom.on('disconnect', () => {
			connected.set(false)
			pubKey.set(null)
		})
	}

	async function handleConnectPhantom() {
		const authService = new AuthService({ fetch })
		await authService.connectPhantom()
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
			pubKey.set(data.address)
		}
	}
	
</script>

<StandardDialog bind:open={connectWalletDialog}>
	<div class="px-4 pt-2 gap-2" style="overflow:hidden">
		<div class="font-bold text-2xl">Connetti un Wallet</div>
		{#if $walletAvail}
			{#if $connected}
				<p>Your public key is</p>
				<p>{$pubKey?.toBase58()}</p>
			{/if}
		{:else}
			<p>
				Oops!!! Phantom is not available. Go get it <a href="https://phantom.app/"
					>https://phantom.app/</a
				>.
			</p>
		{/if}

		<div class="w-full mt-10">
			{#if $connected}
				<button disabled={!$connected} on:click={handleDisconnectPhantom}>Disconnect</button>
			{:else}
				<Card width="400px" --color="rgb(var(--global-color-contract-900))">
					<div class="flex items-center justify-between gap-2">
						<SolanaLogo></SolanaLogo>
						<StandardButton
							on:click={handleConnectPhantom}
							--button-background-color="rgb(var(--global-color-grey-950))">Phantom</StandardButton
						>
					</div>
					<!-- <div class="flex items-center justify-between gap-2">
						<MetamaskLogo></MetamaskLogo>
						<StandardButton
							on:click={handleLoginMetamask}
							--button-background-color="rgb(var(--global-color-grey-950))">MetaMask</StandardButton
						>
					</div> -->
				</Card>
			{/if}
		</div>
	</div>
</StandardDialog>

<style>
</style>
