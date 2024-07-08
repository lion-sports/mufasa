<script lang="ts">
	import { onMount } from 'svelte'
	import { writable } from 'svelte/store'
	import { PublicKey, Connection, clusterApiUrl } from '@solana/web3.js'
	import StandardDialog from '../common/StandardDialog.svelte'
	import { Button, Card } from '@likable-hair/svelte'
	import SolanaLogo from './SolanaLogo.svelte'
	import { goto } from '$app/navigation'
	import phantom from '$lib/stores/provider/phantom'

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

	const connectHandler = async () => {
		try {
			await $phantom?.connect()
		} catch (err) {
			console.error('connect ERROR:', err)
		}
	}

	const disconnectHandler = async () => {
		try {
			await $phantom?.disconnect()
		} catch (err) {
			console.error('disconnect ERROR:', err)
		}
	}
</script>

<StandardDialog bind:open={connectWalletDialog}>
	<div class="px-4 pt-2 gap-2" style="overflow:hidden">
		<div class="font-bold text-2xl">Connetti un Wallet</div>
		{#if $walletAvail}
			{#if $connected}
				<p>Your public key is: {$pubKey?.toBase58()}</p>
			{/if}
		{:else}
			<p>
				Oops!!! Phantom is not available. Go get it <a href="https://phantom.app/"
					>https://phantom.app/</a
				>.
			</p>
		{/if}

		<div class="w-full mt-10">
		<button disabled={!$connected} on:click={disconnectHandler}>Disconnect</button>

			<Card width="400px" --color="rgb(var(--global-color-contract-900))">
				<div class="flex items-center justify-between gap-2">
					<Button
						on:click={connectHandler}
						--button-background-color="rgb(var(--global-color-grey-950))">Phantom</Button
					>
					<SolanaLogo></SolanaLogo>
				</div>
			</Card>
		</div>
	</div>
</StandardDialog>

<style>
</style>
