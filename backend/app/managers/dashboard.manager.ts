import Dashboard from '#app/Models/Dashboard'
import { type Context, type ListParams, withTransaction, withUser } from './base.manager.js'
import User from '#app/Models/User'
import { validator } from '@adonisjs/validator'
import { CreateDashboardValidator, UpdateDashboardValidator } from '#app/Validators/dashboards/index'
import WidgetManager from './widget.manager.js'
import FilterModifierApplier from '#app/Services/FilterModifierApplier'
import { ModelObject } from "@adonisjs/lucid/types/model";
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class DashboardManager {
  @withTransaction
  @withUser
  public async list(params: ListParams): Promise<{ data: ModelObject[]; meta: any }> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    if (!params.data.page) params.data.page = 1
    if (!params.data.perPage) params.data.perPage = 100

    let query = Dashboard.query({
        client: trx,
      })
      .preload('widgets', b => b.preload('widgetSetting'))
      .where('userId', user.id)

    if (!!params.data.filtersBuilder && !!params.data.filtersBuilder.modifiers) {
      let filtersApplier = new FilterModifierApplier()
      filtersApplier.applyModifiers(query, params.data.filtersBuilder.modifiers)
    }

    if (!!params.data.order) {
      query.orderBy(params.data.order)
    } else {
      query.orderBy('createdAt')
    }

    const results = await query.paginate(params.data.page, params.data.perPage)

    return results.toJSON()
  }

  @withTransaction
  @withUser
  public async create(params: {
    data: {
      name: string
      active: boolean
      widgets: {
        componentName: string
        height: number
        width: number
        left: number
        top: number
        options?: any
      }[]
    }
    context?: Context
  }): Promise<Dashboard> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    let validatedData = await validator.validate({
      schema: new CreateDashboardValidator().schema,
      data: params.data,
    })

    if (validatedData.active) {
      await Dashboard.query({ client: trx }).where('userId', user.id).update({ active: false })
    }

    let dashboard = await Dashboard.create(
      {
        name: validatedData.name,
        active: validatedData.active,
        userId: user.id,
      },
      { client: trx }
    )

    if (!!validatedData.widgets && validatedData.widgets.length > 0) {
      let widgetManager = new WidgetManager()
      await widgetManager.createMany({
        data: {
          dashboard,
          widgets: validatedData.widgets,
        },
        context: {
          trx,
          user,
        },
      })
    }

    await dashboard.load('widgets', b => b.preload('widgetSetting'))
    return dashboard
  }

  @withTransaction
  @withUser
  public async get(params: {
    data: {
      id: number
    }
    context?: Context
  }): Promise<Dashboard> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    return await Dashboard.query({ client: trx })
      .where('userId', user.id)
      .where('id', params.data.id)
      .preload('widgets', b => b.preload('widgetSetting'))
      .firstOrFail()
  }

  @withTransaction
  @withUser
  public async update(params: {
    data: {
      id: number
      name: string
      active: boolean
      widgets?: {
        id?: string | number
        componentName: string
        height: number
        width: number
        left: number
        top: number
        options?: any
      }[]
    }
    context?: Context
  }): Promise<Dashboard> {
    let trx = params.context?.trx as TransactionClientContract
    let user = params.context?.user as User

    if (!!params.data.widgets) {
      params.data.widgets = params.data.widgets.map((e) => {
        if (!Number(e.id)) delete e.id
        return e
      })
    }

    let validatedData = await validator.validate({
      schema: new UpdateDashboardValidator().schema,
      data: params.data,
    })

    let widgets = validatedData.widgets
    delete validatedData.widgets

    let dashboard = await Dashboard.query({ client: trx })
      .where('id', params.data.id)
      .where('userId', user.id)
      .firstOrFail()

    if (validatedData.active) {
      await Dashboard.query({ client: trx })
        .where('userId', user.id)
        .where('id', '!=', validatedData.id)
        .update({ active: false })
    }

    let dashboardParams: {
      active?: boolean
      name?: string
    } = validatedData
    await dashboard.merge(dashboardParams).useTransaction(trx)
    await dashboard.save()

    if (!!widgets) {
      let widgetManager = new WidgetManager()
      await widgetManager.set({
        data: {
          dashboard,
          widgets: widgets,
        },
        context: {
          trx,
          user,
        },
      })
    }

    await dashboard.load('widgets', b => b.preload('widgetSetting'))
    return dashboard
  }

  @withTransaction
  @withUser
  public async destroy(params: {
    data: {
      id: number
    }
    context?: Context
  }) {
    let trx = params.context?.trx
    let user = params.context?.user as User

    await Dashboard.query({ client: trx })
      .where('id', params.data.id)
      .where('userId', user.id)
      .delete()
  }
}
