<script lang="ts">
	import StandardTextfield from '../common/StandardTextfield.svelte'

	export let user: string | undefined = undefined
	export let firstname: string | undefined = undefined
	export let lastname: string | undefined = undefined
	export let birthday: string | undefined = undefined
	export let error: boolean = false
	export let disabled: boolean = false
</script>

<div class="grid items-center justify-center">
	<div class="w-full pb-10">
		<div class="grid gap-y-4">
			<h1 class="text-xl">EFFETTUA LA TUA REGISTRAZIONE</h1>
			<p class="text-xs">Crea il tuo account con le tua credenziali</p>
		</div>
	</div>

	<div class="w-full grid gap-y-2 items-center justify-center">
		<StandardTextfield
			{error}
			valueRequired
			{disabled}
			type="text"
			bind:value={user}
			placeholder="utente"
		/>
		<StandardTextfield
			{error}
			valueRequired
			{disabled}
			type="text"
			bind:value={firstname}
			placeholder="nome"
		/>
	</div>
</div>
