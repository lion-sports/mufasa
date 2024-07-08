<script lang="ts">
	import { Button, Card, Icon } from '@likable-hair/svelte';
	import StandardDialog from '../common/StandardDialog.svelte';
	import AuthService from '$lib/services/auth/auth.service';
	import metamaskLogo from '$lib/assets/metamask.svg';
	import { createEventDispatcher } from 'svelte';
	import MetamaskLogo from './MetamaskLogo.svelte';

	const authService = new AuthService({ fetch });

	export let connectWalletDialog: boolean = false,
		walletAddress: string = '';

	let dispatch = createEventDispatcher<{
		connected: { address: string };
	}>();

	async function handleLoginMetamask() {
		const { data } = await authService.loginWithMetamask();

		if (data.address) {
			connectWalletDialog = false;
			walletAddress = data.address;
		}

		dispatch('connected', { address: data.address });
	}
</script>

<StandardDialog bind:open={connectWalletDialog}>
	<div class="px-4 pt-2 gap-2" style="overflow:hidden">
		<div class="font-bold text-2xl">Connetti un Wallet</div>
		<div class="text-xs">
			Procedi connettendo un wallet per scoprire le funzionalità della blockchain!
		</div>
		<div class="mt-10 text-s">
			Storicizza il contenuto dei tuoi documenti in modo sicuro e crittografato. Prova <strong
				>Hive Store</strong
			> on chain!
		</div>

		{#if !!walletAddress && walletAddress != ''}
			<div class="text-xs">{walletAddress}</div>
		{/if}
		<div class="w-full mt-10">
			<Card width="400px" --color="rgb(var(--global-color-contract-900))">
				<div class="flex items-center justify-between gap-2">
					<Button
						on:click={handleLoginMetamask}
						--button-background-color="rgb(var(--global-color-grey-950))">MetaMask</Button
					>
					<MetamaskLogo></MetamaskLogo>
				</div>
			</Card>
		</div>
	</div>
</StandardDialog>
