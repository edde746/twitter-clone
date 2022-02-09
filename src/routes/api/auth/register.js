import { connect, userRepo } from "$lib/redis";
import bcrypt from "bcrypt";

export const post = async ({ request }) => {
  const body = await request.formData();
  await connect();

  // Check for existing user
  const existing = await userRepo.search().where("email").eq(body.get("email")).or("at").eq(body.get("at")).returnAll();
  if (existing.length) return { status: 400, body: { error: "Email or username already in use" } };

  // Save user to database
  await userRepo.save(
    userRepo.createEntity({
      at: body.get("at"),
      email: body.get("email"),
      password: await bcrypt.hash(body.get("password"), 12),
    })
  );

  return { body: { success: true } };
};
