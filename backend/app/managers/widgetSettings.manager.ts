import { Context, withTransaction, withUser } from './base.manager.js'
import WidgetSettings, { WidgetSettingStructure } from '#app/Models/WidgetSetting'
import FilterModifierApplier, { Modifier } from '#app/Services/FilterModifierApplier'
import AuthorizationManager from './authorization.manager.js'
import Widget from '#app/Models/Widget'
import WidgetSetting from '#app/Models/WidgetSetting'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { ModelObject } from "@adonisjs/lucid/types/model";

export default class WidgetSettingsManager {
  @withTransaction
  @withUser
  public async list(params: {
    data: {
      page?: number
      perPage?: number
      filtersBuilder?: { modifiers?: Modifier[] }
      order?: {
        column: string
        order?: 'desc' | 'asc'
      }[]
    }
    context?: Context
  }): Promise<{ data: ModelObject[]; meta: any }> {
    let trx = params.context?.trx

    if (!params.data.page) params.data.page = 1
    if (!params.data.perPage) params.data.perPage = 100

    let query = WidgetSettings.query({
      client: trx,
    }).orderBy('widget_settings.updatedAt', 'desc')

    if (
      !!params.data.filtersBuilder &&
      params.data.filtersBuilder.modifiers &&
      params.data.filtersBuilder.modifiers.length > 0
    ) {
      let filtersApplier = new FilterModifierApplier()
      filtersApplier.applyModifiers(query, params.data.filtersBuilder.modifiers)
    }

    if (!!params.data.order) {
      query.orderBy(params.data.order)
    }

    const results = await query.preload('widget').paginate(params.data.page, params.data.perPage)

    return results.toJSON()
  }

  @withTransaction
  @withUser
  public async create(params: {
    data: {
      widgetId: number
      settings?: WidgetSettingStructure
    }
    context?: Context
  }): Promise<WidgetSettings> {
    const trx = params.context?.trx as TransactionClientContract

    let createdWidget = await WidgetSettings.create(params.data, { client: trx })
    await createdWidget.load('widget')

    return createdWidget
  }

  @withTransaction
  @withUser
  public async get(params: {
    data: {
      id: number
    }
    context?: Context
  }): Promise<WidgetSettings | null> {
    let trx = params.context?.trx

    return await WidgetSettings.query({ client: trx })
      .where('id', params.data.id)
      .preload('widget')
      .firstOrFail()
  }

  @withTransaction
  @withUser
  public async update(params: {
    data: {
      id?: number
      widgetId?: number
      settings?: WidgetSettingStructure
    }
    context?: Context
  }): Promise<WidgetSettings> {
    let trx = params.context?.trx

    const id = params.data.id
    delete params.data.id

    let updatedWidgetSetting = await WidgetSettings.findOrFail(id, { client: trx })
    updatedWidgetSetting.merge({
      widgetId: params.data.widgetId,
      settings: params.data.settings,
    })

    let results = await updatedWidgetSetting.save()

    return results
  }

  @withTransaction
  @withUser
  public async destroy(params: {
    data: {
      id: number
    }
    context?: Context
  }): Promise<void> {
    let trx = params.context?.trx

    let deleteWidgetSetting = await WidgetSettings.query({ client: trx })
      .where('widget_settings.id', params.data.id)
      .firstOrFail()

    await deleteWidgetSetting.delete()
  }

  @withTransaction
  @withUser
  public async set(params: {
    data: {
      widget: {
        id: number
      }
      settings: WidgetSettingStructure
    }
    context?: Context
  }): Promise<WidgetSetting> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user!

    await AuthorizationManager.canOrFail({
      data: {
        actor: user,
        action: 'set',
        resource: 'widgetSetting',
        entities: {
          widget: {
            id: params.data.widget.id
          }
        }
      },
      context: {
        trx
      }
    })

    let widgetSetting = await WidgetSettings.updateOrCreate({
        widgetId: params.data.widget.id
      }, {
        settings: params.data.settings
      }, {
        client: trx
      })

    return widgetSetting
  }
}
