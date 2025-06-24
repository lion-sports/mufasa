<script lang="ts">
	import './BookingsCalendar.css'
	import { Calendar, TimeGrid, DayGrid, ResourceTimeline, Interaction } from '@event-calendar/core'
	import { DateTime } from 'luxon'
	import { FilterBuilder, theme } from '@likable-hair/svelte'
	import { goto } from '$app/navigation'
	import qs from 'qs'
	import BookingService, { type Booking } from '@/lib/services/bookings/bookings.service'
	import type { Club } from '@/lib/services/clubs/clubs.service'

	interface Props {
		selectedDate?: Date | undefined
		bookings: Booking[]
    club: Club
		visibleMonth?: number
		visibleYear?: number
		canCreate?: boolean
	}

	let {
		club = $bindable(),
		selectedDate = $bindable(),
		bookings = $bindable(),
		visibleMonth = $bindable(DateTime.now().get('month') - 1),
		visibleYear = $bindable(DateTime.now().get('year')),
		canCreate = false
	}: Props = $props()

	let eventCalendar: Calendar | undefined = $state()
	let plugins = [TimeGrid, DayGrid, Interaction, ResourceTimeline]
	let selectedView: string = $state('dayGridMonth')

  $effect(() => {
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
		view: 'timeGridWeek',
      headerToolbar: {
          start: 'prev,next today',
          center: 'title',
          end: 'dayGridMonth,timeGridWeek,timeGridDay resourceTimelineWeek'
      },
      scrollTime: '09:00:00',
      events: createEvents(),
      resources: [
                  {id: 1, title: 'Resource A'},
                  {id: 2, title: 'Resource B'},
                  {id: 3, title: 'Resource C'},
                  {id: 4, title: 'Resource D'},
                  {id: 5, title: 'Resource E'},
                  {id: 6, title: 'Resource F'},
                  {id: 7, title: 'Resource G'},
                  {id: 8, title: 'Resource H'},
                  {id: 9, title: 'Resource I', children: [
                      {id: 10, title: 'Resource J'},
                      {id: 11, title: 'Resource K'},
                      {id: 12, title: 'Resource L', children: [
                          {id: 13, title: 'Resource M'},
                          {id: 14, title: 'Resource N'},
                          {id: 15, title: 'Resource O'}
                      ]}
                  ]}
              ],
      views: {
          timeGridWeek: {pointer: true},
          resourceTimeGridWeek: {pointer: true},
          resourceTimelineWeek: {
              slotDuration: '00:15',
              slotLabelInterval: '01:00',
              slotMinTime: '09:00',
              slotMaxTime: '21:00',
              slotWidth: 16
          }
      },
      dayMaxEvents: true,
      nowIndicator: true,
      selectable: true
	})

  function createEvents(): any {
        let days = [];
        for (let i = 0; i < 7; ++i) {
            let day = new Date();
            let diff = i - day.getDay();
            day.setDate(day.getDate() + diff);
            days[i] = day.getFullYear() + "-" + _pad(day.getMonth()+1) + "-" + _pad(day.getDate());
        }

        return [
            {start: days[0] + " 00:00", end: days[0] + " 09:00", resourceId: 1, display: "background"},
            {start: days[1] + " 12:00", end: days[1] + " 14:00", resourceId: 2, display: "background"},
            {start: days[2] + " 17:00", end: days[2] + " 24:00", resourceId: 1, display: "background"},
            {start: days[0] + " 10:00", end: days[0] + " 14:00", resourceId: 1, title: "The calendar can display background and regular events", color: "#FE6B64"},
            {start: days[1] + " 16:00", end: days[2] + " 08:00", resourceId: 2, title: "An event may span to another day", color: "#B29DD9"},
            {start: days[2] + " 09:00", end: days[2] + " 13:00", resourceId: 2, title: "Events can be assigned to resources and the calendar has the resources view built-in", color: "#779ECB"},
            {start: days[3] + " 14:00", end: days[3] + " 20:00", resourceId: 1, title: "", color: "#FE6B64"},
            {start: days[3] + " 15:00", end: days[3] + " 18:00", resourceId: 1, title: "Overlapping events are positioned properly", color: "#779ECB"},
            {start: days[5] + " 10:00", end: days[5] + " 16:00", resourceId: 2, title: {html: "You have complete control over the <i><b>display</b></i> of events…"}, color: "#779ECB"},
            {start: days[5] + " 14:00", end: days[5] + " 19:00", resourceId: 2, title: "…and you can drag and drop the events!", color: "#FE6B64"},
            {start: days[5] + " 18:00", end: days[5] + " 21:00", resourceId: 2, title: "", color: "#B29DD9"},
            {start: days[1], end: days[3], resourceId: 1, title: "All-day events can be displayed at the top", color: "#B29DD9", allDay: true}
        ];
    }

    function _pad(num: number) {
        let norm = Math.floor(Math.abs(num));
        return (norm < 10 ? '0' : '') + norm;
    }
</script>

<div class:ec-dark={$theme.dark}>
  <Calendar {plugins} {options} />
</div>
