import type { Sport } from 'lionn-common'

export type SignupData = {
	firstname: string
	lastname: string
	email: string
	password: string
	passwordConfirmation: string
	acceptTermsAndCondition: boolean
	birthday?: Date

	clubName?: string
	clubCompleteName?: string
	clubSport: Sport

	collaborators?: string[]
}

export type SignupValidationData = {
	[Key in keyof SignupData]?: {
		error: boolean
		message?: string
	}
}

export const SIGNUP_FORM_STEPS = [
	'credentials',
	'club',
	'inviteEmail',
	'review',
	'confirmation'
] as const

export const SIGNUP_FORM_STEPS_FOR_ATHLETE = ['credentials', 'review', 'confirmation'] as const

export const STEP_LABELS: {
	[key: string]: string
} = {
	credentials: 'Credenziali',
	club: 'Club',
	inviteEmail: 'Collaboratori',
	review: 'Review',
	confirmation: 'Conferma'
}

export type SignupFormStep = (typeof SIGNUP_FORM_STEPS)[number]

export const SIGNUP_FORM_SKIPPABLE_STEPS: SignupFormStep[] = ['inviteEmail', 'review']

export const FIELDS_FOR_STEPS: {
	[Key in SignupFormStep]?: (keyof SignupData)[]
} = {
	credentials: [
		'firstname',
		'lastname',
		'email',
		'password',
		'passwordConfirmation',
		'acceptTermsAndCondition',
		'birthday'
	],
	club: ['clubName', 'clubCompleteName', 'clubSport']
}

export class SignupState {
	public token?: string = $state()
	public signup: Partial<SignupData> = $state({})
	public step: SignupFormStep = $state('credentials')
	public dirtyFields: string[] = $state([])

	public isAthleteSignup: boolean = $derived(!!this.token)
	public steps = $derived(this.isAthleteSignup ? SIGNUP_FORM_STEPS_FOR_ATHLETE : SIGNUP_FORM_STEPS)

	public constructor(params: { token?: string }) {
		this.token = params.token
	}

	public validationData: SignupValidationData = $derived.by(() => {
		let validationData: SignupValidationData = {}

		if (!this.signup.firstname)
			validationData.firstname = {
				error: true,
				message: 'Il nome è obbligatorio'
			}

		if (!this.signup.lastname)
			validationData.lastname = {
				error: true,
				message: 'Il cognome è obbligatorio'
			}

		if (!this.signup.email)
			validationData.email = {
				error: true,
				message: "L'email è obbligatoria"
			}

		if (!this.signup.password) {
			validationData.password = {
				error: true,
				message: 'La password è obbligatoria'
			}
		} else {
			const password = this.signup.password
			const hasUppercase = /[A-Z]/.test(password)
			const hasSymbol = /[^A-Za-z0-9]/.test(password)
			const hasMinLength = password.length >= 16

			if (!hasUppercase || !hasSymbol || !hasMinLength) {
				validationData.password = {
					error: true,
					message:
						'La password deve contenere almeno una lettera maiuscola, un simbolo ed essere lunga almeno 16 caratteri'
				}
			}
		}

		if (
			!!this.signup.password &&
			!!this.signup.passwordConfirmation &&
			this.signup.passwordConfirmation !== this.signup.password
		) {
			validationData.passwordConfirmation = {
				error: true,
				message: 'Le password risultano essere diverse'
			}
		}

		if (!this.signup.acceptTermsAndCondition)
			validationData.acceptTermsAndCondition = {
				error: true,
				message: 'Devi accettare i termini e le condizioni per poter procedere'
			}

		if (!this.signup.clubName) {
			validationData.clubName = {
				error: true,
				message: 'Il nome è obbligatorio e deve essere univoco'
			}
		} else if (!/^[a-zA-Z0-9_.]+$/.test(this.signup.clubName)) {
			validationData.clubName = {
				error: true,
				message: 'Il nome del club può contenere solo lettere, numeri, underscore e punti'
			}
		}

		if (!this.signup.clubCompleteName)
			validationData.clubCompleteName = {
				error: true,
				message: 'Il nome completo è obbligatorio'
			}

		if (!this.signup.clubSport)
			validationData.clubSport = {
				error: true,
				message: 'Lo sport è obbligatorio'
			}

		return validationData
	})

	public dirtyValidationData: SignupValidationData = $derived.by(() => {
		let dirtyValidationData: SignupValidationData = {}

		for (const [key, value] of Object.entries(this.validationData)) {
			let field = key as keyof SignupData
			if (this.dirtyFields.includes(field)) {
				dirtyValidationData[field] = value
			}
		}

		return dirtyValidationData
	})

	public stepValid: {
		[Key in SignupFormStep]: boolean
	} = $derived.by(() => {
		let credentialsValid = true
		let clubDataValid = true
		for (const [key, value] of Object.entries(this.validationData)) {
			let field = key as keyof SignupData
			if (FIELDS_FOR_STEPS.credentials?.includes(field)) {
				credentialsValid = credentialsValid && !this.validationData[field]?.error
			}

			if (FIELDS_FOR_STEPS.club?.includes(field)) {
				clubDataValid = clubDataValid && !this.validationData[field]?.error
			}
		}

		return {
			credentials: credentialsValid,
			club: clubDataValid,
			inviteEmail: true,
			review: true,
			confirmation: true
		}
	})

	public stepLabel: string = $derived(STEP_LABELS[this.step])
	public currentStepValid: boolean = $derived(this.stepValid[this.step])
	public currentStepSkippable: boolean = $derived(SIGNUP_FORM_SKIPPABLE_STEPS.includes(this.step))
	public currentStepIndex: number = $derived(SIGNUP_FORM_STEPS.findIndex((e) => e === this.step))
}
