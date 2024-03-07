<script lang="ts">
	let clazz: string = ''
	export { clazz as class }
	export let collapsed: boolean = false
</script>

<svg
	width={!collapsed ? 432 : 120}
	height="120"
	viewBox={!collapsed ? '0 0 432 120' : '0 0 120 120'}
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	class="{clazz || ''} logo"
	class:collapsed
>
	<g clip-path="url(#clip0_48_3)">
		<path d="M103.923 90L51.9615 120L0 90V30L103.923 90Z" fill="#1498D5" />
		<path d="M0 90V30L51.9615 60L0 90Z" fill="#72C1E6" />
		<path d="M51.9615 0L103.923 30V90L0 30L51.9615 0Z" fill="#B8E0F2" />
		<rect
			x="161.417"
			y="36.1932"
			width="6"
			height="25.4284"
			rx="3"
			transform="rotate(-20 161.417 36.1932)"
			fill="#143342"
			class="logo-text"
		/>
		<rect
			x="133"
			y="36.0293"
			width="6"
			height="24.0448"
			rx="3"
			transform="rotate(-20 133 36.0293)"
			fill="#143342"
			class="logo-text"
		/>
		<rect
			width="6"
			height="44.5802"
			rx="3"
			transform="matrix(-0.939693 -0.34202 -0.34202 0.939693 168.581 36.239)"
			fill="#143342"
			class="logo-text"
		/>
		<rect
			width="6"
			height="44.644"
			rx="3"
			transform="matrix(-0.939693 -0.34202 -0.34202 0.939693 197.363 36.1932)"
			fill="#143342"
			class="logo-text"
		/>
		<rect
			width="6"
			height="38"
			rx="3"
			transform="matrix(1 0 0 -1 221 76)"
			fill="#143342"
			class="logo-text"
		/>
		<rect
			width="6"
			height="25"
			rx="3"
			transform="matrix(0 -1 -1 0 257 44)"
			fill="#143342"
			class="logo-text"
		/>
		<rect
			width="6"
			height="25"
			rx="3"
			transform="matrix(0 -1 -1 0 257 76)"
			fill="#143342"
			class="logo-text"
		/>
		<rect
			width="6"
			height="19"
			rx="3"
			transform="matrix(0 -1 -1 0 250 60)"
			fill="#143342"
			class="logo-text"
		/>
		<rect
			width="6"
			height="38"
			rx="3"
			transform="matrix(1 0 0 -1 281 76)"
			fill="#143342"
			class="logo-text"
		/>
		<rect
			width="6"
			height="25"
			rx="3"
			transform="matrix(0 -1 -1 0 317 44)"
			fill="#143342"
			class="logo-text"
		/>
		<rect
			width="6"
			height="25"
			rx="3"
			transform="matrix(0 -1 -1 0 317 76)"
			fill="#143342"
			class="logo-text"
		/>
		<rect
			width="6"
			height="19"
			rx="3"
			transform="matrix(0 -1 -1 0 310 60)"
			fill="#143342"
			class="logo-text"
		/>
		<rect
			width="6"
			height="56.3625"
			rx="3"
			transform="matrix(0.707107 0.707107 0.707107 -0.707107 338 73.8543)"
			fill="#143342"
			class="logo-text"
		/>
		<rect
			width="6"
			height="22"
			rx="3"
			transform="matrix(1 0 0 -1 339 57.8261)"
			fill="#143342"
			class="logo-text"
		/>
		<rect
			x="365"
			y="63.0687"
			width="6"
			height="20.923"
			rx="3"
			transform="rotate(-45 365 63.0687)"
			fill="#143342"
			class="logo-text"
		/>
		<rect
			width="4.5"
			height="9"
			rx="2.25"
			transform="matrix(-0.0871557 0.996195 0.996195 0.0871557 402.392 70)"
			fill="#143342"
			class="logo-text"
		/>
		<rect
			width="4.5"
			height="9"
			rx="2.25"
			transform="matrix(-0.0871557 0.996195 0.996195 0.0871557 421.4 35)"
			fill="#143342"
			class="logo-text"
		/>
		<path
			d="M416.645 39.1667C414.857 39.1667 412.841 39.4444 411.5 40C409.405 40.8764 408 42.7351 408 45C408 46 408.487 47.255 409 48C409.526 48.7323 410 49 411 49.5C411.815 49.9798 412.606 50.1843 413.5 50.5C414.394 50.803 416.251 51.3106 417 51.5L420.5 52.5C421.552 52.7652 423.5 53.5 424.5 54C425.5 54.5 425.908 54.6053 427.1 55.4C428.6 56.4 429.724 57.3485 430.5 58.5985C431.276 59.8485 431.746 61.8939 431.746 63.7121C431.746 65.8081 430.644 68.1944 429.5 69.8864C428.369 71.5783 426.498 72.5063 424.315 73.5038C422.146 74.5013 419.511 75 416.408 75C412.622 75 412.622 70.7576 416.408 70.7576C418.275 70.7576 419.951 70.4672 421.437 69.8864C422.922 69.2929 424.099 68.4722 424.966 67.4242C425.834 66.3636 426.268 65.1263 426.268 63.7121C426.268 62.4242 425.893 61.3763 425.144 60.5682C424.394 59.7601 423.408 59.1035 422.186 58.5985C420.963 58.0934 419.642 57.6515 418.223 57.2727L411.952 55.5C408.797 54.6288 407.028 53.6616 405.187 52.0455C403.347 50.4293 402.5 48.1136 402.5 45.5C402.5 43.3283 402.777 41.6162 404 40C405.236 38.3712 405.977 37.5117 408 36.5C410 35.5 413.923 35 416.5 35C419.339 35 419.585 39.1667 416.645 39.1667Z"
			fill="#143342"
			class="logo-text"
		/>
	</g>
	<defs>
		<clipPath id="clip0_48_3">
			<rect width="432" height="120" fill="white" />
		</clipPath>
	</defs>
</svg>

<style>
	.logo {
		height: auto;
		width: var(--application-logo-width, 230px);
	}

	.logo.collapsed {
		height: auto;
		width: 30px;
	}

	.logo-text {
		fill: rgb(var(--global-color-contrast-900));
	}
</style>
