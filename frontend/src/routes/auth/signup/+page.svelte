<script lang="ts">
	import AuthService, { type RegistrationStep } from '$lib/services/auth/auth.service'
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import type { Sport } from 'lionn-common'
	import UserCredentialsForm from '@/lib/components/auth/UserCredentialsForm.svelte'
	import { Icon } from '@likable-hair/svelte'
	import NewTeamForm from '@/lib/components/auth/NewTeamForm.svelte'
	import ConfirmForm from '@/lib/components/auth/ConfirmForm.svelte'
	import { goto } from '$app/navigation'
	import InviteEmailForm from '@/lib/components/auth/InviteEmailForm.svelte'
	import InviteTokenForm from '@/lib/components/auth/InviteTokenForm.svelte'
	import { SIGNUP_FORM_STEPS, SignupState } from '@/lib/services/auth/signup.svelte'

  let signupState = $state(new SignupState())

	// User Data
	let email: string = $state('')
	let password: string = $state('')
	let passwordConfirmation: string = $state('')
	let firstname: string = $state('')
	let lastname: string = $state('')
	let birthday: Date | undefined = $state(undefined)
	let acceptPrivacy: boolean = $state(false)

	// Collaborators Data
	let collaborators: string[] = $state([])
	let token: string = '#AABBCC' // Add a token generator

	// Team Data
	let sport: Sport | undefined = $state()
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

	let passValid = $derived(
		!!password && password.length > 6 && !!passwordConfirmation && password == passwordConfirmation
	)
	let disabled = $derived(
		!passValid || !lastname || !firstname || !email || !acceptPrivacy || !birthday
	)

	let teamDisabled = $derived(!name || !sport)

	let currStep: RegistrationStep = $state('credentials')

  function nextStep() {
    if(!signupState.currentStepValid) return

    let currentStepIndex = SIGNUP_FORM_STEPS.findIndex((e) => e == signupState.step)
    if(currentStepIndex !== -1 && currentStepIndex !== (SIGNUP_FORM_STEPS.length - 2)) {
      let nextStep = SIGNUP_FORM_STEPS[currentStepIndex + 1]
      signupState.step = nextStep
    }
  }
  
	function prevStep() {
		let currentStepIndex = SIGNUP_FORM_STEPS.findIndex((e) => e == signupState.step)

    if(currentStepIndex !== -1 && currentStepIndex >= 1) {
      signupState.step = SIGNUP_FORM_STEPS[currentStepIndex - 1]
    }
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
			<div class="flex-grow basis-3/5 xl:basis-1/2 h-full px-8 py-[20px]">
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
					<div class="w-full flex-grow flex justify-center items-center pt-8">
						<div class="h-full w-full flex flex-col items-center justify-start">
							<div class="w-full flex items-center justify-center relative">
								<div class="text-2xl">Sign Up</div>
							</div>

							<div class="flex-grow w-full flex flex-col items-center h-full">
								{#if signupState.step == 'credentials'}
                  <div class="mt-8">
                    <UserCredentialsForm
                      bind:signupState
                    />
                  </div>
								{:else if signupState.step == 'team'}
									<NewTeamForm bind:sport bind:name bind:notes bind:error />
								{:else if signupState.step == 'inviteEmail'}
									<!-- Optional -->
									<InviteEmailForm bind:collaborators />
								{:else if signupState.step == 'inviteToken'}
									<!-- Optional -->
									<InviteTokenForm {token} />
								{:else if signupState.step == 'review'}
									<ConfirmForm
										bind:step={currStep}
										teamName={name}
										{firstname}
										{lastname}
										{birthday}
										{email}
										{notes}
										{sport}
										{token}
									/>
								{:else}
									<div class="w-full text-center text-small my-5">
										Qualcosa è andato storto! Per favore ricarica la pagina.
									</div>
								{/if}
							</div>
						</div>
					</div>

					<!-- Action Button -->
					<div class="mb-6 w-full text-sm">
						<div class="flex items-center justify-between gap-10">
							{#if currStep == 'review'}
								<div class="w-full">
									<StandardButton
										on:click={signup}
										--button-border-radius="999px"
										--button-width="100%"
										class="!p-2">Signup</StandardButton
									>
								</div>
							{:else}
                <div>
                  {#if signupState.currentStepIndex > 0}
                    <button
                      onclick={prevStep}
                      class="py-1.5"
                    >
                      <div class="mx-auto w-fit flex items-center gap-1">
                        <Icon name="mdi-arrow-left" />
                        <span class="underline underline-offset-2">Back</span>
                      </div>
                    </button>
                  {/if}
                </div>

								<div class="flex justify-center items-center gap-1">
									{#each SIGNUP_FORM_STEPS as step}
										<div
											class="rounded-full {step == signupState.step
												? 'bg-[rgb(var(--global-color-primary-500))]'
												: 'bg-[rgb(var(--global-color-contrast-500))]'} h-[7px] w-[7px]"
										></div>
									{/each}
								</div>

                
								<button 
                  onclick={nextStep} 
                  class="p-1.5"
                  disabled={!signupState.currentStepValid && !signupState.currentStepSkippable}
                  style:opacity={!signupState.currentStepValid && !signupState.currentStepSkippable ? '50%' : undefined}
                >
									<div class="flex items-center gap-1">
										<span class="underline underline-offset-2"
											>{currStep.includes('invite') ? 'Next / Skip' : 'Next'}</span
										>
										<Icon name="mdi-arrow-right" />
									</div>
								</button>
							{/if}
						</div>
					</div>

					<div
						class="mx-auto flex sm:flex-col md:flex-row items-center gap-2 sm:gap-0 md:gap-2 text-sm"
					>
						<div>Hai già un account?</div>
						<a class="text-[rgb(var(--global-color-primary-500))]" href="/auth/login"> Login </a>
					</div>
				</div>
			</div>

			<!-- Gradient Box -->
			<div class="gradient-box basis-2/5 xl:basis-1/2 hidden lg:block">
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
			height: 75vh;
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
