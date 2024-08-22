<script lang="ts">
	import type { EventToResultType } from "@/lib/services/scouts/volleyball"
	import StudioPlayerActionButton from "./StudioPlayerActionButton.svelte"
  import { toast } from "svelte-sonner";
	import { createEventDispatcher } from "svelte"

  export let selectedCategory: 'serve' | 'receive' | 'spike' | 'block' | undefined = undefined,
    opponent: boolean = false

  let dispatch = createEventDispatcher<{
    'serve': {
      result: EventToResultType['serve']
    },
    'spike': {
      result: EventToResultType['spike']
    },
    'block': {
      result: EventToResultType['block']
    },
    'receive': {
      result: EventToResultType['receive']
    }
  }>()

  function toggleCategory(category: typeof selectedCategory) {
    if(selectedCategory == category) selectedCategory = undefined
    else selectedCategory = category
  }

  const textErrorClass = '!text-red-500'
  const textSuccessClass = '!text-green-500'
  const textNeutralClass = ''

  const mapper: {
    [EventType in keyof EventToResultType]: {
      [ResultType in EventToResultType[EventType]]: {
        title: string,
        description: string,
        descriptionClass: string
      }
    }
  } = {
    serve: {
      error: {
        title: 'Battuta',
        description: 'Errore',
        descriptionClass: textErrorClass
      },
      received: {
        title: 'Battuta',
        description: 'Ricevuta',
        descriptionClass: textNeutralClass
      },
      point: {
        title: 'Battuta',
        description: 'Punto',
        descriptionClass: textSuccessClass
      },
    },
    spike: {
      error: {
        title: 'Attacco',
        description: 'Errore',
        descriptionClass: textErrorClass
      },
      defense: {
        title: 'Attacco',
        description: 'Difeso',
        descriptionClass: textNeutralClass
      },
      point: {
        title: 'Attacco',
        description: 'Punto',
        descriptionClass: textSuccessClass
      },
    },
    block: {
      handsOut: {
        title: 'Muro',
        description: 'Mani out',
        descriptionClass: textErrorClass
      },
      touch: {
        title: 'Muro',
        description: 'Tocco',
        descriptionClass: textNeutralClass
      },
      putBack: {
        title: 'Muro',
        description: 'Tocco e ritorno',
        descriptionClass: textNeutralClass
      },
      point: {
        title: 'Muro',
        description: 'Punto',
        descriptionClass: textSuccessClass
      },
    },
    receive: {
      'x': {
        title: 'Ricezione',
        description: 'Errore',
        descriptionClass: textErrorClass
      },
      '/': {
        title: 'Ricezione',
        description: 'Slash',
        descriptionClass: textNeutralClass
      },
      '-': {
        title: 'Ricezione',
        description: 'Meno',
        descriptionClass: textNeutralClass
      },
      '+': {
        title: 'Ricezione',
        description: 'Più',
        descriptionClass: textSuccessClass
      },
      '++': {
        title: 'Ricezione',
        description: 'Perfetta',
        descriptionClass: textSuccessClass
      },
    }
  }

  function triggerEvent<
    Category extends keyof EventToResultType
  >(
    category: Category, event: EventToResultType[Category]
  ) {
    showToast(category, event)
    // @ts-ignore
    dispatch(category, { result: event })
  }

  function showToast<
    Category extends keyof EventToResultType
  >(category: Category, event: EventToResultType[Category]) {
    let mappedCategory = mapper[category]
    let mappedEvent = mappedCategory[event]

    toast(mappedEvent.title, {
      description: mappedEvent.description,
      descriptionClass: mappedEvent.descriptionClass,
      cancel: {
        label: 'Chiudi'
      },
    })
  }
</script>

<div 
  class="grid grid-cols-2 gap-2"
  style:--selected-background-color={opponent ? '#ef4444' : '#3b82f6'}
  style:--selected-color={'white'}
  style:--hover-background-color={opponent ? '#fca5a51f' : '#93c5fd1f'}
>
  <div class="flex flex-col gap-1 @4xl:hidden">
    <button 
      class="category-button text-left p-3 rounded-md w-full hover:bg-[var(--hover-background-color)] bg-[var(--background-color)] text-lg font-medium"
      class:selected={selectedCategory == 'serve'}
      on:click={() => triggerEvent('serve', 'error')}
    >Battuta</button>
    <button 
      class="category-button text-left p-3 rounded-md w-full hover:bg-[var(--hover-background-color)] bg-[var(--background-color)] text-lg font-medium"
      class:selected={selectedCategory == 'receive'}
      on:click={() => toggleCategory('receive')}
    >Ricezione</button>
    <button 
      class="category-button text-left p-3 rounded-md w-full hover:bg-[var(--hover-background-color)] bg-[var(--background-color)] text-lg font-medium"
      class:selected={selectedCategory == 'spike'}
      on:click={() => toggleCategory('spike')}
    >Attacco</button>
    <button 
      class="category-button text-left p-3 rounded-md w-full hover:bg-[var(--hover-background-color)] bg-[var(--background-color)] text-lg font-medium"
      class:selected={selectedCategory == 'block'}
      on:click={() => toggleCategory('block')}
    >Muro</button>
  </div>
  <div class="flex flex-col gap-2 @4xl:hidden">
    {#if selectedCategory == 'serve'}
      <StudioPlayerActionButton
        icon="mdi-close"
        progress={10}
        --icon-color="#ef444470"
        --circular-progress-indicator-color="#ef444470"
        on:click={() => triggerEvent('serve', 'error')}
      >Errore</StudioPlayerActionButton>
      <StudioPlayerActionButton
        icon="mdi-minus"
        progress={50}
        --icon-color="#f59e0b70"
        --circular-progress-indicator-color="#f59e0b70"
      >Ricevuta</StudioPlayerActionButton>
      <StudioPlayerActionButton
        icon="mdi-check"
        progress={100}
        --icon-color="#22c55e70"
        --circular-progress-indicator-color="#22c55e70"
      >Punto</StudioPlayerActionButton>
    {:else if selectedCategory == 'spike'}
      <StudioPlayerActionButton
        icon="mdi-close"
        progress={10}
        --icon-color="#ef444470"
        --circular-progress-indicator-color="#ef444470"
        on:click={() => triggerEvent('spike', 'error')}
      >Errore</StudioPlayerActionButton>
      <StudioPlayerActionButton
        icon="mdi-minus"
        progress={50}
        --icon-color="#f59e0b70"
        --circular-progress-indicator-color="#f59e0b70"
        on:click={() => triggerEvent('spike', 'defense')}
      >Difeso</StudioPlayerActionButton>
      <StudioPlayerActionButton
        icon="mdi-check"
        progress={100}
        --icon-color="#22c55e70"
        --circular-progress-indicator-color="#22c55e70"
        on:click={() => triggerEvent('spike', 'point')}
      >Punto</StudioPlayerActionButton>
    {:else if selectedCategory == 'block'}
      <StudioPlayerActionButton
        icon="mdi-close"
        progress={25}
        --icon-color="#ef444470"
        --circular-progress-indicator-color="#ef444470"
      >Mani out</StudioPlayerActionButton>
      <StudioPlayerActionButton
        icon="mdi-hand-back-left"
        progress={50}
        --icon-color="#f9731670"
        --circular-progress-indicator-color="#f9731670"
      >Tocco</StudioPlayerActionButton>
      <StudioPlayerActionButton
        icon="mdi-redo"
        progress={75}
        --icon-color="#f59e0b70"
        --circular-progress-indicator-color="#f59e0b70"
      >Tocco e ritorno</StudioPlayerActionButton>
      <StudioPlayerActionButton
        icon="mdi-plus"
        progress={100}
        --icon-color="#22c55e70"
        --circular-progress-indicator-color="#22c55e70"
      >Punto</StudioPlayerActionButton>
    {:else if selectedCategory == 'receive'}
      <StudioPlayerActionButton
        icon="mdi-close"
        progress={20}
        --icon-color="#ef444470"
        --circular-progress-indicator-color="#ef444470"
        on:click={() => triggerEvent('receive', 'x')}
      >Errore</StudioPlayerActionButton>
      <StudioPlayerActionButton
        icon="mdi-slash-forward"
        progress={40}
        --icon-color="#f9731670"
        --circular-progress-indicator-color="#f9731670"
        on:click={() => triggerEvent('receive', '/')}
      >Slash</StudioPlayerActionButton>
      <StudioPlayerActionButton
        icon="mdi-minus"
        progress={60}
        --icon-color="#f59e0b70"
        --circular-progress-indicator-color="#f59e0b70"
        on:click={() => triggerEvent('receive', '-')}
      >Meno</StudioPlayerActionButton>
      <StudioPlayerActionButton
        icon="mdi-plus"
        progress={80}
        --icon-color="#22c55e70"
        --circular-progress-indicator-color="#22c55e70"
        on:click={() => triggerEvent('receive', '+')}
      >Più</StudioPlayerActionButton>
      <StudioPlayerActionButton
        icon="mdi-plus-thick"
        progress={100}
        --icon-color="#22c55e70"
        --circular-progress-indicator-color="#22c55e70"
        on:click={() => triggerEvent('receive', '++')}
      >Perfetta</StudioPlayerActionButton>
    {/if}
  </div>
  <div class="hidden @4xl:block">
    <div class="flex flex-col gap-4">
      <div>
        <div class="flex justify-center items-center w-full">
          <div class="subheading relative text-center font-light text-sm ml-2 mt-3">Battuta</div>
        </div>
        <div class="grid grid-cols-1 @5xl:grid-cols-2">
          <StudioPlayerActionButton
            icon="mdi-close"
            progress={10}
            --icon-color="#ef444470"
            --circular-progress-indicator-color="#ef444470"
            on:click={() => triggerEvent('serve', 'error')}
          >Errore</StudioPlayerActionButton>
          <StudioPlayerActionButton
            icon="mdi-minus"
            progress={50}
            --icon-color="#f59e0b70"
            --circular-progress-indicator-color="#f59e0b70"
            on:click={() => triggerEvent('serve', 'received')}
          >Ricevuta</StudioPlayerActionButton>
          <StudioPlayerActionButton
            icon="mdi-check"
            progress={100}
            --icon-color="#22c55e70"
            --circular-progress-indicator-color="#22c55e70"
            on:click={() => triggerEvent('serve', 'point')}
          >Punto</StudioPlayerActionButton>
        </div>
      </div>
      <div>
        <div class="flex justify-center items-center w-full">
          <div class="subheading relative text-center font-light text-sm mb-1 ml-2 mt-1">Muro</div>
        </div>
        <div class="grid grid-cols-1 @5xl:grid-cols-2">
          <StudioPlayerActionButton
            icon="mdi-close"
            progress={25}
            --icon-color="#ef444470"
            --circular-progress-indicator-color="#ef444470"
            on:click={() => triggerEvent('block', 'handsOut')}
          >Mani out</StudioPlayerActionButton>
          <StudioPlayerActionButton
            icon="mdi-hand-back-left"
            progress={50}
            --icon-color="#f9731670"
            --circular-progress-indicator-color="#f9731670"
            on:click={() => triggerEvent('block', 'touch')}
          >Tocco</StudioPlayerActionButton>
          <StudioPlayerActionButton
            icon="mdi-redo"
            progress={75}
            --icon-color="#f59e0b70"
            --circular-progress-indicator-color="#f59e0b70"
            on:click={() => triggerEvent('block', 'putBack')}
          >Tocco e ritorno</StudioPlayerActionButton>
          <StudioPlayerActionButton
            icon="mdi-plus"
            progress={100}
            --icon-color="#22c55e70"
            --circular-progress-indicator-color="#22c55e70"
            on:click={() => triggerEvent('block', 'point')}
          >Punto</StudioPlayerActionButton>
        </div>
      </div>
    </div>
  </div>
  <div class="hidden @4xl:block">
    <div class="flex flex-col gap-2">
      <div>
        <div class="flex justify-center items-center w-full">
          <div class="subheading relative text-center font-light text-sm ml-2 mt-3">Ricezione</div>
        </div>
        <div class="grid grid-cols-1 @5xl:grid-cols-2">
          <StudioPlayerActionButton
            icon="mdi-close"
            progress={20}
            --icon-color="#ef444470"
            --circular-progress-indicator-color="#ef444470"
            on:click={() => triggerEvent('receive', 'x')}
          >Errore</StudioPlayerActionButton>
          <StudioPlayerActionButton
            icon="mdi-slash-forward"
            progress={40}
            --icon-color="#f9731670"
            --circular-progress-indicator-color="#f9731670"
            on:click={() => triggerEvent('receive', '/')}
          >Slash</StudioPlayerActionButton>
          <StudioPlayerActionButton
            icon="mdi-minus"
            progress={60}
            --icon-color="#f59e0b70"
            --circular-progress-indicator-color="#f59e0b70"
            on:click={() => triggerEvent('receive', '-')}
          >Meno</StudioPlayerActionButton>
          <StudioPlayerActionButton
            icon="mdi-plus"
            progress={80}
            --icon-color="#22c55e70"
            --circular-progress-indicator-color="#22c55e70"
            on:click={() => triggerEvent('receive', '+')}
          >Più</StudioPlayerActionButton>
          <StudioPlayerActionButton
            icon="mdi-plus-thick"
            progress={100}
            --icon-color="#22c55e70"
            --circular-progress-indicator-color="#22c55e70"
            on:click={() => triggerEvent('receive', '++')}
          >Perfetta</StudioPlayerActionButton>
        </div>
      </div>
      <div>
        <div class="flex justify-center items-center w-full">
          <div class="subheading relative text-center font-light text-sm mb-1 ml-2 mt-1">Attacco</div>
        </div>
        <div class="grid grid-cols-1 @5xl:grid-cols-2">
          <StudioPlayerActionButton
            icon="mdi-close"
            progress={10}
            --icon-color="#ef444470"
            --circular-progress-indicator-color="#ef444470"
            on:click={() => triggerEvent('spike', 'error')}
          >Errore</StudioPlayerActionButton>
          <StudioPlayerActionButton
            icon="mdi-minus"
            progress={50}
            --icon-color="#f59e0b70"
            --circular-progress-indicator-color="#f59e0b70"
            on:click={() => triggerEvent('spike', 'defense')}
          >Difeso</StudioPlayerActionButton>
          <StudioPlayerActionButton
            icon="mdi-check"
            progress={100}
            --icon-color="#22c55e70"
            --circular-progress-indicator-color="#22c55e70"
            on:click={() => triggerEvent('spike', 'point')}
          >Punto</StudioPlayerActionButton>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .category-button {
    transition: all .2s cubic-bezier(0.075, 0.82, 0.165, 1);
  }

  .selected {
    --background-color: var(--selected-background-color);
    --hover-background-color: var(--selected-background-color);
    color: var(--selected-color)
  }

  .subheading::before {
    content: '';
    position: absolute;
    height: 4px;
    left: -12px;
    right: -12px;
    border-radius: 9999px;
    top: -8px;
    background-color: var(--selected-background-color);
  }
</style>