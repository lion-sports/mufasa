<script lang="ts">
  import user from '$lib/stores/auth/user'
</script>

<h1>Welcome to {$user?.email}</h1>
<p>Visit <a href="/profile">profile</a></p>
