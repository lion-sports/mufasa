import mail from '@adonisjs/mail/services/main'
import { CreateUserValidator, UpdateUserValidator } from '#app/Validators/users/index'
import { validator } from '@adonisjs/validator'
import User from '#app/Models/User'
import { Context, withTransaction, withUser } from './base.manager.js'
import SolanaManager from './solana.manager.js'
import { ModelObject } from '@adonisjs/lucid/types/model'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import FilterModifierApplier, { Modifier } from '#services/FilterModifierApplier'
import ConfirmationNotification from '#app/mails/ConfirmationNotification'

// TODO add authorization manager
class UsersManager {
  constructor() {}

  @withTransaction
  @withUser
  public async list(params: {
    data: {
      page?: number
      perPage?: number
      filtersBuilder?: {
        modifiers: Modifier[]
      }
    }
    context?: Context
  }): Promise<{ data: ModelObject[]; meta: any }> {
    const trx = params.context?.trx as TransactionClientContract

    if (!params.data.page) params.data.page = 1
    if (!params.data.perPage) params.data.perPage = 100

    let query = User.query({ client: trx })

    if (!!params.data.filtersBuilder?.modifiers) {
      let filtersApplier = new FilterModifierApplier()
      filtersApplier.applyModifiers(query, params.data.filtersBuilder?.modifiers)
    }

    const results = await query.paginate(params.data.page, params.data.perPage)
    return results.toJSON()
  }

  @withTransaction
  public async create(params: {
    data: {
      email: string
      password: string
      firstname: string
      lastname: string
      birthday: DateTime
      solanaPublicKey?: string
    }
    context?: Context
  }): Promise<User> {
    const trx = params.context?.trx as TransactionClientContract

    await validator.validate({
      schema: new CreateUserValidator().schema,
      data: params.data,
    })

    let userCreated = await User.firstOrCreate(
      {
        email: params.data.email,
      },
      {
        ...params.data,
        name: params.data.firstname + ' ' + params.data.lastname,
      },
      {
        client: trx,
      }
    )
    const manager = new SolanaManager()
    if (!userCreated.solanaPublicKey) {
      await manager.keygen({ data: { userId: userCreated.id }, context: params.context })
    }

    // TODO send confirmation email
    await this.sendConfirmationEmail({
      data: { user: userCreated },
      context: { trx },
    })

    return userCreated
  }

  public async get(params: {
    data: {
      id: number
      username?: string
    }
    context?: Context
  }): Promise<User | null> {
    const trx = params.context?.trx as TransactionClientContract

    let userByUsername: User
    if (!!params.data.username) {
      userByUsername = await User.query({ client: trx })
        .where('username', params.data.username)
        .firstOrFail()
      return userByUsername
    }

    return await User.find(params.data.id, { client: trx })
  }

  @withTransaction
  @withUser
  public async update(params: {
    data: {
      id?: number
      email?: string
      password?: string
      firstname?: string
      birthday?: DateTime
      lastname?: string
    }
    context?: Context
  }): Promise<User> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    const id = params.data.id
    delete params.data.id

    if (id != user.id) throw new Error('cannot update the user')

    await validator.validate({
      schema: new UpdateUserValidator().schema,
      data: params.data,
    })

    let updatedUser = await User.findOrFail(id, { client: trx })
    updatedUser.merge({
      email: params.data.email,
      password: params.data.password,
    })
    return await updatedUser.save()
  }

  @withTransaction
  public async sendConfirmationEmail(params: {
    data: {
      user: {
        id: number
      }
    }
    context?: Context
  }): Promise<void> {
    const trx = params.context?.trx
    if (!params.data.user.id) throw new Error('No user id supplied')

    const user = await User.query({ client: trx }).where('id', params.data.user.id).firstOrFail()

    // TODO: generate a token to validate request

    const email = new ConfirmationNotification({ user })
    await mail.sendLater(email)
  }
}

export default UsersManager
