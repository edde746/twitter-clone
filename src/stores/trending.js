import { writable, get } from "svelte/store";
export const trending = writable({});

export const loadTrending = async (fetch, force = false) => {
  if (!force && Object.keys(get(trending)).length) return;
  return await fetch("/api/trending")
    .then((res) => res.json())
    .then((res) => {
      if (res.trending) trending.set(res);
    });
};
