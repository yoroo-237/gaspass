require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

function getClient() {
  return new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });
}

app.get('/api/blogposts', async (req, res) => {
  const client = getClient();
  await client.connect();
  try {
    const { rows } = await client.query(`
      SELECT
        bp.id,
        bp.title,
        bp.excerpt,
        to_char(bp.created_at, 'DD Mon YYYY HH24:MI') AS date,
        bp.image,
        bp.image_caption    AS "imageCaption",
        bp.author,
        bp.content,
        bc.name             AS category,
        bp.likes,
        bp.comments_count  AS comments,
        bp.reading_time    AS "readingTime",
        ARRAY_REMOVE(ARRAY_AGG(t.name), NULL) AS tags
      FROM blog_post bp
      LEFT JOIN public.blog_category bc    ON bp.category_id = bc.id
      LEFT JOIN post_tag pt  ON bp.id = pt.post_id
      LEFT JOIN tag t        ON pt.tag_id = t.id
      GROUP BY bp.id, bc.name
      ORDER BY bp.id;
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.end();
  }
});

app.get('/api/categories', async (req, res) => {
  const client = getClient();
  await client.connect();
  try {
    const { rows } = await client.query(`
      SELECT id, name FROM category ORDER BY id;
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.end();
  }
});

app.get('/api/products', async (req, res) => {
  const client = getClient();
  await client.connect();
  try {
    const { rows } = await client.query(`
      SELECT
        id,
        name,
        price,
        description,
        image,
        category_id AS category,
        rating,
        stock
      FROM product
      WHERE featured = true
      ORDER BY id;
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.end();
  }
});

app.get('/api/reviews', async (req, res) => {
  const client = getClient();
  await client.connect();
  try {
    const { rows } = await client.query(`
      SELECT
        id,
        author,
        avatar,
        rating,
        text,
        to_char(date, 'YYYY-MM-DD') AS date
      FROM review
      ORDER BY id;
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.end();
  }
});

app.listen(PORT, () => {
  console.log(`Backend lancé sur http://localhost:${PORT}`);
});
