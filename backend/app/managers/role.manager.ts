import { HttpContext } from "@adonisjs/core/build/standalone"
import Database, { TransactionClientContract } from "@ioc:Adonis/Lucid/Database"
import { ModelObject } from "@ioc:Adonis/Lucid/Orm"
import Role from "App/Models/Role"
import RoleModel from "App/Models/Role"
import FilterModifierApplier, { type Modifier } from "App/services/FilterModifierApplier"
import { validator } from "@ioc:Adonis/Core/Validator"
import { CreateRoleValidator, UpdateRoleValidator } from "App/Validators/roles"
import AuthorizationManager from "./authorization.manager"
import UserModel from "App/Models/User"
import { Context } from "./baseManager"

export type ListParams = {
  data: {
    page: number,
    perPage: number,
    filtersBuilder?: {
      modifiers: Modifier[]
    },
  },
  context?: Context
}

export type CreateParams = {
  data: {
    name: string,
    permissions?: {
      id: number
    }[]
  },
  context?: Context
}

export type UpdateParams = {
  data: {
    id: number,
    name?: string,
    permissions?: {
      id: number
    }[]
  },
  context?: Context
}

export type DestroyParams = {
  data: {
    id: number,
  },
  context?: Context
}

export type GetParams = {
  data: {
    id: number,
  },
  context?: Context
}

export default class RoleManager {

  constructor() { }

  public async list(params: ListParams): Promise<{ data: ModelObject[], meta: any }> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to list roles')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      let query = RoleModel.query({ client: trx })
        .preload('permissions')

      if (!!params.data.filtersBuilder?.modifiers) {
        let filtersApplier = new FilterModifierApplier()
        filtersApplier.applyModifiers(query, params.data.filtersBuilder?.modifiers)
      }

      if (!params.data.page) params.data.page = 1
      if (!params.data.perPage) params.data.perPage = 100

      let results = await query.paginate(params.data.page, params.data.perPage)

      if (!params.context?.trx) await trx.commit()
      return results.toJSON()
    } catch (error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  public async create(params: CreateParams): Promise<Role> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to create a role')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      await validator.validate({
        schema: new CreateRoleValidator().schema,
        data: {
          ...params.data
        }
      })

      await AuthorizationManager.canOrFail({
        data: {
          actor: user,
          action: 'manage',
          resource: 'Role',
          entities: {}
        },
        context: {
          trx: trx
        }
      })

      const createdRole = await RoleModel.create({
        name: params.data.name,
      }, {
        client: trx
      })

      if (!!params.data.permissions) {
        await createdRole.related('permissions').sync(params.data.permissions.map(p => p.id))
      }
      await createdRole.load('permissions')

      if (!params.context?.trx) await trx.commit()
      return createdRole
    } catch (error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  public async update(params: UpdateParams): Promise<Role> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to update a role')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      await validator.validate({
        schema: new UpdateRoleValidator().schema,
        data: {
          ...params.data
        }
      })

      await AuthorizationManager.canOrFail({
        data: {
          actor: user,
          action: 'manage',
          resource: 'Role',
          entities: {}
        },
        context: {
          trx: trx
        }
      })

      let role = await RoleModel.query({
        client: trx
      }).where('id', params.data.id)
      .preload('permissions')
      .firstOrFail()

      if (!!params.data.name) role.name = params.data.name
      let results = await role.save()

      if(!!params.data.permissions) {
        await role.related('permissions').sync(params.data.permissions.map(p => p.id))
      }
      await role.load('permissions')

      if (!params.context?.trx) await trx.commit()
      return results

    } catch (error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  public async destroy(params: DestroyParams): Promise<void> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to delete roles')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      await AuthorizationManager.canOrFail({
        data: {
          actor: user,
          action: 'manage',
          resource: 'Role',
          entities: {}
        },
        context: {
          trx: trx
        }
      })

      let role = await RoleModel.query({client: trx})
        .where('id', params.data.id)
        .firstOrFail()

      await role.delete()
      if (!params.context?.trx) await trx.commit()
    } catch (error) {
      if (!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  public async get(params: GetParams): Promise<Role> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to get sections')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      let role = await Role.query({client: trx})
        .where('id', params.data.id)
        .preload('permissions')
        .firstOrFail()

      if(!params.context?.trx) await trx.commit()
      return role
    } catch (error) {
      if(!params.context?.trx) await trx.rollback()
      throw error
    }
  }

  private async _getUserFromContext(context?: Context) {
    if (!!context?.user) {
      return await UserModel.query().where('id', context.user.id).first()
    } else {
      const ctx = HttpContext.get()
      return ctx?.auth?.user
    }
  }
}