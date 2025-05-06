<script lang="ts">
	import AuthService from '$lib/services/auth/auth.service'
	import { goto } from '$app/navigation'
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import LabelAndTextfield from '$lib/components/common/LabelAndTextfield.svelte'
	import LabelAndCheckbox from '$lib/components/common/LabelAndCheckbox.svelte'
	import StandardTextfield from '@/lib/components/common/StandardTextfield.svelte'
	import { slide } from 'svelte/transition'
	import { Icon } from '@likable-hair/svelte'
	import StandardDatepicker from '@/lib/components/common/StandardDatepicker.svelte'
	import type { Sport } from '@/lib/services/scouts/scouts.service'

	// User Data
	let email: string = $state('')
	let password: string = $state('')
	let passwordConfirmation: string = $state('')
	let firstname: string = $state('')
	let lastname: string = $state('')
	let birthday: Date | undefined = $state()
	let acceptPrivacy: boolean = $state(false)

	// Team Data
	let sports: Sport | undefined = $state(undefined)
	let name: string = $state('')
	let notes: string = $state('')

	let loading: boolean = false
	let error: boolean = $state(false)
	let errorMessage: string = $state('')
	let showPassword: boolean = $state(false)
	let showPasswordConfirmation: boolean = $state(false)

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

					<!-- Credentials Box -->
					<div class="w-full flex-grow flex justify-center items-center">
						<div class="w-full flex flex-col items-center justify-center">
							<div class="text-2xl">Sign Up</div>

							<div class="w-full flex flex-col gap-1 mt-5">
								<div class="w-full flex gap-1.5">
									<div class="w-full">
										<LabelAndTextfield
											error={error && !firstname}
											placeholder="Firstname"
											name="firstname"
											bind:value={firstname}
											--simple-textfield-width="100%"
										/>
									</div>
									<div class="w-full">
										<LabelAndTextfield
											error={error && !lastname}
											placeholder="Lastname"
											name="lastname"
											bind:value={lastname}
											--simple-textfield-width="100%"
										/>
									</div>
								</div>

								<div
									class="h-fit mb-1 m-0 p-0 rounded-full"
									style:border={error ? '1px solid rgb(var(--global-color-error-500))' : ''}
								>
									<StandardDatepicker
										class={{
											textfield: {
												row: '!mb-0 !pb-0',
												field: 'flex items-center'
											}
										}}
										bind:value={birthday}
										placeholder="Birthday"
										--simple-textfield-height="40px"
										--simple-textfield-default-width="100%"
										--simple-textfield-max-width="100%"
										--simple-text-field-width="100%"
									/>
								</div>

								<StandardTextfield
									error={error && !email}
									type="text"
									bind:value={email}
									placeholder="Email"
									--simple-textfield-width="100%"
								/>

								<StandardTextfield
									error={error && (!password || password !== passwordConfirmation)}
									type={showPassword ? 'text' : 'password'}
									bind:value={password}
									placeholder="Password"
									--simple-textfield-width="100%"
								>
									{#snippet appendInner()}
										<button
											onclick={() => (showPassword = !showPassword)}
											class="flex items-center"
										>
											<Icon name={showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'} />
										</button>
									{/snippet}
								</StandardTextfield>

								<StandardTextfield
									error={error && (!passwordConfirmation || password !== passwordConfirmation)}
									type={showPasswordConfirmation ? 'text' : 'password'}
									bind:value={passwordConfirmation}
									placeholder="Confirm Password"
									--simple-textfield-width="100%"
								>
									{#snippet appendInner()}
										<button
											onclick={() => (showPasswordConfirmation = !showPasswordConfirmation)}
											class="flex items-center"
										>
											<Icon
												name={showPasswordConfirmation ? 'mdi-eye-off-outline' : 'mdi-eye-outline'}
											/>
										</button>
									{/snippet}
								</StandardTextfield>
							</div>

							<div class="mb-2 flex items-center w-full text-xs">
								{#if error && errorMessage}
									<span
										transition:slide={{ axis: 'y' }}
										class="text-[rgb(var(--global-color-error-500))]">{errorMessage}</span
									>
								{/if}
							</div>

							<div class="w-full mt-1 text-xs">
								<LabelAndCheckbox
									bind:value={acceptPrivacy}
									id="accept-privacy"
									label="I accept all privacy terms and conditions"
								/>
							</div>

							<!-- Next Button -->
							<div class="w-full mt-5">
								<StandardButton
									on:click={signup}
									--button-border-radius="999px"
									--button-width="100%">Signup</StandardButton
								>
							</div>
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
