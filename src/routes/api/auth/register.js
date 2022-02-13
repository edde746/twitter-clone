import { connect, disconnect, userRepo } from "$lib/redis";
import { errorResponse } from "$lib/utils";
import bcrypt from "bcrypt";

export const post = async ({ request }) => {
  const body = await request.formData();
  const acceptsJson = request.headers.get("accept") == "application/json";
  await connect();

  // Check for existing user
  const existing = await userRepo.search().where("email").eq(body.get("email")).or("at").eq(body.get("at")).returnAll();
  if (existing.length) {
    await disconnect();
    return errorResponse(acceptsJson, "Email or username already in use", "/register");
  }

  // Save user to database
  await userRepo.save(
    userRepo.createEntity({
      at: body.get("at"),
      email: body.get("email"),
      password: await bcrypt.hash(body.get("password"), 12),
    })
  );

  await disconnect();
  return acceptsJson ? { body: { success: true } } : { body: { status: 302, redirect: "/login" } };
};
