import Place from '#models/Place'
import FilterModifierApplier, { type Modifier } from '#app/Services/FilterModifierApplier'
import AuthorizationManager, { AuthorizationHelpers } from './authorization.manager.js'
import { Context, withTransaction, withUser } from './base.manager.js'
import User from '#models/User'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { ModelObject, type ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import Booking from '#models/Booking'
import { DateTime } from 'luxon'
import { requestBookingValidator } from '#validators/bookings/CreateBookingValidator'

export default class BookingsManager {
  @withTransaction
  @withUser
  public async list(params: {
    data: {
      page: number
      perPage: number
      filtersBuilder?: {
        modifiers: Modifier[]
      }
    }
    context?: Context
  }): Promise<{ data: ModelObject[]; meta: ModelPaginatorContract<Booking> }> {
    let user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    let query = Booking.query({ client: trx })

    if (!!params.data.filtersBuilder?.modifiers) {
      let filtersApplier = new FilterModifierApplier()
      filtersApplier.applyModifiers(query, params.data.filtersBuilder?.modifiers)
    }

    query = query.whereHas('place', b => {
      return AuthorizationHelpers.viewablePlacesQuery({
        data: {
          query: b,
          user,
        },
        context: params.context
      })
    })

    if (!params.data.page) params.data.page = 1
    if (!params.data.perPage) params.data.perPage = 100

    let results = await query.paginate(params.data.page, params.data.perPage)

    return results.toJSON()
  }

  @withTransaction
  @withUser
  public async request(params: {
    data: {
      placeId: number
      from: DateTime
      to: DateTime
    }
    context?: Context
  }): Promise<{
    booking: Booking
  }> {
    let user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    let validatedData = await requestBookingValidator.validate(params.data)

    let place = await Place.query({ client: trx })
      .where('id', validatedData.placeId)
      .firstOrFail()

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'booking_request',
        data: {
          club: { id: place.clubId }
        },
      },
      context: params.context
    })

    let booking = await Booking.create({
      placeId: place.id,
      createdByUserId: user.id,
      from: DateTime.fromJSDate(validatedData.from),
      to: DateTime.fromJSDate(validatedData.to),
      status: 'requested'
    })

    return {
      booking
    }
  }

  @withTransaction
  @withUser
  public async confirm(params: {
    data: {
      bookingId: number
    }
    context?: Context
  }): Promise<{
    booking: Booking
  }> {
    let user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    let booking = await Booking.query({ client: trx })
      .where('id', params.data.bookingId)
      .preload('place')
      .firstOrFail()

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'booking_confirm',
        data: {
          club: { id: booking.place.clubId }
        },
      },
      context: params.context
    })

    if(booking.status !== 'requested') throw new Error('can confirm only requested bookings')

    booking.status = 'confirmed'
    await booking.save()

    return {
      booking
    }
  }

  @withTransaction
  @withUser
  public async get(params: {
    data: {
      id: number
    }
    context?: Context
  }): Promise<Booking> {
    let user = params.context?.user as User
    let trx = params.context?.trx as TransactionClientContract

    let booking = await Booking.query({ client: trx })
      .where('id', params.data.id)
      .firstOrFail()

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'booking_view',
        data: {
          booking
        },
      },
      context: params.context
    })

    return booking
  }
}