<script context="module">
  import { enhance } from "$lib/form";
  import { goto } from "$app/navigation";
  import { toasts } from "svelte-toasts";

  let form;
</script>

<div class="h-screen flex items-center justify-center p-4 flex-col gap-5">
  <h2 class="text-xl font-semibold text-zinc-500">twitter-clone</h2>
  <form
    bind:this={form}
    action="/api/auth/login"
    method="post"
    class="grid gap-3 w-72"
    use:enhance={{
      callback: async (res) => {
        const body = await res.json();
        if (body.success) {
          toasts.success({
            title: "Logged in",
            description: `Welcome back, ${body.at}!`,
            placement: "top-right",
          });
          goto("/");
        } else {
          toasts.error({
            title: "Error",
            description: body.error,
            placement: "top-right",
          });
          form.reset();
        }
      },
    }}
  >
    <input name="email" placeholder="E-mail" class="field" />
    <input type="password" name="password" placeholder="Password" class="field" />
    <button type="submit" class="btn sky">Sign in</button>
  </form>
  <p>Don't have an account? <a href="/register" class="text-sky-600 hover:underline">Register here</a></p>
</div>
