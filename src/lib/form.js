export function enhance(form, { callback }) {
  const onSubmit = async (e) => {
    e.preventDefault();

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
