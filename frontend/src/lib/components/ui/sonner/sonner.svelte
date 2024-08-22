<script lang="ts">
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from "svelte-sonner";
	import { mode } from "mode-watcher";

	type $$Props = SonnerProps;
</script>

<Sonner
	theme={$mode}
	class="toaster group md:max-w-[300px]"
  offset="10px"
	toastOptions={{
		classes: {
			toast: `
        group toast group-[.toaster]:bg-[rgb(var(--global-color-background-200))]
        group-[.toaster]:text-[rgb(var(--global-color-contrast-900))] 
        group-[.toaster]:border-border group-[.toaster]:shadow-lg
        md:max-w-[300px]
      `,
			description: "group-[.toast]:text-[rgb(var(--global-color-contrast-700))]",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-[rgb(var(--global-color-contrast-700))]",
		},
	}}
	{...$$restProps}
/>
