import { CreateUserValidator, UpdateUserValidator } from '#app/Validators/users/index'
import { validator } from '@adonisjs/validator'
import User from '#app/Models/User'
import { Context, withTransaction, withUser } from './base.manager.js'
import SolanaManager from './solana.manager.js'
import { ModelObject } from '@adonisjs/lucid/types/model'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'

export type CreateParams = {
  data: {
    email: string
    password: string
    firstname: string
    lastname: string
    birthday: DateTime
    solanaPublicKey?: string
  }
  context?: Context
}

export type UpdateParams = {
  data: {
    id?: number
    email?: string
    password?: string
    firstname?: string
    birthday?: DateTime
    lastname?: string
  }
  context?: Context
}

export type ListParams = {
  data: {
    page?: number
    perPage?: number
    filters?: {
      email?: string
    }
  }
  context?: Context
}

export type GetParams = {
  data: {
    id: number
    username?: string
  }
  context?: Context
}

// TODO add authorization manager
class UsersManager {
  constructor() {}

  @withTransaction
  @withUser
  public async list(params: ListParams): Promise<{ data: ModelObject[]; meta: any }> {
    const trx = params.context?.trx as TransactionClientContract

    if (!params.data.page) params.data.page = 1
    if (!params.data.perPage) params.data.perPage = 100

    let query = User.query({ client: trx })

    if (!!params.data.filters) {
      if (!!params.data.filters.email) query = query.whereILike('email', params.data.filters.email)
    }

    const results = await query.paginate(params.data.page, params.data.perPage)
    return results.toJSON()
  }

  // TODO review signup logics
  @withTransaction
  public async create(params: CreateParams): Promise<User> {
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
    return userCreated
  }

  public async get(params: GetParams): Promise<User | null> {
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
  public async update(params: UpdateParams): Promise<User> {
    const trx = params.context?.trx as TransactionClientContract

    const id = params.data.id
    delete params.data.id

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
}

export default UsersManager
