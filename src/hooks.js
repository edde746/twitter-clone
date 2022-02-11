import { parse } from "cookie";
import { getSession as sessionFromCookies } from "$lib/utils";

export const getSession = async ({ request }) => {
  const cookies = parse(request.headers.get("cookie") || "");
  const session = await sessionFromCookies(cookies.session);

  return session ? session : false;
};
