import { type Place } from "./places.service"

export type PlaceValidationData = {
  [Key in keyof Place]?: {
    error: boolean,
    message?: string
  }
}

export class PlaceState {
  public place: Partial<Place> & {
    cover?: FileList
  } = $state({})

  constructor(params?: {
    place?: Partial<Place>
  }) {
    if(!!params?.place) {
      this.place = {
        ...params.place,
        cover: undefined
      }
    }
  }

  public validatedPlace: Omit<Place, 'id' | 'createdAt' | 'updatedAt'> | undefined = $derived.by(() => {
    if(!!this.place.name) {
      return {
        name: this.place.name,
        ...this.place
      }
    } else return undefined
  })

  public validationData: PlaceValidationData = $derived.by(() => {
    let validationData: PlaceValidationData = {}

    if(!this.place.name) {
      validationData['name'] = {
        error: true,
        message: 'Nome del campo o palestra è obbligatorio'
      }
    }

    return validationData
  })

  public isValid: boolean = $derived.by(() => {
    let valid = true
    for(const [key, value] of Object.entries(this.validationData)) {
      let validationDataKey = key as unknown as keyof Place
      if (this.validationData[validationDataKey]?.error) valid = false
    }
    return valid
  })
}