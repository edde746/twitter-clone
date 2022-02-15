<script context="module">
  import { me, loadSelf } from "../stores/me";
  import { get } from "svelte/store";

  export const load = async ({ session }) => {
    if (!session && !Object.keys(get(me)).length) return { status: 302, redirect: "/login" };
    return {};
  };
</script>

<script>
  import Interface from "$lib/Interface.svelte";
  import { toasts } from "svelte-toasts";
  import { enhance } from "$lib/form";
</script>

<svelte:head>
  <title>Settings</title>
</svelte:head>

<Interface>
  <div class="border-x border-slate-300 divide-y divide-slate-300 min-h-screen">
    <div class="px-4 py-8">
      <h1 class="text-2xl font-semibold">Settings</h1>
      <p class="text-slate-500">Adjust account settings</p>
    </div>
    <form
      class="p-4 grid gap-3"
      action="/api/settings"
      method="post"
      use:enhance={{
        callback: async (res) => {
          const body = await res.json();
          if (body.success) {
            toasts.success({
              title: "Success",
              description: "Settings saved",
            });
            loadSelf(fetch, true);
          } else {
            toasts.error({
              title: "Error",
              description: body.error,
            });
          }
        },
      }}
    >
      <div class="grid grid-cols-2 gap-3">
        <p>Email</p>
        <input type="text" name="email" class="field border border-slate-300" value={$me.email} />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <p>Password <span class="text-slate-400 text-sm">(leave empty for no change)</span></p>
        <input type="password" name="password" class="field border border-slate-300" />
      </div>
      <div class="flex justify-end">
        <button type="submit" class="btn sky">Save</button>
      </div>
    </form>
  </div>
</Interface>
