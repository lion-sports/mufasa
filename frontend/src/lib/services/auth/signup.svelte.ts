export type SignupData = {
  firstname: string
  lastname: string
  email: string
  password: string
  passwordConfirmation: string
  acceptTermsAndCondition: boolean
  birthday?: Date
}

export type SignupValidationData = {
  [Key in keyof SignupData]?: {
    error: boolean,
    message?: string
  }
}

export const SIGNUP_FORM_STEPS = ['credentials', 'team', 'inviteEmail', 'inviteToken', 'review'] as const
export type SignupFormStep = typeof SIGNUP_FORM_STEPS[number]

export const SIGNUP_FORM_SKIPPABLE_STEPS: SignupFormStep[] = ['team', 'inviteEmail', 'inviteToken', 'review']

export const FIELDS_FOR_STEPS: {
  [Key in SignupFormStep]?: (keyof SignupData)[]
} = {
  'credentials': [
    'firstname',
    'lastname',
    'email',
    'password',
    'passwordConfirmation',
    'acceptTermsAndCondition',
    'birthday'
  ]
}

export class SignupState {
  public signup: Partial<SignupData> = $state({})
  public step: SignupFormStep = $state('credentials')
  public dirtyFields: string[] = $state([])

  public validationData: SignupValidationData = $derived.by(() => {
    let validationData: SignupValidationData = {}

    if(!this.signup.firstname) validationData.firstname = {
      error: true,
      message: 'Il nome è obbligatorio'
    }

    if (!this.signup.lastname) validationData.lastname = {
      error: true,
      message: 'Il cognome è obbligatorio'
    }

    if (!this.signup.email) validationData.email = {
      error: true,
      message: 'L\'email è obbligatoria'
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
          message: 'La password deve contenere almeno una lettera maiuscola, un simbolo ed essere lunga almeno 16 caratteri'
        }
      }
    }

    if(!!this.signup.password && !!this.signup.passwordConfirmation && this.signup.passwordConfirmation !== this.signup.password) {
      validationData.passwordConfirmation = {
        error: true,
        message: 'Le password risultano essere diverse'
      }
    }

    if (!this.signup.acceptTermsAndCondition) validationData.acceptTermsAndCondition = {
      error: true,
      message: 'Devi accettare i termini e le condizioni per poter procedere'
    }

    return validationData
  })

  public dirtyValidationData: SignupValidationData = $derived.by(() => {
    let dirtyValidationData: SignupValidationData = {}

    for(const [key, value] of Object.entries(this.validationData)) {
      let field = key as keyof SignupData
      if(this.dirtyFields.includes(field)) {
        dirtyValidationData[field] = value
      }
    }

    return dirtyValidationData
  })

  public stepValid: {
    [Key in SignupFormStep]: boolean
  } = $derived.by(() => {
    let credentialsValid = true
    for(const [key, value] of Object.entries(this.validationData)) {
      let field = key as keyof SignupData
      if (FIELDS_FOR_STEPS.credentials?.includes(field)) {
        credentialsValid = credentialsValid && !this.validationData[field]?.error
      }
    }

    return {
      credentials: credentialsValid,
      team: true,
      inviteEmail: true,
      inviteToken: true,
      review: true
    }
  })

  public currentStepValid: boolean = $derived(this.stepValid[this.step])
  public currentStepSkippable: boolean = $derived(SIGNUP_FORM_SKIPPABLE_STEPS.includes(this.step))
  public currentStepIndex: number = $derived(SIGNUP_FORM_STEPS.findIndex(e => e === this.step))
}