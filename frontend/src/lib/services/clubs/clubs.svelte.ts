import type { Club } from "./clubs.service";
import lodash from 'lodash'

export type ClubValidationData = {
  [Key in keyof Club]?: {
    error: boolean,
    message?: string
  }
}

export class ClubState {
  public club: Partial<Club> & {
    logo?: FileList
    header?: FileList
  } = $state({})

  constructor(params?: {
    club?: Partial<Club>
  }) {
    if(!!params?.club) {
      this.club = {
        ...params.club,
        logo: undefined,
        header: undefined
      }
    }
  }

  public validatedClub: Omit<Club, 'id' | 'ownerId' | 'owner' | 'createdAt' | 'updatedAt'> | undefined = $derived.by(() => {
    if(!!this.club.name && !!this.club.completeName) {
      return {
        name: this.club.name,
        completeName: this.club.completeName,
        ...this.club
      }
    } else return undefined
  })

  public validationData: ClubValidationData = $derived.by(() => {
    let validationData: ClubValidationData = {}

    if(!this.club.name) {
      validationData['name'] = {
        error: true,
        message: 'Nome del club è obbligatorio'
      }
    } else if (!/^[a-zA-Z0-9_.]+$/.test(this.club.name)) {
      validationData['name'] = {
        error: true,
        message: 'Il nome del club può contenere solo lettere, numeri, underscore e punti'
      }
    }

    if (!this.club.completeName) validationData['completeName'] = {
      error: true,
      message: 'Nome completo del club è obbligatorio'
    }
    return validationData
  })

  public isValid: boolean = $derived.by(() => {
    let valid = true
    for(const [key, value] of Object.entries(this.validationData)) {
      let validationDataKey = key as unknown as keyof Club
      if (this.validationData[validationDataKey]?.error) valid = false
    }
    return valid
  })
}