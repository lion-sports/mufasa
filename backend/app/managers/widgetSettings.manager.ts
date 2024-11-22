import { Context, withTransaction, withUser } from './base.manager'
import WidgetSettings, { WidgetSettingStructure } from 'App/Models/WidgetSettings'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { ModelObject } from '@ioc:Adonis/Lucid/Orm'
import FilterModifierApplier, { Modifier } from 'App/Services/FilterModifierApplier'


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
      widgetSettings: WidgetSettings[]
    }
    context?: Context
  }): Promise<{
    deleteWidgetSettingIds?: number[]
    createdWidgetSettingIds?: number[]
  }> {
    const trx = params.context?.trx as TransactionClientContract

    let existingWidgetSettings = await WidgetSettings.query({ client: trx }).where(
      'widgetId',
      params.data.widget.id
    )

    let createWidgetSettings: (typeof params)['data']['widgetSettings'] =
      params.data.widgetSettings.filter(
        (ws) =>
          !ws.id || existingWidgetSettings.every((es) => es.id.toString() !== ws.id?.toString())
      )

    let updateWidgetSettings: (typeof params)['data']['widgetSettings'] =
      params.data.widgetSettings.filter((ws) =>
        existingWidgetSettings.some((us) => us.id.toString() === ws.id?.toString())
      )

    let createdWidgetSettingIds: number[] = []

    let deleteWidgetSettingIds: number[] = existingWidgetSettings
      .filter((es) =>
        params.data.widgetSettings.every((ws) => ws.id?.toString() !== es.id?.toString())
      )
      .map((s) => s.id)

    for (let i = 0; i < createWidgetSettings.length; i += 1) {
      let createWidgetSetting = createWidgetSettings[i]

      let widgetSetting = await WidgetSettings.create(
        {
          widgetId: params.data.widget.id,
          settings: createWidgetSetting.settings,
        },
        {
          client: trx,
        }
      )

      createdWidgetSettingIds.push(widgetSetting.id)
    }

    for (let i = 0; i < updateWidgetSettings.length; i++) {
      let updateWidgetSetting = updateWidgetSettings[i]

      let widgetSetting = existingWidgetSettings.find((es) => es.id == updateWidgetSetting.id)

      if (!!widgetSetting) {
        widgetSetting.merge({
          widgetId: params.data.widget.id,
          settings: updateWidgetSetting.settings,
        })
        await widgetSetting.useTransaction(trx).save()
      }
    }

    if (!!deleteWidgetSettingIds) {
      await WidgetSettings.query({ client: trx }).whereIn('id', deleteWidgetSettingIds).delete()
    }

    return {
      deleteWidgetSettingIds: deleteWidgetSettingIds,
      createdWidgetSettingIds,
    }
  }
}
