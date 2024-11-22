import { DateTime } from 'luxon'
import { FetchBasedService } from '../common/fetchBased.service'
import { FilterBuilder } from '@likable-hair/svelte'
import type { User } from '../auth/auth.service'

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
	options?: Record<string, any>
	data?: Data
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
				options?: any
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
			},
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
