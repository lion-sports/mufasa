<script lang="ts">
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import LabelAndTextfield from '$lib/components/common/LabelAndTextfield.svelte'
	import type { Reward } from '$lib/services/solana/solana.service'
	import SolanaService from '$lib/services/solana/solana.service'

	let solanaPublicKey: string = $state(''),
		loading: boolean = $state(false)

	function reward() {
		loading = true

		const service = new SolanaService({ fetch })

		let params: Reward = {
			solanaPublicKey: solanaPublicKey,
			amount: 10e6,
		}

		service
			.reward(params)
			.then(() => {
				loading = false
				alert('reward success')
			})
			.catch((err) => {
				loading = false

				throw new Error(err)
			})
	}
</script>

<div class="card-container">
	<div class="card">
		<div class="text-2xl mb-2">Reward Token Lion</div>
		<hr />
		<form style:margin-top="20px">
			<div>
				<LabelAndTextfield
					label="Wallet"
					placeholder="wallet address"
					name="email"
					class={{
						label: 'box-border w-full',
					}}
					bind:value={solanaPublicKey}
				/>
			</div>
		</form>
		<div style:margin-top="20px" style:margin-bottom="20px">
			<StandardButton on:click={reward} {loading} --button-width="100%" class="mt-3"
				>Get 10 Lion Token</StandardButton
			>
		</div>
	</div>
</div>

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
