#  Million Likes , Real-Time Social Media Like System

> A production-grade demonstration of how platforms like **Instagram** handle millions of likes per second using **Redis caching**, **Bull queues**, and **PostgreSQL**.

 

##  Overview

When you like a post on Instagram, you don't expect to wait. Behind that instant heart icon is a carefully engineered pipeline that absorbs millions of write operations per second without crashing the database.

This project replicates that architecture:

1. A **like request** hits the API
2. The count is **instantly updated in Redis** (in-memory, ultra-fast)
3. The like event is **pushed to a Bull queue** for background processing
4. A **worker drains the queue** and persists the final count to **PostgreSQL**

This pattern is called **write-behind caching** — and it's what keeps social platforms alive at scale.

 

##  Architecture

```
Client Request
      │
      ▼
 ┌─────────────┐
 │  Express API │  ← REST endpoints
 └──────┬──────┘
        │
        ├──► Redis Cache   ← Instant like count update (< 1ms)
        │
        └──► Bull Queue    ← Background job enqueued
                  │
                  ▼
           Queue Worker    ← Processes jobs asynchronously
                  │
                  ▼
           PostgreSQL DB   ← Durable, persistent storage
```


##  Tech Stack

| Layer       | Technology          | Purpose                          |
|-------------|---------------------|----------------------------------|
| Backend     | Node.js + Express   | REST API server                  |
| Cache       | Redis + ioredis     | Ultra-fast in-memory like counts |
| Queue       | Bull                | Background job processing        |
| Database    | PostgreSQL + pg     | Persistent storage               |


##  Features

-  **Real-time likes** — Redis updates are near-instantaneous
-  **Background processing** — Bull queues decouple write load from the DB
-  **Persistent storage** — PostgreSQL stores final, durable like counts
-  **REST API** — Simple endpoints to get posts and submit likes
-  **Optional dashboard** — View live like statistics
-  **Easily extensible** — Add comments, shares, or reactions using the same pattern



### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/million-likes-social-platform.git
cd million-likes-social-platform

# 2. Install dependencies
npm install
```

### Database Setup

Connect to your PostgreSQL instance and run the following:

```sql
-- Create the posts table
CREATE TABLE posts (
  id         SERIAL PRIMARY KEY,
  content    TEXT,
  like_count BIGINT DEFAULT 0
);

-- (Optional) Seed some sample posts
INSERT INTO posts (content) VALUES
  ('Hello world! '),
  ('Just shipped a new feature '),
  ('Redis + Bull = ');
```

### Environment Variables

Create a `.env` file in the project root:

```env
# PostgreSQL
PG_HOST=localhost
PG_PORT=5432
PG_USER=your_db_user
PG_PASSWORD=your_db_password
PG_DATABASE=million_likes

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# App
PORT=3000
```

### Run the App

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will be available at `http://localhost:3000`.



##  API Reference

### Get All Posts

```http
GET /posts
```

**Response:**

```json
[
  {
    "id": 1,
    "content": "Hello world! ",
    "like_count": 10482
  }
]
```

---

### Like a Post

```http
POST /posts/:id/like
```

**Parameters:**

| Name | Type   | Description          |
|------|--------|----------------------|
| `id` | number | The ID of the post   |

**Response:**

```json
{
  "success": true,
  "post_id": 1,
  "likes": 10483
}
```

 

##  How It Works

### Step 1 — Like hits the API

```
POST /posts/1/like
```

### Step 2 — Redis increments the count immediately

```js
await redis.incr(`post:${postId}:likes`);
// Takes ~0.1ms — user gets instant feedback
```

### Step 3 — A job is added to the Bull queue

```js
await likeQueue.add({ postId });
// Non-blocking — the API responds right away
```

### Step 4 — The worker processes the queue and updates PostgreSQL

```js
likeQueue.process(async (job) => {
  const { postId } = job.data;
  await db.query(
    'UPDATE posts SET like_count = like_count + 1 WHERE id = $1',
    [postId]
  );
});
```

This separation ensures the database is **never overwhelmed** by direct writes, even under heavy traffic.

 

##  Project Structure

```
million-likes-social-platform/
├── src/
│   ├── routes/
│   │   └── posts.js          # API route handlers
│   ├── workers/
│   │   └── likeWorker.js     # Bull queue processor
│   ├── db/
│   │   └── index.js          # PostgreSQL connection
│   ├── cache/
│   │   └── redis.js          # Redis/ioredis setup
│   └── app.js                # Express app entry point
├── .env.example              # Environment variable template
├── package.json
└── README.md
```



##  Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please follow the existing code style and include relevant tests where applicable.

 

 

<div align="center">
  Built to understand scale. Inspired by Instagram, Twitter, and every platform that makes liking feel instant.
</div>
