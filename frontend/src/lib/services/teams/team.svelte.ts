import type { Team } from "./teams.service";

export type TeamValidationData = {
  [Key in keyof Team]?: {
    error: boolean,
    message?: string
  }
}

export type TeamDisabledFields = {
  [Key in keyof Team]?: boolean
}

export type TeamHiddenFields = {
  [Key in keyof Team]?: boolean
}

export class TeamState {
  public team: Partial<Team> = $state({})
  public disabledFields: TeamDisabledFields = $state({})
  public hiddenFields: TeamHiddenFields = $state({})

  constructor(params?: {
    team?: Partial<Team>,
    disabledFields?: TeamDisabledFields
    hiddenFields?: TeamHiddenFields
  }) {
    this.team = params?.team || {}
    this.disabledFields = params?.disabledFields || {}
    this.hiddenFields = params?.hiddenFields || {}
  }

  public validatedTeam: Omit<Team, 'id' | 'ownerId' | 'owner' | 'createdAt' | 'updatedAt' | 'teammates'> | undefined = $derived.by(() => {
    if(!!this.team.name) {
      return {
        name: this.team.name,
        ...this.team
      }
    } else return undefined
  })

  public validationData: TeamValidationData = $derived.by(() => {
    let validationData: TeamValidationData = {}

    if(!this.team.name) {
      validationData['name'] = {
        error: true,
        message: 'Nome del team è obbligatorio'
      }
    }

    return validationData
  })

  public isValid: boolean = $derived.by(() => {
    let valid = true
    for(const [key, value] of Object.entries(this.validationData)) {
      let validationDataKey = key as unknown as keyof Team
      if (this.validationData[validationDataKey]?.error) valid = false
    }
    return valid
  })
}