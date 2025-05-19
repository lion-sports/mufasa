import { HttpContext } from '@adonisjs/core/http'
import AuthorizationManager, { Action, Resource } from './authorization.manager.js'
import db from '@adonisjs/lucid/services/db'
import User from '#app/Models/User'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export type Context = {
  user?: User
  trx?: TransactionClientContract
}

function withUser(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  if (typeof descriptor.value != 'function')
    throw new Error('withUser decorator can only be used on functions')

  const originalMethod = descriptor.value as Function

  descriptor.value = async function (...args: any[]) {
    let user: User | undefined | null = null
    if (!!args[0]?.context?.user) {
      user = await User.query({ client: args[0]?.context.trx }).where('id', args[0].context.user.id).first()
    } else {
      const ctx = HttpContext.get()
      if (!!ctx?.auth?.user) {
        user = await User.query({ client: args[0]?.context.trx }).where('id', ctx?.auth?.user?.id).first()
      }
    }

    if (!user) throw new Error('user must be defined')
    return originalMethod.apply(this, [
      { ...args[0], context: { ...args[0].context, user: user } },
      ...args.slice(1),
    ])
  }
}

function withTransaction(_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  descriptor.value = async function (...args: any[]) {
    let trx = args[0]?.context?.trx
    if (!trx) trx = await db.transaction()

    try {
      let res = await originalMethod.apply(this, [
        {
          ...(!!args[0] ? args[0] : {}),
          context: { ...(!!args[0]?.context ? args[0].context : {}), trx: trx },
        },
        ...args.slice(1),
      ])

      if (!args[0]?.context?.trx) await trx?.commit()
      return res
    } catch (error) {
      if (!args[0]?.context?.trx) await trx?.rollback()
      throw error
    }
  }
}

function withAuth<R extends Resource>(resource: R, action: Action<R>, entities?: any) {
  function withAuthDecorator(_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    descriptor.value = async function (...args: any[]) {
      let user = args[0]?.context?.user
      if (!user) throw new Error('user must be defined')

      await AuthorizationManager.canOrFail({
        data: {
          actor: user,
          action: action,
          resource: resource,
          entities: entities,
        },
        context: {
          trx: args[0]?.context?.trx,
        },
      })

      return originalMethod.apply(this, args)
    }
  }

  return withAuthDecorator
}

export { withUser, withTransaction, withAuth }
