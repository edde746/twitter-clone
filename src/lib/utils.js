import { userRepo } from "./redis";

export const errorResponse = (acceptsJson, message, redirect = "", status = 400) =>
  acceptsJson
    ? { status, body: { error: message } }
    : { status: 302, headers: { Location: `${redirect}?error=${message}` } };

export const formatPosts = async (posts, me, fetchAuthor = true) => {
  // Fetch all the data of the authors
  const authors = fetchAuthor
    ? Object.fromEntries(
        await Promise.all(
          [...new Set(posts.map((post) => post.author))].map(async (author) => {
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
    content: post.content,
    timestamp: post.timestamp,
    likes: post.likes.length - 1,
    liked: me ? post.likes.some((liker) => liker == me) : false,
  }));

  return { posts, authors };
};
