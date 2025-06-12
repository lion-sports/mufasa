export { default as Toaster } from './sonner.svelte'
import { toast } from 'svelte-sonner'

export function addErrorToast(params: {
  title: string
  options?: NonNullable<Parameters<typeof toast['error']>[1]>
}) {
  toast.error(params.title, {
    classes: {
      toast: '!bg-[rgb(var(--global-color-error-500),.5)]',
      cancelButton: '!bg-[rgb(var(--global-color-error-400))]',
      ...(params.options?.classes || {})
    },
    cancel: {
      label: 'Chiudi',
      ...(params.options?.cancel || {}),
    },
    ...params.options
  })
}

export function addSuccessToast(params: {
  title: string
  options?: NonNullable<Parameters<typeof toast['error']>[1]>
}) {
  toast.success(params.title, {
    classes: {
      toast: '!bg-[rgb(var(--global-color-success-500),.5)]',
      cancelButton: '!bg-[rgb(var(--global-color-success-400))] !text-black',
      ...(params.options?.classes || {})
    },
    cancel: {
      label: 'Chiudi',
      ...(params.options?.cancel || {}),
    },
    ...params.options
  })
}
