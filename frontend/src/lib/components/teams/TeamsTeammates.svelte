<script lang="ts" context="module">
	import type { Teammate } from '$lib/services/teams/teams.service'
</script>

<script lang="ts">
	export let teammates: Teammate[]

	import Subhead from '../typography/Subhead.svelte'
</script>

<div style:margin-bottom="10px">
	<Subhead text="Inviti sospesi" />
</div>

<div style:margin-top="20px" style:margin-bottom="10px">
	<Subhead text="Partecipanti" />
</div>
