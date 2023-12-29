<script lang="ts">
  import AuthService from '$lib/services/auth/auth.service'
  import { goto } from '$app/navigation';
  import logo from '$lib/assets/logo.jpg'
  import colors from '$lib/stores/colors'
  let 
    email: string = "", 
    password: string = "", 
    error: boolean = false,
    errorMessage: string | undefined = undefined,
    loading: boolean = false;

  function login() {
    error = false
    errorMessage = undefined
    loading = true

    const service = new AuthService({ fetch })
    service.login({
      data: {
        email,
        password
      }
    }).then(() => {
      goto('/')
    }).catch((err) => {
      if(!!err.message && err.message.includes('E_INVALID_AUTH_PASSWORD')) {
        errorMessage = 'Credenziali errate'
      } else if(!!err.message && err.message.includes('E_ROW_NOT_FOUND')) {
        errorMessage = 'Sembra che l\'utenta non esista'
      } else {
        errorMessage = 'Ops, qualcosa è andato storto'
      }

      error = true
    }).finally(() => {
      loading = false
    })
  }

  import StandardButton from '$lib/components/common/StandardButton.svelte';
  import LabelAndTextfield from '$lib/components/common/LabelAndTextfield.svelte';
</script>

<div
  class="card-container"
  style:background-color={$colors.thinContrast}

>
<img 
    style:position="absolute"
    style:height="100vh"
    style:object-fit="cover"
    style:z-index="0"
    style:opacity="40%"
    src={logo} 
    alt="logo" 
  />
  <div
    class="card"
    style:z-index="20"
  >
    <div class="text-2xl mb-2">Log in</div>
    <hr />
    <form
      style:margin-top="20px"
    >
      <div>
        <LabelAndTextfield
          label="Email o Username"
          placeholder="email o username"
          name="email"
          class={{
            label: 'box-border w-full',
            input: {
              container: '!box-border !w-full'
            }
          }}
          bind:value={email}
          error={error}
        ></LabelAndTextfield>
      </div>
      <div style:margin-top="10px">
        <LabelAndTextfield
          label="Password"
          name="password"
          type="password"
          class={{
            label: 'box-border w-full',
            input: {
              container: '!box-border !w-full'
            }
          }}
          bind:value={password}
          error={error}
        ></LabelAndTextfield>
      </div>
    </form>
    {#if error}
      <div
        style:margin-top="20px"
        style:margin-bottom="20px"
        style:text-align="center"
        style:color="rgb(var(--global-color-error-400))"
      >
        {errorMessage}
      </div>
    {/if}
    <div
      style:margin-top="20px"
      style:margin-bottom="20px"
    >
      <StandardButton
        on:click={login}
        loading={loading}
        --button-width="100%"
        class="mt-3"
      >Login</StandardButton>
    </div>
  </div>
</div>

<style>
  .card-container {
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-color: rgb(var(--global-color-background-200));
  }

  .card {
    padding: 10px 20px 10px 20px;
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
    border-radius: 10px;
    box-sizing: border-box;
    z-index: 20;
    background-color: rgb(var(--global-color-background-100));
  }

  @media (min-width: 425px) {
    .card {
      max-width: 90vw;
      width: 300px;
    }
  }

  @media (max-width: 424.98px){
    .card {
      width: 100vw;
      height: 100vh;
      border-radius: 0px;
      overflow: auto;
    }
  }
</style>