<script>
  import { toasts, ToastContainer } from "svelte-toasts";
  import Toast from "$lib/Toast.svelte";

  import "../app.css";
</script>

<ToastContainer {toasts} placement="top-right" let:data>
  <Toast {data} />
</ToastContainer>
<slot />
