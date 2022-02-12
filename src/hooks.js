import { parse } from "cookie";
import { getSession as sessionFromCookies } from "$lib/utils";
import { disconnect } from "$lib/redis";

export const handle = async ({ event, resolve }) => {
  const cookies = parse(event.request.headers.get("cookie") || "");
  event.locals.session = await sessionFromCookies(cookies.session);

  const response = await resolve(event);
  await disconnect();
  return response;
};

export const getSession = async ({ request }) => {
  const cookies = parse(request.headers.get("cookie") || "");
  const session = await sessionFromCookies(cookies.session);
  return session ? session : false;
};
