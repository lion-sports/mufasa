<script lang="ts">
	import EventGeneral from '$lib/components/events/EventGeneral.svelte'
	import event from '$lib/stores/events/eventShow'
</script>

{#if !!$event}
	<EventGeneral event={$event} />
{/if}
