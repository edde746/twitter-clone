import { connect, userRepo } from "$lib/redis";
import { s3 } from "$lib/utils";
import Jimp from "jimp";

export const get = async ({ locals }) => {
  if (!locals.session) return { status: 403, body: { error: "Not authorized" } };

  await connect();
  const user = await userRepo.fetch(locals.session.uid);
  return { body: { id: user.entityId, at: user.at, email: user.email, avatar: user.avatar || "/images/default.png" } };
};

export const post = async ({ request, url, locals }) => {
  const body = await request.formData();
  if (!locals.session) return { status: 403, body: { error: "Not signed in" } };
  if (body.has("bio") && body.get("bio").length > 64) return { status: 400, body: { error: "Invalid input" } };

  await connect();
  const user = await userRepo.fetch(locals.session.uid);
  if (url.searchParams.has("bio")) {
    user.bio = body.get("bio");
  } else if (url.searchParams.has("avatar")) {
    const avatar = await body.get("avatar").arrayBuffer();
    const uploaded = await s3
      .upload({
        Bucket: process.env["AWS_BUCKET_NAME"],
        Body: await Jimp.read(avatar).then((img) => img.cover(256, 256).getBufferAsync(Jimp.MIME_PNG)),
        Key: user.entityId + ".webp",
      })
      .promise();
    if (uploaded) user.avatar = uploaded.Location + `?r=${Math.random()}`;
  }
  userRepo.save(user);

  return { body: { success: true, avatar: user.avatar } };
};
