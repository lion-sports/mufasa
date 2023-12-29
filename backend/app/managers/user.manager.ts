import { CreateUserValidator, UpdateUserValidator } from 'App/Validators/users'
import HttpContext from '@ioc:Adonis/Core/HttpContext'
import { validator } from "@ioc:Adonis/Core/Validator"
import AuthorizationManager from './authorization.manager'
import Database, { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import { ModelObject } from '@ioc:Adonis/Lucid/Orm';
import FilterModifierApplier, { Modifier } from 'App/services/FilterModifierApplier';
import { Context } from './baseManager'
import { string } from '@ioc:Adonis/Core/Helpers'
import { DateTime } from 'luxon'
import ApiToken from 'App/Models/ApiToken'
import ResetPasswordEmail from 'App/Mailers/ResetPasswordEmail'
import Env from '@ioc:Adonis/Core/Env'

export type CreateParams = {
  data: {
    email: string,
    firstname: string,
    lastname: string,
    password: string,
    phoneNumber?: string,
    system?: boolean,
    roleId?: number
  },
  context?: Context
}

export type UpdateParams = {
  data: {
    id?: number,
    email?: string,
    password?: string,
    phoneNumber?: string,
    firstname?: string,
    lastname?: string,
    system?: boolean,
    roleId?: number
  },
  context?: Context
}

export type ListParams = {
  data: {
    page?: number,
    perPage?: number,
    filtersBuilder?: { modifiers: Modifier[] },
    order?: {
      column: string,
      order?: 'desc' | 'asc'
    }[]
  },
  context?: Context
}

export type GetParams = {
  data: {
    id: number
  },
  context?: Context
}

export type DestroyParams = {
  data: {
    id: number,
  },
  context?: Context
}

export type GenerateResetPasswordUrl = {
  data: {
    user: {
      id: number
    }
  },
  context?: Context
}

export type SendResetPasswordEmailParams = {
  data: {
    user: {
      id: number
    }
  },
  context?: Context
}

export type SetNewPasswordParams = {
  data: {
    user: {
      id: number
    },
    newPassword: string,
    token: string
  },
  context?: Context
}

class UsersManager {
  constructor() {
  }

  public async list(params: ListParams): Promise<{data: ModelObject[], meta: any}> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to list users')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      await AuthorizationManager.canOrFail({
        data: {
          actor: user,
          action: 'view',
          resource: 'User',
          entities: {}
        },
        context: {
          trx: trx
        }
      })

      if (!params.data.page) params.data.page = 1
      if (!params.data.perPage) params.data.perPage = 100

      let query = User.query({
          client: trx
        })

      if (!!params.data.filtersBuilder?.modifiers && params.data.filtersBuilder.modifiers.length > 0) {
        let filtersApplier = new FilterModifierApplier()
        filtersApplier.applyModifiers(query, params.data.filtersBuilder.modifiers)
      }

      if (!!params.data.order) {
        query.orderBy(params.data.order)
      }

      const results = await query.preload('role', b => b.preload('permissions'))
        .orderBy(['users.firstname', 'users.lastname'])
        .paginate(params.data.page, params.data.perPage)

      if(!params.context?.trx) await trx.commit()
      return results.toJSON()
    } catch (error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  public async create(params: CreateParams): Promise<User> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to create a users')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      delete params.data.system

      await validator.validate({
        schema: new CreateUserValidator().schema,
        data: params.data
      })

      await AuthorizationManager.canOrFail({
        data: {
          actor: user,
          action: 'manage',
          resource: 'User',
          entities: {}
        },
        context: {
          trx: trx
        }
      })

      let createdUser = await User.create(params.data, { client: trx })

      if (!params.context?.trx) await trx.commit()
      return createdUser
    } catch (error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  public async get(params: GetParams): Promise<User | null> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to get users')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      await AuthorizationManager.canOrFail({
        data: {
          actor: user,
          action: 'view',
          resource: 'User',
          entities: {}
        },
        context: {
          trx: trx
        }
      })

      let foundUser = await User.query({ client: trx })
        .where('id', params.data.id)
        .preload('role', builder => {
          builder.preload('permissions')
        })
        .firstOrFail()

      if (!params.context?.trx) await trx.commit()
      return foundUser
    } catch (error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  public async update(params: UpdateParams): Promise<User> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to update a users')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      const id = params.data.id
      delete params.data.id

      delete params.data.system

      await validator.validate({
        schema: new UpdateUserValidator().schema,
        data: params.data
      })

      await AuthorizationManager.canOrFail({
        data: {
          actor: user,
          action: 'manage',
          resource: 'User',
          entities: {}
        },
        context: {
          trx: trx
        }
      })

      let updatedUser = await User.findOrFail(id, { client: trx })
      updatedUser.merge({
        email: params.data.email,
        firstname: params.data.firstname,
        lastname: params.data.lastname,
        password: params.data.password,
        phoneNumber: params.data.phoneNumber,
        roleId: params.data.roleId
      })

      let results = await updatedUser.save()
      if (!params.context?.trx) await trx.commit()
      return results
    } catch (error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  public async destroy(params: DestroyParams): Promise<void> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to delete users')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      await AuthorizationManager.canOrFail({
        data: {
          actor: user,
          action: 'manage',
          resource: 'User',
          entities: {}
        },
        context: {
          trx: trx
        }
      })

      let deleteUser = await User.query({ client: trx })
        .where('users.id', params.data.id)
        .firstOrFail()

      await deleteUser.delete()
      if (!params.context?.trx) await trx.commit()
    } catch (error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  public async generateResetPasswordUrl(params: GenerateResetPasswordUrl): Promise<string> {
    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      const resetPasswordToken = string.generateRandom(64)
      const expiration = DateTime.now().plus({ hour: 1 })

      await ApiToken.create({
        userId: params.data.user.id,
        name: 'Reset Password Token',
        type: 'resetPassword',
        token: resetPasswordToken,
        expires_at: expiration
      }, { client: trx })

      const url = `${Env.get('RESET_PASSWORD_URL')}?token=${resetPasswordToken}&userId=${params.data.user.id}`
      if (!params.context?.trx) await trx.commit()
      return url
    } catch (error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  public async sendResetPasswordEmail(params: SendResetPasswordEmailParams): Promise<void> {
    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      let userFromDB = await User.query({ client: trx })
        .where('id', params.data.user.id)
        .firstOrFail()

      const resetPasswordUrl = await this.generateResetPasswordUrl({
        data: {
          user: userFromDB
        },
        context: {
          trx
        }
      })

      const mailer = new ResetPasswordEmail({
        user: userFromDB,
        resetPasswordUrl
      })

      await mailer.sendLater()

      if (!params.context?.trx) await trx.commit()
    } catch (error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  public async resetPassword(params: SetNewPasswordParams): Promise<void> {
    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      let user = await User.query({ client: trx })
        .where('id', params.data.user.id)
        .firstOrFail()

      const token = ApiToken.query({ client: trx })
        .where('userId', user.id)
        .where('token', params.data.token)
        .where('expires_at', '>', DateTime.now().toJSDate())
        .first()

      if (!token) throw new Error('token not valid')

      user.password = params.data.newPassword
      await user.save()

      if (!params.context?.trx) await trx.commit()
    } catch (error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  private async _getUserFromContext(context?: Context) {
    if (!!context?.user) {
      return await User.query().where('id', context.user.id).first()
    } else {
      const ctx = HttpContext.get()
      return ctx?.auth?.user
    }
  }
}

export default UsersManager