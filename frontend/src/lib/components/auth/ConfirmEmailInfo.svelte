<script lang="ts">
	import StandardButton from '../common/StandardButton.svelte'
	import { Icon } from '@likable-hair/svelte'
	import { goto } from '$app/navigation'

	function handleGoToLogin() {
		goto('/auth/login')
	}
</script>

<div class="w-full h-full flex flex-col items-center justify-center">
	<div class="flex flex-col items-center justify-center gap-4">
		<div class="text-[var(--global-color-primary)]" style="font-size: 4rem;">
			<Icon name="mdi-email-check-outline" />
		</div>
		<h2 class="mt-2 text-xl font-semibold text-center text-[rgb(var(--global-color-contrast-300))]">
			Email di Conferma Inviata!
		</h2>
		<div class="w-full text-sm text-[rgb(var(--global-color-contrast-300))] mt-2 text-center">
			Abbiamo inviato un'email per confermare la tua registrazione. Controlla la tua casella di
			posta e fai clic sul link per attivare il tuo account.
		</div>

		<div class="mt-4">
			<StandardButton on:click={handleGoToLogin} --button-border-radius="999px">
				<span class="px-6"> Vai al Login </span>
			</StandardButton>
		</div>
	</div>
</div>
