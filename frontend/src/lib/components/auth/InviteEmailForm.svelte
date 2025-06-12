<script lang="ts">
	import StandardTextfield from '../common/StandardTextfield.svelte'
	import { SPORTS, type Sport } from 'lionn-common'
	import type { Option } from '../common/StandardSelect.svelte'
	import StandardButton from '../common/StandardButton.svelte'
	import { Icon } from '@likable-hair/svelte'
	import type { SignupState } from '@/lib/services/auth/signup.svelte'
	import { retry } from 'rxjs'

	interface Props {
		signupState: SignupState
	}

	let { signupState = $bindable() }: Props = $props()

	let currentEmail: string = $state('')

	function validateEmail(email: string) {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		return re.test(email)
	}

	function handleAddNewCollaborator() {
		if (!currentEmail || !validateEmail(currentEmail)) return
		if (!signupState.signup.collaborators) signupState.signup.collaborators = []
		if (!signupState.signup.collaborators.includes(currentEmail)) {
			signupState.signup.collaborators = signupState.signup.collaborators.concat(currentEmail)
			currentEmail = ''
		}
	}

	function handleDeleteCollaborator(email?: string) {
		if (!email) return
		if (!signupState.signup.collaborators) return

		signupState.signup.collaborators = signupState.signup.collaborators?.filter(
			(currentEmail) => currentEmail != email
		)
	}
</script>

<div class="w-full text-sm text-[rgb(var(--global-color-contrast-300))] mt-2 text-left">
	Si può invitare dei collaboratori tramite link email.
</div>
<div class="w-full h-full flex flex-col gap-2 mt-1">
	<div class="w-full mt-1 flex items-center gap-2">
		<div class="w-full">
			<StandardTextfield
				class={{ row: '!m-0 !p-0' }}
				type="text"
				bind:value={currentEmail}
				placeholder="example@mail.com"
				--simple-textfield-width="100%"
			/>
		</div>

		<button
			class="border border-[rgb(var(--global-color-background-500))] px-4 py-[7px] rounded-full hover:bg-[rgb(var(--global-color-background-500))]"
			onclick={handleAddNewCollaborator}>Aggiungi</button
		>
	</div>

	<div
		class="h-full w-full text-left rounded-xl bg-[rgb(var(--global-color-background-200))] min-h-10 max-h-52 md:max-h-64 xl:max-h-72 mb-5 overflow-scroll"
	>
		<div class="overflow-scroll">
			{#if signupState.signup.collaborators?.length}
				{#each signupState.signup.collaborators as email, i}
					<div
						class="w-full px-[16px] py-2.5 flex justify-between {i % 2 == 0
							? 'bg-[rgb(var(--global-color-background-300))] '
							: ''}"
					>
						<div>{email}</div>
						<div
							class="h-6 w-6 flex items-center justify-center hover:bg-[rgb(var(--global-color-foreground))]"
						>
							<button
								onclick={() => handleDeleteCollaborator(email)}
								class="py-1 px-2 rounded-full hover:bg-[rgb(var(--global-color-background-400))]"
							>
								<Icon name="mdi-delete" />
							</button>
						</div>
					</div>
				{/each}
			{:else}
				<div class="w-full px-[16px] py-2.5 flex justify-between opacity-30">
					<div>example@mail.com</div>
				</div>
			{/if}
		</div>
	</div>
</div>
