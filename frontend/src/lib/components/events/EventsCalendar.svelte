<script lang="ts">
	import { run } from 'svelte/legacy'

	import './EventsCalendar.css'
	import Calendar from '@event-calendar/core'
	import TimeGrid from '@event-calendar/time-grid'
	import DayGrid from '@event-calendar/day-grid'
	import Interaction from '@event-calendar/interaction'
	import { DateTime } from 'luxon'
	import type { Team } from '@/lib/services/teams/teams.service'
	import type { Event } from '@/lib/services/events/events.service'
	import { theme } from '@likable-hair/svelte'
	import EventsService from '@/lib/services/events/events.service'
	import { goto } from '$app/navigation'
	import qs from 'qs'

	interface Props {
		team?: Team | undefined
		selectedDate?: Date | undefined
		events: Event[]
		visibleMonth?: number
		visibleYear?: number
		canCreate?: boolean
	}

	let {
		team = $bindable(),
		selectedDate = $bindable(),
		events = $bindable(),
		visibleMonth = $bindable(DateTime.now().get('month') - 1),
		visibleYear = $bindable(DateTime.now().get('year')),
		canCreate = false
	}: Props = $props()

	let eventCalendar: Calendar | undefined = $state()
	let plugins = [TimeGrid, DayGrid, Interaction]
	let selectedView: string = $state('dayGridMonth')

	run(() => {
		if (!!visibleMonth && !!visibleYear && !!eventCalendar) {
			eventCalendar.setOption(
				'date',
				DateTime.fromObject({ month: visibleMonth + 1, year: visibleYear })
					.startOf('month')
					.toJSDate()
			)
		}
	})

	let options: Calendar.Options = $derived({
		view: selectedView,
		events: [],
		datesSet: (info: Calendar.DatesSetInfo) => {
			// TODO set the cache to the current view
		},
		eventDrop: async (info: Calendar.EventDropInfo) => {
			let originalEvent = info.event.extendedProps.originalEvent as Event
			let service = new EventsService({ fetch })
			await service.update({
				id: originalEvent.id as number,
				start: info.event.start,
				end: info.event.end
			})

			let eventIndex = events.findIndex((e) => e.id === originalEvent.id)
			if (eventIndex !== -1) {
				events[eventIndex].start = info.event.start
				events[eventIndex].end = info.event.end
			}
		},
		eventResize: async (info: Calendar.EventResizeInfo) => {
			let originalEvent = info.event.extendedProps.originalEvent as Event
			let service = new EventsService({ fetch })
			await service.update({
				id: originalEvent.id as number,
				start: info.event.start,
				end: info.event.end
			})

			let eventIndex = events.findIndex((e) => e.id === originalEvent.id)
			if (eventIndex !== -1) {
				events[eventIndex].start = info.event.start
				events[eventIndex].end = info.event.end
			}
		},
		eventSources: [
			{
				events: (
					fetchInfo: Calendar.FetchInfo,
					success: (events: Array<Calendar.Event>) => void,
					failure: (errorInfo: object) => void
				) => {
					let eventService = new EventsService({ fetch })
					eventService
						.list({
							filters: {
								from: fetchInfo.start,
								to: fetchInfo.end,
								team: team
							}
						})
						.then((listEvents) => {
							success(
								listEvents.map((e) => {
									return {
										id: e.id,
										start: e.start,
										end: e.end,
										resourceIds: e.convocations.map((e) => e.teammateId),
										allDay: false,
										title: e.name,
										editable: true,
										startEditable: true,
										durationEditable: true,
										display: 'auto' as const,
										backgroundColor: undefined,
										textColor: undefined,
										classNames: [],
										styles: [],
										extendedProps: {
											originalEvent: e
										}
									}
								})
							)
						})
						.catch((err) => failure(err))
				}
			}
		],
		eventAllUpdated: (info: { view: Calendar.View }) => {
			if (!!eventCalendar)
				events = eventCalendar.getEvents().map((e) => e.extendedProps.originalEvent) as any
		},
		editable: true,
		height: 'calc(100vh - 260px)',
		eventContent: (info: Calendar.EventContentInfo) => {
			return info.event.title
		},
		customButtons: {
			dayGridMonth: {
				active: selectedView == 'dayGridMonth',
				text: 'Mese',
				click: () => {
					selectedView = 'dayGridMonth'
				}
			},
			timeGridWeek: {
				active: selectedView == 'timeGridWeek',
				text: 'Settimana',
				click: () => {
					selectedView = 'timeGridWeek'
					selectedDate = undefined

					setTimeout(() => {
						var scrollers = document.querySelectorAll('.ec-time-grid.ec-week-view .ec-days')

						var scrollerDivs = Array.prototype.filter.call(scrollers, function (testElement) {
							return testElement.nodeName === 'DIV'
						})

						function scrollAll(scrollLeft: any) {
							scrollerDivs.forEach(function (element, index, array) {
								element.scrollLeft = scrollLeft
							})
						}

						scrollerDivs.forEach(function (element, index, array) {
							element.addEventListener('scroll', function (e: any) {
								scrollAll(e.target.scrollLeft)
							})
						})
					}, 1000)
				}
			}
		},
		headerToolbar: {
			start: 'title',
			center: '',
			end: 'dayGridMonth,timeGridWeek today prev,next'
		},
		titleFormat: (start: Date, end: Date) => {
			let startLuxonDate = DateTime.fromJSDate(start).setLocale('it-IT')
			let endLuxonDate = DateTime.fromJSDate(end).setLocale('it-IT')
			if (selectedView === 'timeGridWeek') {
				let startYear = startLuxonDate.toFormat('yyyy')
				let endYear = endLuxonDate.toFormat('yyyy')
				let startMonth = startLuxonDate.toFormat('LLLL')
				let endMonth = endLuxonDate.toFormat('LLLL')
				let startDate = startLuxonDate.toFormat('dd')
				let endDate = endLuxonDate.toFormat('dd')

				if (startYear === endYear) {
					if (endMonth == startMonth) {
						return {
							html: `<div style="font-size: 1.3rem">${startDate} - ${endDate} ${startMonth} ${startYear}</div>`
						}
					} else {
						return {
							html: `<div style="font-size: 1.3rem">${startDate} ${startMonth} - ${endDate} ${endMonth} ${startYear}</div>`
						}
					}
				} else {
					return {
						html: `<div style="font-size: 1.3rem">${startDate} ${startMonth} ${startYear} - ${endDate} ${endMonth} ${endYear}</div>`
					}
				}
			} else {
				let monthName = startLuxonDate.toFormat('LLLL')
				let fullYear = startLuxonDate.toFormat('yyyy')
				return { html: `<div style="font-size: 1.3rem">${monthName} ${fullYear}</div>` }
			}
		},
		highlightedDates: !!selectedDate ? [selectedDate] : [],
		dateClick: (info: Calendar.DateClickInfo) => {
			if (info.view.type !== 'timeGridWeek') {
				selectedDate = info.date
			}
		},
		eventClick: (info: Calendar.EventClickInfo) => {
			if (!!team && !!info.event.extendedProps.originalEvent) {
				goto(`/teams/${team.id}/events/${info.event.id}`)
			} else {
				let originalEvent: Event = info.event.extendedProps.originalEvent as Event
				goto(`/teams/${originalEvent.teamId}/events/${originalEvent.id}`)
			}
		},
		views: {
			timeGridWeek: {
				pointer: true
			},
			dayGridMonth: {
				pointer: true
			}
		},
		dayMaxEvents: true,
		nowIndicator: true,
		selectable: canCreate,
		select: (info: Calendar.SelectInfo) => {
			if (!!team) {
				goto(`/teams/${team.id}/events/new?${qs.stringify({ start: info.start, end: info.end })}`)
			}
		}
	})
</script>

<div class:ec-dark={$theme.dark}>
	<Calendar bind:this={eventCalendar} {plugins} {options} />
</div>
