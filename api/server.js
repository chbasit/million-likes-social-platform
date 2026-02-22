const express = require("express");
const Queue = require("bull");
const Redis = require("ioredis");
const redis = new Redis();
const pool = require("../worker/db");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const likeQueue = new Queue("likeQueue", { redis: { host: "127.0.0.1", port: 6379 } });

// Like a post
app.post("/posts/:id/like", async (req, res) => {
  const postId = req.params.id;
  await redis.incr(`post:${postId}:likes`);
  await likeQueue.add({ postId });
  res.json({ message: "Liked successfully" });
});

// Get post
app.get("/posts/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    const result = await pool.query("SELECT * FROM posts WHERE id=$1", [postId]);
    if (!result.rows.length) return res.status(404).json({ error: "Post not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(3000, () => console.log("API running on port 3000"));