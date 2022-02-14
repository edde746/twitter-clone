import { parse } from "cookie";
import jwt from "jsonwebtoken";

const verifySession = (token) => {
  try {
    return jwt.verify(token, process.env["JWT_SECRET"]);
  } catch (ex) {
    return null;
  }
};

export const handle = async ({ event, resolve }) => {
  const cookies = parse(event.request.headers.get("cookie") || "");
  event.locals.session = await verifySession(cookies.session);

  const response = await resolve(event);
  return response;
};

export const getSession = async ({ request }) => {
  const cookies = parse(request.headers.get("cookie") || "");
  return verifySession(cookies.session);
};
