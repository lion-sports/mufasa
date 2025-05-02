import { Context, withTransaction, withUser } from './base.manager.js'
import Widget from '#app/Models/Widget'
import Dashboard from '#app/Models/Dashboard'
import User from '#app/Models/User'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class WidgetManager {
  @withTransaction
  @withUser
  public async createMany(params: {
    data: {
      dashboard: {
        id: number
      }
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
  }): Promise<Widget[]> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    let dashboard = await Dashboard.query({ client: trx })
      .where('id', params.data.dashboard.id)
      .where('userId', user.id)
      .preload('widgets')
      .firstOrFail()

    return await dashboard.related('widgets').createMany(
      params.data.widgets.map((w) => {
        return {
          componentName: w.componentName,
          height: w.height,
          width: w.width,
          left: w.left,
          top: w.top,
          options: w.options,
        }
      })
    )
  }

  @withTransaction
  @withUser
  public async get(params: {
    data: {
      id: number
    }
    context?: Context
  }): Promise<Widget> {
    let trx = params.context?.trx
    let user = params.context?.user as User

    return await Widget.query({ client: trx })
      .whereHas('dashboard', b => b.where('userId', user.id))
      .where('id', params.data.id)
      .preload('widgetSetting')
      .firstOrFail()
  }

  @withTransaction
  @withUser
  public async set(params: {
    data: {
      dashboard: {
        id: number
      }
      widgets: {
        id?: number
        componentName?: string
        height?: number
        width?: number
        left?: number
        top?: number
        options?: any
      }[]
    }
    context?: Context
  }): Promise<{
    dashboard: Dashboard
    created: Widget['id'][]
    updated: Widget['id'][]
    deleted: Widget['id'][]
  }> {
    const trx = params.context?.trx as TransactionClientContract
    const user = params.context?.user as User

    let dashboard = await Dashboard.query({ client: trx })
      .where('id', params.data.dashboard.id)
      .where('userId', user.id)
      .preload('widgets')
      .firstOrFail()

    let createWidgets: (typeof params)['data']['widgets'] = params.data.widgets.filter((pw) =>
      dashboard.widgets.every((w) => w.id !== pw.id)
    )
    let updateWidgets: (typeof params)['data']['widgets'] = params.data.widgets.filter((pw) =>
      dashboard.widgets.every((w) => w.id === pw.id)
    )
    let deleteWidgets: Widget[] = dashboard.widgets.filter((w) =>
      params.data.widgets.every((pw) => pw.id !== w.id)
    )
    
    let createdWidgetsIds: number[] = []
    const createdWidgets = await dashboard.related('widgets').createMany(
      createWidgets.map((pw) => {
        return {
          componentName: pw.componentName,
          height: pw.height,
          width: pw.width,
          left: pw.left,
          top: pw.top,
          options: pw.options,
        }
      })
    )

    if (createdWidgets.length > 0) {
      createdWidgetsIds = createdWidgets.map((w) => w.id)
    }

    let updatedWidgetsIds: number[] = []
    for (let i = 0; i < updateWidgets.length; i++) {
      let updateWidget = updateWidgets[i]

      let widget = dashboard.widgets.find((ft) => ft.id == updateWidget.id)
      if (!!widget) {
        if (updateWidget.componentName !== undefined)
          widget.componentName = updateWidget.componentName
        if (updateWidget.height !== undefined) widget.height = updateWidget.height
        if (updateWidget.width !== undefined) widget.width = updateWidget.width
        if (updateWidget.left !== undefined) widget.left = updateWidget.left
        if (updateWidget.top !== undefined) widget.top = updateWidget.top
        widget.options = updateWidget.options

        await widget.useTransaction(trx).save()
        updatedWidgetsIds.push(widget.id)
      }
    }

    let deletedWidgetsIds: number[] = []
    if (deleteWidgets.length > 0) {
      deletedWidgetsIds = deleteWidgets.map((dw) => dw.id)
    }
    await dashboard
      .related('widgets')
      .query()
      .useTransaction(trx)
      .whereIn('id', deletedWidgetsIds)
      .delete()

    await dashboard.refresh()
    await dashboard.load('widgets')

    return {
      dashboard,
      created: createdWidgetsIds,
      updated: updatedWidgetsIds,
      deleted: deletedWidgetsIds,
    }
  }
}
