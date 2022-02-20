export function enhance(form, { callback, check }) {
  const onSubmit = async (e) => {
    e.preventDefault();

    if (check && !check()) return;

    const res = await fetch(form.action, {
      method: form.method,
      headers: {
        accept: "application/json",
      },
      body: new FormData(form),
    });

    callback(res);
  };

  form.addEventListener("submit", onSubmit);

  return {
    destroy() {
      form.removeEventListener("submit", onSubmit);
    },
  };
}
