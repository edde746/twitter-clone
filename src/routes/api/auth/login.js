import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { serialize } from "cookie";
import { connect, userRepo } from "$lib/redis";

export const post = async ({ request }) => {
  const body = await request.formData();
  await connect();

  // Fetch user
  const user = await userRepo.search().where("email").eq(body.get("email")).returnFirst();
  if (!user) return { status: 403, body: { error: "Invalid credentials" } };

  // Validate password
  if (!(await bcrypt.compare(body.get("password"), user.password)))
    return { status: 403, body: { error: "Invalid credentials" } };

  // Generate and set token
  const token = jwt.sign({ uid: user.entityId }, process.env["JWT_SECRET"]);
  return {
    status: 302,
    redirect: "/",
    headers: {
      "set-cookie": serialize("session", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "strict",
        secure: true,
      }),
    },
  };
};
