<script lang="ts">
	import './BookingsCalendar.css'
	import { Calendar, TimeGrid, DayGrid, Interaction, ResourceTimeline } from '@event-calendar/core'
	import { DateTime } from 'luxon'
	import { FilterBuilder, theme } from '@likable-hair/svelte'
	import { goto } from '$app/navigation'
	import qs from 'qs'
	import BookingService, { type Booking } from '@/lib/services/bookings/bookings.service'
	import type { Club } from '@/lib/services/clubs/clubs.service'
	import type { Place } from '@/lib/services/places/places.service'

	interface Props {
		selectedDate?: Date | undefined
		bookings: Booking[]
    club: Club,
    places?: Place[],
		visibleMonth?: number
		visibleYear?: number
		canCreate?: boolean
    canUpdate?: boolean
    bookingClick?: (params: { booking: Booking }) => void
	}

	let {
		club = $bindable(),
    places = [],
		selectedDate = $bindable(),
		bookings = $bindable(),
		visibleMonth = $bindable(DateTime.now().get('month') - 1),
		visibleYear = $bindable(DateTime.now().get('year')),
		canCreate = false,
    canUpdate = true,
    bookingClick
	}: Props = $props()
  
  let eventCalendar: any = $state()
	let plugins = [TimeGrid, DayGrid, Interaction, ResourceTimeline]
	let selectedView: string = $state('dayGridMonth')

  let visibleDate = $derived(DateTime.fromObject({ month: visibleMonth + 1, year: visibleYear })
    .startOf('month')
    .toJSDate())

	let options: Calendar.Options = $derived({
		view: selectedView,
		events: [],
    locale: 'IT-it',
    firstDay: 1,
    date: visibleDate,
		eventDrop: async (info: Calendar.EventDropInfo) => {
			let originalBooking = info.event.extendedProps.originalBooking as Booking
			let service = new BookingService({ fetch })

			await service.update({
				id: originalBooking.id,
				from: info.event.start,
				to: info.event.end
			})

			let bookingIndex = bookings.findIndex((e) => e.id === originalBooking.id)
			if (bookingIndex !== -1) {
				bookings[bookingIndex].from = info.event.start
				bookings[bookingIndex].to = info.event.end
			}
		},
    eventResize: async (info: Calendar.EventResizeInfo) => {
      let originalBooking = info.event.extendedProps.originalBooking as Booking
      let service = new BookingService({ fetch })
      await service.update({
        id: originalBooking.id,
        from: info.event.start,
        to: info.event.end
      })

      let bookingIndex = bookings.findIndex((b) => b.id === originalBooking.id)
      if (bookingIndex !== -1) {
        bookings[bookingIndex].from = info.event.start
        bookings[bookingIndex].to = info.event.end
      }
    },
		eventSources: [
			{
				events: (
					fetchInfo: Calendar.FetchInfo,
					success: (events: Array<Calendar.Event>) => void,
					failure: (errorInfo: object) => void
				) => {
          let builder = new FilterBuilder()
          builder.where('from', '>=',  fetchInfo.start)
            .where('from', '<=', fetchInfo.end)
            .where('status', 'confirmed')

					let bookingService = new BookingService({ fetch })
					bookingService
						.list({
							page: 1,
              perPage: 500,
              filtersBuilder: builder
						})
						.then((paginatedBookings) => {
							success(
								paginatedBookings.data.map((e) => {
									return {
										id: e.id,
										start: e.from,
										end: e.to,
										resourceIds: [e.placeId],
										allDay: false,
										title: e.place.name,
										editable: canUpdate,
										startEditable: canUpdate,
										durationEditable: canUpdate,
										display: 'auto' as const,
										backgroundColor: undefined,
										textColor: undefined,
										classNames: [],
										styles: [],
										extendedProps: {
											originalBooking: e
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
				bookings = eventCalendar.getEvents().map((e: any) => e.extendedProps.originalBooking)
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
			},
      resourceTimelineWeek: {
        active: selectedView == 'resourceTimelineWeek',
				text: 'Campi',
				click: () => {
					selectedView = 'resourceTimelineWeek'
        }
      }
		},
		headerToolbar: {
			start: 'title',
			center: '',
			end: 'dayGridMonth,timeGridWeek,resourceTimelineWeek today prev,next'
		},
		titleFormat: (start: Date, end: Date) => {
			let startLuxonDate = DateTime.fromJSDate(start).setLocale('it-IT')
			let endLuxonDate = DateTime.fromJSDate(end).setLocale('it-IT')
			if (selectedView === 'timeGridWeek' || selectedView == 'resourceTimelineWeek') {
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
			if (info.view.type !== 'timeGridWeek' && info.view.type !== 'resourceTimelineWeek') {
				selectedDate = info.date
			}
		},
		eventClick: (info: Calendar.EventClickInfo) => {
      if(!!info.event.extendedProps.originalBooking) {
        bookingClick?.({
          booking: info.event.extendedProps.originalBooking as Booking
        })
      }
		},
    resources: places.map((e) => {
      return {
        id: e.id, title: e.name
      }
    }),
		views: {
			timeGridWeek: {
				pointer: true
			},
			dayGridMonth: {
				pointer: true
			},
      resourceTimelineWeek: {
          slotDuration: '00:30',
          slotLabelInterval: '01:00',
          slotMinTime: '09:00',
          slotMaxTime: '21:00'
      }
		},
		dayMaxEvents: true,
		nowIndicator: true,
		selectable: canCreate,
		select: (info: Calendar.SelectInfo) => {
			if (!!club) {
				goto(`/clubs/${club.id}/bookings/new?${qs.stringify({ start: info.start, end: info.end })}`)
			}
		}
	})
</script>

<div class:ec-dark={$theme.dark}>
	<Calendar bind:this={eventCalendar} {plugins} {options} />
</div>
