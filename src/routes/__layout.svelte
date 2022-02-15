<script context="module">
  import { loadSelf } from "../stores/me";
  import { loadTrending } from "../stores/trending";
  import { toasts, ToastContainer } from "svelte-toasts";
  import Toast from "$lib/Toast.svelte";
  import "../app.css";

  export const load = async ({ fetch }) => {
    await loadSelf(fetch);
    await loadTrending(fetch);
    return {};
  };
</script>

<ToastContainer {toasts} placement="top-right" let:data>
  <Toast {data} />
</ToastContainer>
<slot />
