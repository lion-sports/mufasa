import { DateTime } from 'luxon'
import { FetchBasedService } from '../common/fetchBased.service'
import { FilterBuilder } from '@likable-hair/svelte'
import type { User } from '../auth/auth.service'
import WidgetsService from '../widgets/widget.service'
import type { TeamFilter, WidgetSetting } from '../widgets/widgetSettings.service'
import ScoutAnalysisService from '../scouts/scoutAnalysis.service'

export type Dashboard = {
	id: number
	name: string
	active: boolean
	default?: boolean
	widgets: Widget[]
	createdAt: DateTime
	updatedAt: DateTime
}

export type Widget<Data = any> = {
	id: number
	componentName: string
	height: number
	width: number
	left: number
	top: number
	options?: any // TODO deprecate the property, use widget settings instead
	data?: Data
  widgetSetting?: WidgetSetting
}

export type PaginatedDashboard = {
	data: Dashboard[]
	meta: PaginationData
}

export default class DashboardService extends FetchBasedService {
	public async list(params: {
		page: number
		perPage: number
		filtersBuilder?: FilterBuilder
	}): Promise<PaginatedDashboard> {
		let paginatedDashboards = await this.client.get({
			url: `/dashboards`,
			params: {
				page: params.page,
				perPage: params.perPage,
				filtersBuilder: !!params.filtersBuilder ? params.filtersBuilder.toJson() : undefined
			}
		})

		return paginatedDashboards
	}

	public async create(params: {
		name: string
		active?: boolean
		widgets: {
			componentName: string
			height: number
			width: number
			left: number
			top: number
			data?: any
		}[]
	}): Promise<Dashboard> {
		let dashboard = await this.client.post({
			url: `/dashboards`,
			body: {
				name: params.name,
				active: params.active,
				widgets: params.widgets
			}
		})

		return dashboard
	}

	public async get(params: { id: number }): Promise<Dashboard> {
		let dashboard = await this.client.get({
			url: `/dashboards/${params.id}`
		})

		return dashboard
	}

	public async update(params: {
		id: number
		name?: string
		active?: boolean
		widgets?: {
			id?: string | number
			componentName?: string
			height?: number
			width?: number
			left?: number
			top?: number
		}[]
	}): Promise<Dashboard> {
		let dashboard = await this.client.put({
			url: `/dashboards/${params.id}`,
			body: {
				name: params.name,
				active: params.active,
				widgets: params.widgets?.map((w) => ({
					id: w.id,
					componentName: w.componentName,
					height: w.height,
					width: w.width,
					left: w.left,
					top: w.top
				}))
			}
		})

		return dashboard
	}

	public async active(params: {
		dashboard: {
			id: number
		}
	}): Promise<Dashboard> {
		return await this.update({
			id: params.dashboard.id,
			active: true
		})
	}

	public async destroy(params: { id: number }): Promise<void> {
		await this.client.delete({
			url: `/dashboards/${params.id}`
		})
	}

	public static get availableWidget(): {
		name: string
		label: string
		availableSizes: [number, number][] // [h, w][]
		fetchData?: (
			params: {
				token?: string
				fetch: typeof fetch
				user?: User
        widget?: (Omit<Widget, 'id'> & { id: string | number }),
        scoutId?: number,
        sets?: number[]
			},
			widgetId?: number
		) => Promise<any>
	}[] {
		return [
			{
				name: 'Widget1',
				label: 'Placeholder',
				availableSizes: [
					[1, 1],
					[2, 1],
					[1, 2],
					[2, 2],
					[2, 3],
					[3, 2],
					[3, 3]
				],
				fetchData: async (params) => {
					return ['placeholder']
				}
      }, {
        name: 'VolleyballDistribution',
        label: 'Volleyball distribution',
        availableSizes: [
          [2, 2],
          [2, 3],
          [2, 4],
          [3, 2],
        ],
        fetchData: async (params) => {
          let settings = params.widget?.widgetSetting?.settings
          let team: TeamFilter = 'both'
          if (
            !!settings && settings.widget == 'VolleyballDistribution' && !!settings.team
          ) team = settings.team

          let widgetService = new WidgetsService({ fetch: params.fetch, token: params.token })
          let results = await widgetService.loadDistribution({
            scoutId: params.scoutId,
            sets: params.sets,
            team
          })
          return results
        }
      }, {
        name: 'VolleyballServeSummary',
        label: 'Volleyball Serve Summary',
        availableSizes: [
          [2, 2],
          [2, 3],
          [2, 4],
          [3, 2],
        ],
        fetchData: async (params) => {
          let settings = params.widget?.widgetSetting?.settings
          let team: TeamFilter = 'both'
          if (
            !!settings && settings.widget == 'VolleyballServeSummary' && !!settings.team
          ) team = settings.team

          let widgetService = new WidgetsService({ fetch: params.fetch, token: params.token })
          let results = await widgetService.loadServeSummary({
            scoutId: params.scoutId,
            sets: params.sets,
            team
          })
          return results
        }
      }, {
        name: 'VolleyballBlockSummary',
        label: 'Volleyball Block Summary',
        availableSizes: [
          [2, 2],
          [2, 3],
          [2, 4],
          [3, 2],
        ],
        fetchData: async (params) => {
          let settings = params.widget?.widgetSetting?.settings
          let team: TeamFilter = 'both'
          if (
            !!settings && settings.widget == 'VolleyballBlockSummary' && !!settings.team
          ) team = settings.team

          let widgetService = new WidgetsService({ fetch: params.fetch, token: params.token })
          let results = await widgetService.loadBlockSummary({
            scoutId: params.scoutId,
            sets: params.sets,
            team
          })
          return results
        }
      }, {
        name: 'VolleyballReceiveSummary',
        label: 'Volleyball Receive Summary',
        availableSizes: [
          [2, 2],
          [2, 3],
          [2, 4],
          [3, 2],
        ],
        fetchData: async (params) => {
          let settings = params.widget?.widgetSetting?.settings
          let team: TeamFilter = 'both'
          if (
            !!settings && settings.widget == 'VolleyballReceiveSummary' && !!settings.team
          ) team = settings.team

          let widgetService = new WidgetsService({ fetch: params.fetch, token: params.token })
          let results = await widgetService.loadReceiveSummary({
            scoutId: params.scoutId,
            sets: params.sets,
            team
          })
          return results
        }
      }, {
        name: 'VolleyballPointsHistory',
        label: 'Volleyball Points History',
        availableSizes: [
          [2, 2],
          [2, 3],
          [2, 4],
          [3, 2],
        ],
        fetchData: async (params) => {
          let scoutAnalysisService = new ScoutAnalysisService({ fetch: params.fetch, token: params.token })
          let points = await scoutAnalysisService.pointsHistory({
            scoutId: params.scoutId,
            sets: params.sets
          })
          return {
            points
          }
        }
      }
    ]
	}

	public canManageWidget(params: {
		user?: User
		logicalOperator?: 'and' | 'or'
	}): boolean {
		if (!params.user) return false

		return true
	}
}
