import jwt from "jsonwebtoken";

export const getSession = async (token) => {
  if (!token) return false;
  try {
    return jwt.verify(token, process.env["JWT_SECRET"]);
  } catch (ex) {
    return false;
  }
};
