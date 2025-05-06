<script lang="ts">
	import AuthService from '$lib/services/auth/auth.service'
	import { goto } from '$app/navigation'
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import type { Sport } from '@/lib/services/scouts/scouts.service'
	import UserCredentialsForm from '@/lib/components/auth/UserCredentialsForm.svelte'
	import { Icon } from '@likable-hair/svelte'
	import NewTeamForm from '@/lib/components/auth/NewTeamForm.svelte'

	// User Data
	let email: string = $state('')
	let password: string = $state('')
	let passwordConfirmation: string = $state('')
	let firstname: string = $state('')
	let lastname: string = $state('')
	let birthday: Date | undefined = $state()
	let acceptPrivacy: boolean = $state(false)

	// Team Data
	let sport: Sport | undefined = $state(undefined)
	let name: string = $state('')
	let notes: string = $state('')

	let loading: boolean = false
	let error: boolean = $state(false)
	let errorMessage: string = $state('')

	function signup() {
		if (password != passwordConfirmation) {
			error = true
			errorMessage = "Password doesn't match with confirmation."
			return
		}
		if (disabled) {
			error = true
			errorMessage = 'Some required fields are missing.'
			return
		}

		loading = true

		const service = new AuthService({ fetch })
		service
			.signup({ data: { email, password, firstname, lastname, birthday } })
			.then(() => goto('/auth/login'))
			.catch(() => {
				error = true
				errorMessage = 'Ops, something went wrong.'
			})
			.finally(() => (loading = false))
	}

	let passValid = $derived(!!password && !!passwordConfirmation && password == passwordConfirmation)
	let disabled = $derived(
		!passValid || !lastname || !firstname || !email || !acceptPrivacy || !birthday
	)

	type Step = 'userCredentials' | 'team' | 'review'
	let step: Step = $state('team')

	function nextStep() {
		if (step == 'userCredentials') step = 'team'
		else step = 'review'
	}

	function prevStep() {
		if (step == 'review') step = 'team'
		else step = 'userCredentials'
	}
</script>

<div
	class="h-screen w-full flex justify-center items-center flex-col"
	style:background-color="rgb(var(--global-color-background-200))"
>
	<div
		class="card rounded-[10px] box-border z-20 overflow-hidden"
		style:box-shadow="rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;"
		style:background-color="rgb(var(--global-color-background-100))"
	>
		<div class="login-box-container flex">
			<!-- Login Box -->
			<div class="flex-grow sm:basis-1/2 h-full px-8 py-[20px]">
				<div class="h-full flex flex-col">
					<div class="flex justify-between">
						<div>LioNN</div>
						<div
							class="px-2.5 py-1 flex justify-center items-center gap-1.5 border border-[rgb(var(--global-color-background-400))] rounded-full"
						>
							<div class="w-3 h-3 flex justify-center items-center rounded-full overflow-hidden">
								<img width="12px" height="auto" src="/flag-uk.jpg" alt="uk-flag" />
							</div>
							<span class="text-xs"> EN </span>
						</div>
					</div>

					<!-- Input Box -->
					<div class="w-full flex-grow flex justify-center items-center">
						<div class="w-full flex flex-col items-center justify-center">
							<div class="text-2xl">Sign Up</div>

							{#if step == 'userCredentials'}
								<UserCredentialsForm
									{disabled}
									{errorMessage}
									bind:firstname
									bind:lastname
									bind:birthday
									bind:email
									bind:error
									bind:password
									bind:passwordConfirmation
									bind:acceptPrivacy
								/>
							{:else if step == 'team'}
								<NewTeamForm bind:sport bind:name bind:notes bind:error />
							{:else if step == 'review'}
								<div class="h-full w-full">
									Review Data

									<div>
										User
										<div>firstname :{firstname}</div>
										<div>lastname :{lastname}</div>
										<div>birthday :{birthday?.toISOString()}</div>
										<div>email :{email}</div>
									</div>

									<div>
										Team {name}
										<div>sport : {sport}</div>
										<div>notes :{notes}</div>
									</div>
								</div>
							{:else}
								LOL?
							{/if}
						</div>
					</div>

					<!-- Action Button -->
					<div class="mb-6 w-full text-sm">
						<div class="flex items-center justify-between gap-10">
							{#if step == 'review'}
								<div class="w-full">
									<StandardButton
										on:click={signup}
										--button-border-radius="999px"
										--button-width="100%"
										class="!p-1.5">Signup</StandardButton
									>

									<div class="w-full mt-1">
										or <button onclick={prevStep}> go back</button>
									</div>
								</div>
							{:else}
								<button onclick={prevStep} class="py-1.5">
									<div class="mx-auto w-fit flex items-center gap-1">
										<Icon name="mdi-arrow-left" />
										<span class="underline underline-offset-2">Back</span>
									</div>
								</button>
								<button onclick={nextStep} class="!p-1.5">
									<div class="flex items-center gap-1">
										<span class="underline underline-offset-2">Next</span>
										<Icon name="mdi-arrow-right" />
									</div>
								</button>
							{/if}
						</div>
					</div>

					<div
						class="mx-auto flex sm:flex-col md:flex-row items-center gap-2 sm:gap-0 md:gap-2 text-sm"
					>
						<div>Already have an account?</div>
						<a class="text-[rgb(var(--global-color-primary-500))]" href="/auth/login"> Login </a>
					</div>
				</div>
			</div>

			<!-- Gradient Box -->
			<div class="gradient-box basis-0 sm:basis-1/2 hidden sm:block">
				<div
					class="h-full px-8 py-[20px] flex flex-col items-end text-[rgb(var(--global-color-primary-foreground))]"
				>
					<div>Logo</div>
					<div class="flex-grow grid items-end">
						<div class="text-right text-3xl font-[300] tracking-wide">
							IL SUPPORTO TECNICO DI CUI HAI BISOGNO
						</div>
					</div>

					<div class="text-right mt-6">
						<div class="leading-tighter text-sm">Gestisci al meglio la tua squadra</div>
						<div class="leading-tighter text-sm">monitorandola in ogni suo aspetto.</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* .card {
		padding: 10px 20px 10px 20px;
		box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
		border-radius: 10px;
		box-sizing: border-box;
		background-color: rgb(var(--global-color-background-100));
	} */

	.gradient-box {
		background: linear-gradient(200deg, #3cb2ab 50%, rgb(var(--global-color-primary-500)) 90%);
		background-size: 100% 100%;
	}

	@media (min-width: 640px) {
		.login-box-container {
			max-width: 65vw;
			width: 65vw;
			height: 70vh;
		}
	}

	@media (max-width: 639.98px) {
		.login-box-container {
			width: 100vw;
			height: 100vh;
			border-radius: 0px;
			overflow: auto;
		}
	}
</style>
