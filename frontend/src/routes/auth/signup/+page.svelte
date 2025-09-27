<script lang="ts">
	import AuthService from '$lib/services/auth/auth.service'
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import UserCredentialsForm from '@/lib/components/auth/UserCredentialsForm.svelte'
	import { Icon } from '@likable-hair/svelte'
	import NewClubForm from '@/lib/components/auth/NewClubForm.svelte'
	import ConfirmForm from '@/lib/components/auth/ConfirmForm.svelte'
	import InviteEmailForm from '@/lib/components/auth/InviteEmailForm.svelte'
	import { FIELDS_FOR_STEPS, SignupState } from '@/lib/services/auth/signup.svelte'
	import { addErrorToast } from '@/lib/components/ui/sonner'
	import type { PageData } from './$types'
	import ConfirmEmailInfo from '@/lib/components/auth/ConfirmEmailInfo.svelte'

	interface Props {
		data: PageData
	}

	let { data }: Props = $props()

	// IF TOKEN IN URL, SIGN UP AS ATHLETE
	let signupState = $state(new SignupState({ token: data.token }))

	let signupLoading: boolean = $state(false)
	function signup() {
		signupLoading = true

		const service = new AuthService({ fetch })
		const signupData: any = {
			email: signupState.signup.email!,
			password: signupState.signup.password!,
			firstname: signupState.signup.firstname!,
			lastname: signupState.signup.lastname!,
			birthday: signupState.signup.birthday,
			invitationToken: data?.token
		}

		// Only include club data if it's provided
		if (signupState.signup.clubName && signupState.signup.clubCompleteName) {
			signupData.clubName = signupState.signup.clubName
			signupData.completeClubName = signupState.signup.clubCompleteName
			signupData.clubSport = signupState.signup.clubSport
			signupData.collaborators = signupState.signup.collaborators
		}

		service
			.signup({ data: signupData })
			.then(() => (signupState.step = 'confirmation'))
			.catch((err) =>
				addErrorToast({
					title: "Errore durante l'operazione",
					options: { description: err.message }
				})
			)
			.finally(() => (signupLoading = false))
	}

	function nextStep() {
		if (!signupState.currentStepValid) {
			signupState.dirtyFields = FIELDS_FOR_STEPS[signupState.step] || []
			return
		}

		let currentStepIndex = signupState.steps.findIndex((e) => e == signupState.step)
		if (currentStepIndex !== -1 && currentStepIndex !== signupState.steps.length - 1) {
			let nextStep = signupState.steps[currentStepIndex + 1]
			signupState.step = nextStep
		}
	}

	function prevStep() {
		let currentStepIndex = signupState.steps.findIndex((e) => e == signupState.step)

		if (currentStepIndex !== -1 && currentStepIndex >= 1) {
			signupState.step = signupState.steps[currentStepIndex - 1]
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
								{#if signupState.step != 'confirmation'}
									<div class="text-2xl">
										Sign Up -
										<span class="text-[rgb(var(--global-color-primary-600))] opacity-70 capitalize">
											{signupState.stepLabel || ''}
										</span>
									</div>
								{/if}
							</div>

							<div class="flex-grow w-full flex flex-col items-center h-full">
								{#if signupState.step == 'credentials'}
									<div class="mt-8">
										<UserCredentialsForm bind:signupState />
									</div>
								{:else if signupState.step == 'club'}
									<NewClubForm bind:signupState />
								{:else if signupState.step == 'inviteEmail'}
									<!-- Optional -->
									<InviteEmailForm bind:signupState />
								{:else if signupState.step == 'review'}
									<ConfirmForm bind:signupState />
								{:else if signupState.step == 'confirmation'}
									<ConfirmEmailInfo />
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
							{#if signupState.step == 'review'}
								<div class="w-full">
									<StandardButton
										on:click={signup}
										loading={signupLoading}
										disabled={signupLoading}
										--button-border-radius="999px"
										--button-width="100%"
										class="!p-2">Signup</StandardButton
									>
								</div>
							{:else if signupState.step != 'confirmation'}
								<div>
									{#if signupState.currentStepIndex > 0}
										<button onclick={prevStep} class="py-1.5">
											<div class="mx-auto w-fit flex items-center gap-1">
												<Icon name="mdi-arrow-left" />
												<span class="underline underline-offset-2">Back</span>
											</div>
										</button>
									{/if}
								</div>

								<div class="flex justify-center items-center gap-1">
									{#each signupState.steps as step}
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
									style:opacity={!signupState.currentStepValid && !signupState.currentStepSkippable
										? '50%'
										: undefined}
								>
									<div class="flex items-center gap-1">
										<span class="underline underline-offset-2"
											>{signupState.step.includes('invite') || signupState.step === 'club' ? 'Next / Skip' : 'Next'}</span
										>
										<Icon name="mdi-arrow-right" />
									</div>
								</button>
							{/if}
						</div>
					</div>

					{#if signupState.step == 'credentials'}
						<div
							class="mx-auto flex sm:flex-col md:flex-row items-center gap-2 sm:gap-0 md:gap-2 text-sm"
						>
							<div>Hai già un account?</div>
							<a class="text-[rgb(var(--global-color-primary-500))]" href="/auth/login"> Login </a>
						</div>
					{/if}
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
