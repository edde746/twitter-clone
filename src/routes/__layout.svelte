<script>
  import { toasts, ToastContainer } from "svelte-toasts";
  import Toast from "$lib/Toast.svelte";

  import "../app.css";
</script>

<ToastContainer {toasts} let:data>
  <Toast {data} />
</ToastContainer>
<slot />
