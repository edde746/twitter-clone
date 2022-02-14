import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { serialize } from "cookie";
import { connect, disconnect, userRepo } from "$lib/redis";
import { errorResponse } from "$lib/utils";

export const post = async ({ request }) => {
  const body = await request.formData();
  const acceptsJson = request.headers.get("accept") == "application/json";
  if (!body.has("email") || !body.has("password")) return { status: 400, body: { error: "Invalid input" } };

  await connect();

  // Fetch user
  const user = await userRepo.search().where("email").eq(body.get("email")).returnFirst();
  await disconnect();

  // Validate credentials
  if (!user || !(await bcrypt.compare(body.get("password"), user.password)))
    return errorResponse(acceptsJson, "Invalid credentials", "/login", 403);

  // Generate and set token
  const token = jwt.sign({ uid: user.entityId }, process.env["JWT_SECRET"]);
  const headers = {
    "set-cookie": serialize("session", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "strict",
      secure: true,
      path: "/",
    }),
  };

  return acceptsJson
    ? { status: 200, headers, body: { success: true, at: user.at } }
    : {
        status: 302,
        headers: { ...headers, Location: "/" },
      };
};
