import Database, { TransactionClientContract } from "@ioc:Adonis/Lucid/Database"
import { ModelObject } from "@ioc:Adonis/Lucid/Orm"
import FilterModifierApplier, { type Modifier } from "App/services/FilterModifierApplier"
import User from 'App/Models/User'
import { HttpContext } from "@adonisjs/core/build/standalone"
import Permission from "App/Models/Permission"
import { Context } from "./baseManager"

export type ListParams = {
  data: {
    page: number,
    perPage: number,
    filtersBuilder?: {
      modifiers: Modifier[]
    }
  },
  context?: Context
}

export type GetParams = {
  data: {
    id: number
  },
  context?: Context
}

export default class PermissionManager {
  constructor() { }

  public async list(params: ListParams): Promise<{ data: ModelObject[], meta: any }> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to list permissions')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      let query = Permission.query({ client: trx })

      if (!!params.data.filtersBuilder?.modifiers) {
        let filtersApplier = new FilterModifierApplier()
        filtersApplier.applyModifiers(query, params.data.filtersBuilder.modifiers)
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

  public async get(params: GetParams): Promise<Permission> {
    const user = await this._getUserFromContext(params.context)
    if (!user) throw new Error('user must be defined to get permission')

    let trx = params.context?.trx
    if (!trx) trx = await Database.transaction()

    try {
      let permission = await Permission.query({ client: trx })
        .where('id', params.data.id)
        .firstOrFail()

      if (!params.context?.trx) await trx.commit()
      return permission
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