# Million Likes Social Platform

A **real-time social media likes system** built with **Node.js**, **PostgreSQL**, **Redis**, and **Bull queues**. This project allows posts to be liked instantly while ensuring scalable updates to the database using queues and caching for high-performance social applications.


## Features

- Like posts in **real-time**
- Fast caching of like counts using **Redis**
- Scalable processing with **Bull queues**
- Persistent storage in **PostgreSQL**
- REST API to **get posts and like counts**
- Optional **dashboard** to view live like statistics
- Easy to extend for other social interactions (comments, shares)


## Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** PostgreSQL  
- **Caching:** Redis  
- **Queue:** Bull  
- **Other Tools:** ioredis, pg

## Query
Create table:

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  content TEXT,
  like_count BIGINT DEFAULT 0
);

## Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/million-likes-social-platform.git
cd million-likes-social-platform
