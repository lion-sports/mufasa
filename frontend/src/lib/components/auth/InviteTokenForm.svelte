<script lang="ts">
	import StandardTextfield from '../common/StandardTextfield.svelte'
	import { SPORTS, type Sport } from 'lionn-common'
	import type { Option } from '../common/StandardSelect.svelte'
	import StandardButton from '../common/StandardButton.svelte'
	import { Icon } from '@likable-hair/svelte'

	interface Props {
		error: boolean
		token: string
	}

	let { error = $bindable(false), token }: Props = $props()

	function handleTokenCopied() {
		navigator.clipboard.writeText(token)

		const tokenText = document.getElementById('token')
		if (!tokenText) return

		tokenText.textContent = 'Copied to clipboard!'
		tokenText.style.fontSize = '18px'

		setTimeout(() => {
			if (tokenText) {
				tokenText.textContent = token
				tokenText.style.fontSize = 'inherit'
			}
		}, 2500)
	}
</script>

<div class="w-full text-sm text-[rgb(var(--global-color-contrast-300))] mt-2 text-left">
	...oppure inviando un codice invito.
</div>
<div class="w-full h-full flex items-start gap-2 mt-2">
	<button
		onclick={handleTokenCopied}
		class="w-full text-center text-xl py-1 rounded-lg bg-[rgb(var(--global-color-background-200))]"
	>
		<span id="token"> {token}</span>
	</button>

	<div class="w-fit">
		<button
			onclick={handleTokenCopied}
			class="p-2 px-3 rounded-lg bg-[rgb(var(--global-color-background-200))] hover:bg-[rgb(var(--global-color-background-500))]"
		>
			<Icon name="mdi-clipboard-text-outline" />
		</button>
	</div>
</div>
