import type { PageLoad } from './$types'
import DashboardService from '$lib/services/dashboards/dashboard.service'

export const load = (async ({ parent, fetch, params }) => {
	let parentData = await parent()

	let service = new DashboardService({
		fetch,
		token: parentData.token,
		customerInUse: parentData.customerInUse
	})
	let dashboard = await service.get({ id: Number(params.dashboardId) })

	for (let i = 0; i < dashboard.widgets.length; i += 1) {
		let widget = dashboard.widgets[i]
		let widgetSpec = DashboardService.availableWidget.find((w) => w.name == widget.componentName)

		if (!!widgetSpec?.fetchData) {
			widget.data = await widgetSpec.fetchData({
				fetch,
				options: widget.options,
				token: parentData.token,
				user: parentData.user
			})
		}
	}

	return { dashboard }
}) satisfies PageLoad
