import type { Booking } from "./bookings.service"

export type BookingValidationData = {
  [Key in keyof Booking]?: {
    error: boolean,
    message?: string
  }
}

export class BookingState {
  public booking: Partial<Booking> & {
    cover?: FileList
  } = $state({})

  constructor(params?: {
    booking?: Partial<Booking>
  }) {
    if(!!params?.booking) {
      this.booking = {
        ...params.booking,
        cover: undefined
      }
    }
  }

  public validatedBooking: Omit<Booking, 'id' | 'status' | 'place' | 'createdByUserId' | 'createdByUser' | 'createdAt' | 'updatedAt'> | undefined = $derived.by(() => {
    if(!!this.booking.from && !!this.booking.to && !!this.booking.placeId) {
      return {
        ...this.booking,
        from: this.booking.from,
        to: this.booking.to,
        placeId: this.booking.placeId,
        notes: this.booking.notes
      }
    } else return undefined
  })

  public validationData: BookingValidationData = $derived.by(() => {
    let validationData: BookingValidationData = {}

    if(!this.booking.from) {
      validationData['from'] = {
        error: true,
        message: 'Data di inizio della prenotazione è obbligatoria'
      }
    }

    if (!this.booking.to) {
      validationData['to'] = {
        error: true,
        message: 'Data di fine della prenotazione è obbligatoria'
      }
    }

    if (!this.booking.placeId) {
      validationData['placeId'] = {
        error: true,
        message: 'Luogo è obbligatorio'
      }
    }

    return validationData
  })

  public isValid: boolean = $derived.by(() => {
    let valid = true
    for(const [key, value] of Object.entries(this.validationData)) {
      let validationDataKey = key as unknown as keyof Booking
      if (this.validationData[validationDataKey]?.error) valid = false
    }
    return valid
  })
}