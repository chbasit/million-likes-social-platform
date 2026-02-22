const Queue = require("bull");
const Redis = require("ioredis");
const pool = require("./db");

const redis = new Redis({ host: "127.0.0.1", port: 6379 });
const likeQueue = new Queue("likeQueue", { redis: { host: "127.0.0.1", port: 6379 } });

// Process jobs (just acknowledge)
likeQueue.process(async (job) => {
  console.log("Job received for post:", job.data.postId);
  return true;
});

// Batch update every 5 seconds
setInterval(async () => {
  try {
    console.log("Running batch sync...");
    const keys = await redis.keys("post:*:likes");
    for (let key of keys) {
      const postId = key.split(":")[1];
      const likeCount = parseInt(await redis.get(key)) || 0;
      if (likeCount > 0) {
        await pool.query(
          "UPDATE posts SET like_count = like_count + $1 WHERE id = $2",
          [likeCount, postId]
        );
        await redis.set(key, 0);
        console.log(`Post ${postId} updated with ${likeCount} likes`);
      }
    }
  } catch (err) {
    console.error("Batch sync error:", err.message);
  }
}, 10000);

console.log("Worker running...");