import jwt from "jsonwebtoken";

export const getSession = async (token) => {
  if (!token) return false;
  try {
    return jwt.verify(token, process.env["JWT_SECRET"]);
  } catch (ex) {
    return false;
  }
};

export const errorResponse = (acceptsJson, message, redirect = '', status = 400) =>
  acceptsJson ? { status, body: { error: message } } : { status: 302, redirect: `${redirect}?error=${message}` };
