import { writable, get } from "svelte/store";
export const me = writable({});

export const loadSelf = async (fetch) => {
  if (Object.keys(get(me)).length) return;
  return await fetch("/api/me")
    .then((res) => res.json())
    .then((res) => me.set(res));
};
