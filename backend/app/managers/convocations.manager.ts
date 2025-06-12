import Convocation from '#app/Models/Convocation'
import AuthorizationManager from './authorization.manager.js'
import { ConvocateValidator } from '#app/Validators/convocations/index'
import { validator } from "@adonisjs/validator"
import { DateTime } from 'luxon'
import { Context, withTransaction, withUser } from './base.manager.js'
import User from '#app/Models/User'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export type ConvocateParams = {
  data: {
    teammates: {
      id: number
    }[],
    event: {
      id: number
    },
    notes?: string
  },
  context?: Context
}

export type UnConvocateParams = {
  data: {
    teammates: {
      id: number
    }[],
    event: {
      id: number
    },
    notes?: string
  },
  context?: Context
}

export type ConfirmParams = {
  data: {
    teammate?: {
      id: number
    },
    event?: {
      id: number
    },
    convocation?: {
      id: number
    },
  },
  context?: Context
}

export default class ConvocationsManager {
  constructor() {
  }

  @withTransaction
  @withUser
  public async convocate(params: ConvocateParams): Promise<Convocation[]> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    try {
      await AuthorizationManager.canOrFail({
        data: {
          actor: user,
          ability: 'event_convocate',
          data: {
            event: {
              id: params.data.event.id
            }
          }
        },
        context: params.context
      })

      await validator.validate({
        schema: new ConvocateValidator().schema,
        data: params.data
      })

      let convocationToInsert: {
        teammateId: number,
        eventId: number,
        notes?: string,
        confirmationStatus: 'pending'
      }[] = []

      for(let i = 0; i < params.data.teammates.length; i+=1) {
        let existingConvocation = await Convocation.query({
          client: trx
        }).where('teammateId', params.data.teammates[i].id)
        .where('eventId', params.data.event.id)
        .first()

        if (!existingConvocation) {
          convocationToInsert.push({
            teammateId: params.data.teammates[i].id,
            eventId: params.data.event.id,
            notes: params.data.notes,
            confirmationStatus: 'pending'
          })
        }
      }

      let convocations = await Convocation.createMany(convocationToInsert, {
        client: trx
      })

      let results = await Convocation.query({
          client: trx
        }).whereIn('id', convocations.map(c => c.id))
        .preload('teammate', builder => {
          builder
            .preload('user')
            .preload('group')
        })

      if (!params.context?.trx) await trx.commit()
      return results
    } catch (error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  @withTransaction
  @withUser
  public async unConvocate(params: UnConvocateParams): Promise<Convocation[]> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'event_convocate',
        data: {
          event: {
            id: params.data.event.id
          }
        }
      },
      context: params.context
    })

    await validator.validate({
      schema: new ConvocateValidator().schema,
      data: params.data
    })

    let convocationsToDelete = await Convocation.query({
      client: trx
    }).where('eventId', params.data.event.id)
    .whereIn('teammateId', params.data.teammates.map(tm => tm.id))

    for(let i = 0; i < convocationsToDelete.length; i+=1) {
      await convocationsToDelete[i].delete()
    }

    let convocations = await Convocation.query({
      client: trx
    }).whereHas('event', builder => {
      builder.where('events.id', params.data.event.id)
    })

    return convocations
  }

  @withTransaction
  @withUser
  public async confirm(params: ConfirmParams): Promise<Convocation> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    if (!params.data.convocation && (!params.data.teammate || !params.data.event))
      throw new Error('convocation or teammate and event are not specified')

    let convocation: Convocation
    if(!!params.data.convocation) {
      convocation = await Convocation.query({
        client: trx
      })
      .where('id', params.data.convocation.id)
      .firstOrFail()
    } else if(!!params.data.teammate && !!params.data.event) {
      convocation = await Convocation.query({
          client: trx
        })
        .where('teammateId', params.data.teammate.id)
        .where('eventId', params.data.event.id)
        .firstOrFail()
    } else {
      throw new Error('params not specified')
    }

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'convocation_confirm',
        data: {
          convocation: convocation
        }
      },
      context: params.context
    })

    convocation.confirmationStatus = 'confirmed'
    convocation.confirmedByUserId = user.id
    convocation.updateConfirmationAt = DateTime.now()
    let results = await convocation.save()

    return results
  }

  @withTransaction
  @withUser
  public async deny(params: ConfirmParams): Promise<Convocation> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User 

    if (!params.data.convocation && (!params.data.teammate || !params.data.event))
      throw new Error('convocation or teammate and event are not specified')

    let convocation: Convocation
    if (!!params.data.convocation) {
      convocation = await Convocation.query({
          client: trx
        })
        .where('id', params.data.convocation.id)
        .firstOrFail()
    } else if (!!params.data.teammate && !!params.data.event) {
      convocation = await Convocation.query({
          client: trx
        })
        .where('teammateId', params.data.teammate.id)
        .where('eventId', params.data.event.id)
        .firstOrFail()
    } else {
      throw new Error('params not specified')
    }

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        ability: 'convocation_deny',
        data: {
          convocation: convocation
        }
      },
      context: params.context
    })

    convocation.confirmationStatus = 'denied'
    convocation.confirmedByUserId = user.id
    convocation.updateConfirmationAt = DateTime.now()
    return await convocation.save()
  }
}