<script lang="ts">
	import AuthService from '$lib/services/auth/auth.service'
	import { goto } from '$app/navigation'
	import StandardButton from '$lib/components/common/StandardButton.svelte'
	import LabelAndTextfield from '$lib/components/common/LabelAndTextfield.svelte'
	import LabelAndCheckbox from '$lib/components/common/LabelAndCheckbox.svelte'
	import LinkButton from '$lib/components/common/LinkButton.svelte'

	let email: string = $state(''),
		password: string = $state(''),
		passwordConfirmation: string = $state(''),
		firstname: string = $state(''),
		lastname: string = $state(''),
		userCreated: boolean = $state(false),
		userNotCreated: boolean = $state(false),
		acceptPrivacy: boolean = $state(false),
		loading: boolean = $state(false)

	function signup() {
		if (disabled) return
		loading = true

		const service = new AuthService({ fetch })
		service
			.signup({
				data: {
					email,
					password,
					firstname,
					lastname
				}
			})
			.then(() => {
				loading = false
				userCreated = true
			})
			.catch((error) => {
				loading = false
				userNotCreated = true
			})
	}

	let passValid = $derived(!!password && !!passwordConfirmation && password == passwordConfirmation)
	let disabled = $derived(!passValid || !lastname || !firstname || !email || !acceptPrivacy)
</script>

<div class="signup-form-container">
	<div class="card">
		<div class="text-2xl mb-2">Sign up</div>
		<hr />
		{#if userCreated}
			<div
				style:margin-top="20px"
				style:margin-bottom="20px"
				style:display="flex"
				style:align-items="center"
				style:flex-direction="column"
			>
				<div style:color="rgb(var(--global-color-contrast-500), .5)" style:margin-bottom="15px">
					L'utente è stato creato con successo, ora puoi eseguire il login.
				</div>
				<LinkButton href="/auth/Login">Log in</LinkButton>
			</div>
		{:else if userNotCreated}
			<div
				style:margin-top="20px"
				style:margin-bottom="20px"
				style:display="flex"
				style:align-items="center"
				style:flex-direction="column"
			>
				<div style:color="rgb(var(--global-color-contrast-500), .5)" style:margin-bottom="15px">
					Oops, qualcosa è andato storto
				</div>
			</div>
		{:else}
			<div>
				<form style:margin-top="20px">
					<div style:display="flex" style:gap="10px" style:width="100%">
						<div class="flex-grow">
							<LabelAndTextfield
								label="Nome"
								placeholder="Nome"
								name="firstname"
								bind:value={firstname}
								--simple-textfield-width="100%"
							/>
						</div>
						<div class="flex-grow">
							<LabelAndTextfield
								label="Cognome"
								placeholder="Cognome"
								name="lastname"
								bind:value={lastname}
								--simple-textfield-width="100%"
							/>
						</div>
					</div>
					<LabelAndTextfield
						label="Email"
						placeholder="email"
						name="email"
						bind:value={email}
						--simple-textfield-width="auto"
					/>
					<LabelAndTextfield
						label="Password"
						name="password"
						type="password"
						bind:value={password}
						error={!passValid && !!password && !!passwordConfirmation}
						--simple-textfield-width="auto"
					/>
					<LabelAndTextfield
						label="Conferma password"
						name="password-confirmation"
						type="password"
						bind:value={passwordConfirmation}
						error={!passValid && !!password && !!passwordConfirmation}
						--simple-textfield-width="auto"
					/>
					<div style:margin-top="10px">
						<LabelAndCheckbox
							bind:value={acceptPrivacy}
							id="accept-privacy"
							label="Accetto i termini della privacy"
						/>
					</div>
				</form>
				<div style:margin-top="20px" style:margin-bottom="20px">
					<StandardButton on:click={signup} {disabled} {loading} --button-width="100%"
						>Signup</StandardButton
					>
				</div>
				<hr />
				<div
					style:margin-top="20px"
					style:margin-bottom="20px"
					style:display="flex"
					style:align-items="center"
					style:flex-direction="column"
				>
					<div style:color="rgb(var(--global-color-contrast-500), .5)">
						Already have an account?
					</div>
					<a href="/auth/login" style:color="rgb(var(--global-color-primary-400))">Log in</a>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.signup-form-container {
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
		background-color: rgb(var(--global-color-background-100));
	}

	@media (min-width: 425px) {
		.card {
			max-width: 90vw;
			width: 500px;
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
</style>
