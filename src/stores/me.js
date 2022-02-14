import { writable, get } from "svelte/store";
export const me = writable({});

export const loadSelf = async (fetch, force=false) => {
  if (!force && Object.keys(get(me)).length) return;
  return await fetch("/api/me")
    .then((res) => res.json())
    .then((res) => {
      if (res.id) me.set(res);
    });
};
