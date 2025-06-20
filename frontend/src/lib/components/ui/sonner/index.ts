export { default as Toaster } from './sonner.svelte'
import { toast } from 'svelte-sonner'

export function addErrorToast(params: {
  title: string
  options?: NonNullable<Parameters<typeof toast['error']>[1]>
}) {
  toast.error(params.title, {
    classes: {
      toast: '!bg-[rgb(var(--global-color-error-800))]',
      cancelButton: '!bg-[rgb(var(--global-color-error-700))]',
      ...(params.options?.classes || {})
    },
    cancel: {
      label: 'Chiudi',
      ...(params.options?.cancel || {}),
    },
    duration: 100000,
    ...params.options
  })
}

export function addSuccessToast(params: {
  title: string
  options?: NonNullable<Parameters<typeof toast['error']>[1]>
}) {
  toast.success(params.title, {
    classes: {
      toast: '!bg-[rgb(var(--global-color-success-800))] !opacity-100',
      cancelButton: '!bg-[rgb(var(--global-color-success-700))]',
      ...(params.options?.classes || {})
    },
    cancel: {
      label: 'Chiudi',
      ...(params.options?.cancel || {}),
    },
    
    ...params.options
  })
}
