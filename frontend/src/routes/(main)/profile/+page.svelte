<script lang="ts">
  import user from '$lib/stores/auth/user'
  import AuthService from '$lib/services/auth/auth.service';
	import { goto } from '$app/navigation';

  async function handleReloadClick() {
    let service = new AuthService({ fetch })
    let newUser = await service.me()
    user.set(newUser)
  }

  async function handleLogoutClick() {
    let service = new AuthService({ fetch })
    await service.logout()
    goto('/auth/login')
  }
</script>

<div style:margin-bottom="10px">
  {$user?.firstname} {$user?.lastname} ({$user?.email})
</div>

<button on:click={handleReloadClick}>Reload user</button>
<button on:click={handleLogoutClick}>Logout</button>