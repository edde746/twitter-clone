import { userRepo } from "./redis";
import S3 from "aws-sdk/clients/s3.js";

export const s3 = new S3({
  region: process.env["AWS_BUCKET_REGION"],
  accessKeyId: process.env["AWS_ACCESS"],
  secretAccessKey: process.env["AWS_SECRET"],
});

export const errorResponse = (acceptsJson, message, redirect = "", status = 400) =>
  acceptsJson
    ? { status, body: { error: message } }
    : { status: 302, headers: { Location: `${redirect}?error=${message}` } };

export const formatPosts = async (posts, me, fetchAuthor = true) => {
  // Fetch all the data of the authors
  const authors = fetchAuthor
    ? Object.fromEntries(
        await Promise.all(
          // Set to only fetch an author once
          [...new Set(posts.flatMap((post) => [post.author, post.repost || 0]))]
            .filter((e) => e)
            .map(async (author) => {
              author = await userRepo.fetch(author);
              return [
                author.entityId,
                {
                  at: author.at,
                  avatar: author.avatar || "/images/default.png",
                },
              ];
            })
        )
      )
    : undefined;

  // "Sanetize" posts
  posts = posts.map((post) => ({
    id: post.entityId,
    author: post.author,
    repost: post.repost,
    content: post.content,
    mentions: post.mentions,
    timestamp: post.timestamp,
    likes: post.likes.length - 1,
    liked: me ? post.likes.some((liker) => liker == me) : false,
  }));

  return { posts, authors };
};
