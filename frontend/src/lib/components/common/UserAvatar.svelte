<script lang="ts">
	export let username: string,
		description: string = '',
		showTitleAndDescription: boolean = true,
		src: string | undefined,
		avatarTextColor: string | undefined = undefined,
		cursor: string = 'pointer'

	import { DescriptiveAvatar, Avatar, MediaQuery } from '@likable-hair/svelte'
</script>

<MediaQuery let:mAndUp>
	<div style:width="fit-content" style:cursor on:click on:keypress>
		<DescriptiveAvatar
			direction="row"
			title={showTitleAndDescription ? username : undefined}
			description={showTitleAndDescription ? description : undefined}
			src={src || ''}
			width={mAndUp ? undefined : '30px'}
			height={mAndUp ? undefined : '30px'}
			on:click
		>
			<div slot="avatar">
				{#if !!src}
					<Avatar {src} />
				{:else}
					<div
						style:width={'40px'}
						style:height={'40px'}
						style:background-color="rgb(var(--global-color-contrast-400))"
						style:font-size={mAndUp ? '1.2rem' : '1rem'}
						style:font-weight="700"
						style:display="flex"
						style:justify-content="center"
						style:align-items="center"
						style:border-radius="50%"
						style:text-transform="uppercase"
						style:color={avatarTextColor || 'rgb(var(--global-color-background-200))'}
					>
						{username.split(' ')[0]?.substring(0, 1)}{username.split(' ')[1]?.substring(0, 1)}
					</div>
				{/if}
			</div>
		</DescriptiveAvatar>
	</div>
</MediaQuery>
