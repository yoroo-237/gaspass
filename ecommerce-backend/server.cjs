require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const app = express();

// Configuration CORS améliorée
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Configuration de la base de données avec fallbacks
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'miguel',
  password: process.env.DB_PASS || 'Mkomegmbdysdia4',
  database: process.env.DB_NAME || 'gaspass',
  // Configuration pour production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

function getClient() {
  return new Client(dbConfig);
}

// Middleware de logging pour debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Middleware de gestion d'erreurs
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Route pour tous les posts de blog
app.get('/api/blogposts', asyncHandler(async (req, res) => {
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
      ORDER BY bp.created_at DESC;
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  } finally {
    await client.end();
  }
}));

// Route pour toutes les catégories
app.get('/api/categories', asyncHandler(async (req, res) => {
  const client = getClient();
  await client.connect();
  try {
    const { rows } = await client.query(`
      SELECT id, name, description 
      FROM category 
      ORDER BY name;
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  } finally {
    await client.end();
  }
}));

// Route pour tous les produits (avec pagination optionnelle)
app.get('/api/products', asyncHandler(async (req, res) => {
  const { page, limit, category, featured } = req.query;
  const client = getClient();
  await client.connect();
  
  try {
    let query = `
      SELECT
        p.id,
        p.name,
        p.price,
        p.description,
        p.image,
        p.category_id AS category,
        p.rating,
        p.stock,
        p.featured,
        c.name AS category_name
      FROM product p
      LEFT JOIN category c ON p.category_id = c.id
    `;
    
    const conditions = [];
    const params = [];
    let paramCount = 0;
    
    // Filtrer par catégorie si spécifiée
    if (category && category !== 'All') {
      paramCount++;
      conditions.push(`p.category_id = ${paramCount}`);
      params.push(parseInt(category));
    }
    
    // Filtrer par produits en vedette si spécifié
    if (featured === 'true') {
      conditions.push('p.featured = true');
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY p.id';
    
    // Pagination si spécifiée
    if (page && limit) {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;
      
      paramCount++;
      query += ` LIMIT ${paramCount}`;
      params.push(limitNum);
      
      paramCount++;
      query += ` OFFSET ${paramCount}`;
      params.push(offset);
    }
    
    const { rows } = await client.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  } finally {
    await client.end();
  }
}));

// Route pour un produit spécifique
app.get('/api/products/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const client = getClient();
  await client.connect();
  
  try {
    const { rows } = await client.query(`
      SELECT
        p.id,
        p.name,
        p.price,
        p.description,
        p.image,
        p.category_id AS category,
        p.rating,
        p.stock,
        p.featured,
        c.name AS category_name
      FROM product p
      LEFT JOIN category c ON p.category_id = c.id
      WHERE p.id = $1;
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  } finally {
    await client.end();
  }
}));

// Route pour les produits en vedette
app.get('/api/products/featured', asyncHandler(async (req, res) => {
  const client = getClient();
  await client.connect();
  
  try {
    const { rows } = await client.query(`
      SELECT
        p.id,
        p.name,
        p.price,
        p.description,
        p.image,
        p.category_id AS category,
        p.rating,
        p.stock,
        c.name AS category_name
      FROM product p
      LEFT JOIN category c ON p.category_id = c.id
      WHERE p.featured = true
      ORDER BY p.rating DESC, p.id;
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching featured products:', err);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  } finally {
    await client.end();
  }
}));

// Route pour toutes les reviews
app.get('/api/reviews', asyncHandler(async (req, res) => {
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
        to_char(date, 'DD Mon YYYY') AS date,
        product_id
      FROM review
      ORDER BY date DESC;
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  } finally {
    await client.end();
  }
}));

// Route pour les reviews d'un produit spécifique
app.get('/api/products/:id/reviews', asyncHandler(async (req, res) => {
  const { id } = req.params;
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
        to_char(date, 'DD Mon YYYY') AS date
      FROM review
      WHERE product_id = $1
      ORDER BY date DESC;
    `, [id]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching product reviews:', err);
    res.status(500).json({ error: 'Failed to fetch product reviews' });
  } finally {
    await client.end();
  }
}));

// Route pour une review spécifique
app.get('/api/reviews/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const client = getClient();
  await client.connect();
  
  try {
    const { rows } = await client.query(`
      SELECT
        r.id,
        r.author,
        r.avatar,
        r.rating,
        r.text,
        to_char(r.date, 'DD Mon YYYY') AS date,
        r.product_id,
        p.name AS product_name
      FROM review r
      LEFT JOIN product p ON r.product_id = p.id
      WHERE r.id = $1;
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching review:', err);
    res.status(500).json({ error: 'Failed to fetch review' });
  } finally {
    await client.end();
  }
}));

// Route de recherche de produits
app.get('/api/search/products', asyncHandler(async (req, res) => {
  const { q, category, min_price, max_price, sort } = req.query;
  const client = getClient();
  await client.connect();
  
  try {
    let query = `
      SELECT
        p.id,
        p.name,
        p.price,
        p.description,
        p.image,
        p.category_id AS category,
        p.rating,
        p.stock,
        c.name AS category_name
      FROM product p
      LEFT JOIN category c ON p.category_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    // Recherche par mot-clé
    if (q) {
      paramCount++;
      query += ` AND (p.name ILIKE ${paramCount} OR p.description ILIKE ${paramCount})`;
      params.push(`%${q}%`);
    }
    
    // Filtrer par catégorie
    if (category && category !== 'All') {
      paramCount++;
      query += ` AND p.category_id = ${paramCount}`;
      params.push(parseInt(category));
    }
    
    // Filtrer par prix minimum
    if (min_price) {
      paramCount++;
      query += ` AND p.price >= ${paramCount}`;
      params.push(parseFloat(min_price));
    }
    
    // Filtrer par prix maximum
    if (max_price) {
      paramCount++;
      query += ` AND p.price <= ${paramCount}`;
      params.push(parseFloat(max_price));
    }
    
    // Tri
    switch (sort) {
      case 'price_asc':
        query += ' ORDER BY p.price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY p.price DESC';
        break;
      case 'rating':
        query += ' ORDER BY p.rating DESC, p.id';
        break;
      case 'name':
        query += ' ORDER BY p.name ASC';
        break;
      default:
        query += ' ORDER BY p.id';
    }
    
    const { rows } = await client.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error searching products:', err);
    res.status(500).json({ error: 'Failed to search products' });
  } finally {
    await client.end();
  }
}));

// Route de statistiques (optionnelle)
app.get('/api/stats', asyncHandler(async (req, res) => {
  const client = getClient();
  await client.connect();
  
  try {
    const [productsCount, categoriesCount, reviewsCount] = await Promise.all([
      client.query('SELECT COUNT(*) as count FROM product'),
      client.query('SELECT COUNT(*) as count FROM category'),
      client.query('SELECT COUNT(*) as count FROM review')
    ]);
    
    res.json({
      products: parseInt(productsCount.rows[0].count),
      categories: parseInt(categoriesCount.rows[0].count),
      reviews: parseInt(reviewsCount.rows[0].count)
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  } finally {
    await client.end();
  }
}));

// Route de test pour vérifier la connexion à la base de données
app.get('/api/health', asyncHandler(async (req, res) => {
  const client = getClient();
  try {
    await client.connect();
    const result = await client.query('SELECT NOW() as server_time');
    res.json({ 
      status: 'OK', 
      database: 'Connected',
      server_time: result.rows[0].server_time,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'Disconnected',
      error: err.message 
    });
  } finally {
    await client.end();
  }
}));

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Route 404 pour les routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Configuration du serveur
const listenPort = process.env.PORT || 3000;
const listenHost = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(listenPort, listenHost, () => {
  console.log(`🚀 Backend server running on ${listenHost}:${listenPort}`);
  console.log(`📊 Health check: http://${listenHost}:${listenPort}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});