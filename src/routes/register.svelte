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
    action="/api/auth/register"
    method="post"
    class="grid gap-3 w-72"
    use:enhance={{
      callback: async (res) => {
        const body = await res.json();
        if (body.success) {
          toasts.success({
            title: "Registered",
            description: "Please sign in to continue",
          });
          goto("/login");
        } else {
          toasts.error({
            title: "Error",
            description: body.error,
          });
          form.reset();
        }
      },
    }}
  >
    <input name="at" placeholder="Handle" class="field" />
    <input name="email" placeholder="E-mail" class="field" />
    <input type="password" name="password" placeholder="Password" class="field" />
    <button type="submit" class="btn sky">Register</button>
  </form>
  <p>Already have an account? <a href="/login" class="text-sky-600 hover:underline">Sign in here</a></p>
</div>
