import React, { useState, useEffect } from 'react';
import './dashboardcss.css';

// Interfaces
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  rating: number;
  stock: number;
}

interface BlogPost {
  id: number;
  title: string;
  excerpt?: string;
  date: string;
  image: string;
  author: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
  tags: string[];
  readingTime: number;
}

// Données initiales
const initialBlogPosts: BlogPost[] = [
  {
    id: 8,
    title: "Les tendances tech 2023",
    excerpt: "Découvrez les gadgets qui vont marquer cette année",
    date: "15 mars 2023",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    author: "Équipe SwiftShop",
    content: "Découvrez les technologies les plus innovantes et les tendances qui façonneront 2023.",
    category: "Technologie",
    likes: 0,
    comments: 0,
    tags: ["gadgets", "technologie", "tendances"],
    readingTime: 4
  },
  // ... autres articles
];

const Dashboard: React.FC = () => {
  // États
  const [activeTab, setActiveTab] = useState<'products' | 'blog' | 'stats'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts);
  
  // États pour les formulaires
  const [productForm, setProductForm] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    description: '',
    image: '',
    category: '',
    rating: 0,
    stock: 0,
  });
  
  const [postForm, setPostForm] = useState<Omit<BlogPost, 'id'>>({
    title: '',
    excerpt: '',
    date: new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    image: '',
    author: '',
    content: '',
    category: '',
    readingTime: 0,
    likes: 0,
    comments: 0,
    tags: []
  });
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  // Catégories
  const productCategories = ['Électronique', 'Vêtements', 'Alimentation', 'Maison', 'Autre'];
  const postCategories = ['Technologie', 'Conseils', 'Nouveautés', 'Informations', 'Actualités'];

  // Statistiques
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalPosts: 0,
    productsInStock: 0,
    mostPopularCategory: '',
    recentPosts: [] as BlogPost[],
    topRatedProducts: [] as Product[]
  });

  // Calcul des statistiques
  useEffect(() => {
    const totalProducts = products.length;
    const totalPosts = blogPosts.length;
    const productsInStock = products.reduce((sum, product) => sum + product.stock, 0);
    
    // Catégorie la plus populaire
    const categoryCounts = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostPopularCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Aucune';
    
    // Articles récents (3 derniers)
    const recentPosts = [...blogPosts]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
    
    // Produits les mieux notés
    const topRatedProducts = [...products]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);

    setStats({
      totalProducts,
      totalPosts,
      productsInStock,
      mostPopularCategory,
      recentPosts,
      topRatedProducts
    });
  }, [products, blogPosts]);

  // Handlers pour les produits
  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductForm({
      ...productForm,
      [name]: name === 'price' || name === 'rating' || name === 'stock' 
        ? parseFloat(value) || 0 
        : value
    });
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setProducts(products.map(prod => 
        prod.id === editingId ? { ...productForm, id: editingId } : prod
      ));
    } else {
      setProducts([...products, { ...productForm, id: Date.now() }]);
    }
    resetProductForm();
  };

  // Handlers pour les articles
  const handlePostChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPostForm({
      ...postForm,
      [name]: name === 'readingTime' || name === 'likes' || name === 'comments' 
        ? parseInt(value) || 0 
        : value
    });
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setPostForm({ ...postForm, tags });
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPost = {
      ...postForm,
      id: editingPostId || Date.now(),
      date: new Date().toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    if (editingPostId) {
      setBlogPosts(blogPosts.map(post => 
        post.id === editingPostId ? newPost : post
      ));
    } else {
      setBlogPosts([...blogPosts, newPost]);
    }
    resetPostForm();
  };

  // Reset forms
  const resetProductForm = () => {
    setProductForm({
      name: '',
      price: 0,
      description: '',
      image: '',
      category: '',
      rating: 0,
      stock: 0,
    });
    setEditingId(null);
  };

  const resetPostForm = () => {
    setPostForm({
      title: '',
      excerpt: '',
      date: new Date().toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      image: '',
      author: '',
      content: '',
      category: '',
      readingTime: 0,
      likes: 0,
      comments: 0,
      tags: []
    });
    setEditingPostId(null);
  };

  // Delete handlers
  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const handleDeletePost = (id: number) => {
    setBlogPosts(blogPosts.filter(post => post.id !== id));
  };

  // Edit handlers
  const handleEditProduct = (product: Product) => {
    setProductForm({
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      category: product.category,
      rating: product.rating,
      stock: product.stock
    });
    setEditingId(product.id);
  };

  const handleEditPost = (post: BlogPost) => {
    setPostForm({
      title: post.title,
      excerpt: post.excerpt || '',
      date: post.date,
      image: post.image,
      author: post.author,
      content: post.content,
      category: post.category,
      readingTime: post.readingTime,
      likes: post.likes || 0,
      comments: post.comments || 0,
      tags: post.tags || []
    });
    setEditingPostId(post.id);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="text-center">Tableau de Bord Admin</h1>
      </div>

      <div className="container py-4">
        {/* Navigation par onglets */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              Produits
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'blog' ? 'active' : ''}`}
              onClick={() => setActiveTab('blog')}
            >
              Articles
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              Statistiques
            </button>
          </li>
        </ul>

        {/* Contenu des onglets */}
        {activeTab === 'products' ? (
          <>
            {/* Formulaire Produit */}
            <div className="form-section shadow-sm mb-4">
              <h2>{editingId ? 'Modifier Produit' : 'Ajouter Produit'}</h2>
              <form onSubmit={handleProductSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nom</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={productForm.name}
                      onChange={handleProductChange}
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Prix (FCFA)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="price"
                      value={productForm.price}
                      onChange={handleProductChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={productForm.description}
                      onChange={handleProductChange}
                      rows={3}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">URL de l'image</label>
                    <input
                      type="url"
                      className="form-control"
                      name="image"
                      value={productForm.image}
                      onChange={handleProductChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Catégorie</label>
                    <select
                      className="form-select"
                      name="category"
                      value={productForm.category}
                      onChange={handleProductChange}
                      required
                    >
                      <option value="">Sélectionner...</option>
                      {productCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label">Note (0-5)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="rating"
                      value={productForm.rating}
                      onChange={handleProductChange}
                      min="0"
                      max="5"
                      step="0.1"
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label">Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      name="stock"
                      value={productForm.stock}
                      onChange={handleProductChange}
                      min="0"
                    />
                  </div>
                  
                  <div className="col-12 mt-4">
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-danger">
                        {editingId ? 'Mettre à jour' : 'Ajouter'}
                      </button>
                      {editingId && (
                        <button type="button" className="btn btn-outline-secondary" onClick={resetProductForm}>
                          Annuler
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Liste des produits */}
            <h2>Produits ({products.length})</h2>
            {products.length === 0 ? (
              <div className="alert alert-info">Aucun produit disponible</div>
            ) : (
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {products.map(product => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </div>
            )}
          </>
        ) : activeTab === 'blog' ? (
          <>
            {/* Formulaire Article */}
            <div className="form-section shadow-sm mb-4">
              <h2>{editingPostId ? 'Modifier Article' : 'Nouvel Article'}</h2>
              <form onSubmit={handlePostSubmit}>
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label">Titre</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={postForm.title}
                      onChange={handlePostChange}
                      required
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label">Catégorie</label>
                    <select
                      className="form-select"
                      name="category"
                      value={postForm.category}
                      onChange={handlePostChange}
                      required
                    >
                      <option value="">Sélectionner...</option>
                      {postCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label">Extrait</label>
                    <textarea
                      className="form-control"
                      name="excerpt"
                      value={postForm.excerpt}
                      onChange={handlePostChange}
                      rows={2}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">URL de l'image</label>
                    <input
                      type="url"
                      className="form-control"
                      name="image"
                      value={postForm.image}
                      onChange={handlePostChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Auteur</label>
                    <input
                      type="text"
                      className="form-control"
                      name="author"
                      value={postForm.author}
                      onChange={handlePostChange}
                      required
                    />
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label">Contenu</label>
                    <textarea
                      className="form-control"
                      name="content"
                      value={postForm.content}
                      onChange={handlePostChange}
                      rows={6}
                      required
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label">Tags (séparés par des virgules)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={postForm.tags?.join(', ') || ''}
                      onChange={handleTagsChange}
                      placeholder="tech, gadgets, tendances"
                    />
                  </div>
                  
                  <div className="col-md-2">
                    <label className="form-label">Temps de lecture (min)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="readingTime"
                      value={postForm.readingTime}
                      onChange={handlePostChange}
                      min="1"
                    />
                  </div>
                  
                  <div className="col-12 mt-4">
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-danger">
                        {editingPostId ? 'Mettre à jour' : 'Publier'}
                      </button>
                      {editingPostId && (
                        <button type="button" className="btn btn-outline-secondary" onClick={resetPostForm}>
                          Annuler
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Liste des articles */}
            <h2>Articles ({blogPosts.length})</h2>
            {blogPosts.length === 0 ? (
              <div className="alert alert-info">Aucun article disponible</div>
            ) : (
              <div className="row g-4">
                {blogPosts.map(post => (
                  <BlogPostCard 
                    key={post.id}
                    post={post}
                    onEdit={handleEditPost}
                    onDelete={handleDeletePost}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* Section Statistiques */
          <div className="stats-section">
            <div className="row">
              <div className="col-md-6">
                <div className="card mb-4">
                  <div className="card-body">
                    <h3 className="card-title">Aperçu</h3>
                    <div className="stats-grid">
                      <div className="stat-card bg-danger text-white">
                        <h4>Produits</h4>
                        <p className="stat-value">{stats.totalProducts}</p>
                      </div>
                      <div className="stat-card bg-success text-white">
                        <h4>Articles</h4>
                        <p className="stat-value">{stats.totalPosts}</p>
                      </div>
                      <div className="stat-card bg-info text-white">
                        <h4>Stock total</h4>
                        <p className="stat-value">{stats.productsInStock}</p>
                      </div>
                      <div className="stat-card bg-warning text-dark">
                        <h4>Catégorie populaire</h4>
                        <p className="stat-value">{stats.mostPopularCategory}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card mb-4">
                  <div className="card-body">
                    <h3 className="card-title">Produits les mieux notés</h3>
                    {stats.topRatedProducts.length > 0 ? (
                      <ul className="list-group">
                        {stats.topRatedProducts.map(product => (
                          <li key={product.id} className="list-group-item d-flex justify-content-between align-items-center">
                            {product.name}
                            <span className="badge bg-danger rounded-pill">
                              {product.rating.toFixed(1)} ★
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted">Aucun produit disponible</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card mb-4">
                  <div className="card-body">
                    <h3 className="card-title">Articles récents</h3>
                    {stats.recentPosts.length > 0 ? (
                      <div className="list-group">
                        {stats.recentPosts.map(post => (
                          <div key={post.id} className="list-group-item">
                            <h5 className="mb-1">{post.title}</h5>
                            <small className="text-muted">
                              {post.date} • {post.readingTime} min
                            </small>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted">Aucun article récent</p>
                    )}
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <h3 className="card-title">Activité récente</h3>
                    <div className="activity-timeline">
                      <div className="activity-item">
                        <div className="activity-dot bg-danger"></div>
                        <div className="activity-content">
                          <p>Nouveau produit ajouté</p>
                          <small className="text-muted">Il y a 2 heures</small>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-dot bg-success"></div>
                        <div className="activity-content">
                          <p>Article publié: "Les tendances tech 2023"</p>
                          <small className="text-muted">Il y a 1 jour</small>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-dot bg-info"></div>
                        <div className="activity-content">
                          <p>Mise à jour du stock</p>
                          <small className="text-muted">Il y a 3 jours</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant ProductCard
const ProductCard: React.FC<{
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}> = ({ product, onEdit, onDelete }) => {
  return (
    <div className="col">
      <div className="card h-100">
        {product.image && (
          <img 
            src={product.image} 
            className="card-img-top product-image" 
            alt={product.name}
          />
        )}
        <div className="card-body">
          <h5 className="card-title">{product.name}</h5>
          <p className="card-text text-muted">{product.category}</p>
          <p className="card-text">{product.description}</p>
          <div className="d-flex justify-content-between align-items-center">
            <span className="h5">{product.price.toFixed(2)} FCFA</span>
            <span className="badge bg-warning text-dark">
              {product.rating.toFixed(1)} ★
            </span>
          </div>
          <p className="mt-2">Stock: {product.stock}</p>
        </div>
        <div className="card-footer bg-transparent">
          <div className="d-flex justify-content-between">
            <button 
              className="btn btn-sm btn-outline-danger"
              onClick={() => onEdit(product)}
            >
              Modifier
            </button>
            <button 
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(product.id)}
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant BlogPostCard
const BlogPostCard: React.FC<{
  post: BlogPost;
  onEdit: (post: BlogPost) => void;
  onDelete: (id: number) => void;
}> = ({ post, onEdit, onDelete }) => {
  return (
    <div className="col-md-6">
      <div className="card mb-4 h-100">
        {post.image && (
          <img 
            src={post.image} 
            className="card-img-top post-image" 
            alt={post.title}
          />
        )}
        <div className="card-body">
          <h5 className="card-title">{post.title}</h5>
          <p className="card-text text-muted">
            {post.category} • {post.readingTime} min de lecture
          </p>
          {post.excerpt && (
            <p className="card-text">{post.excerpt}</p>
          )}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">Par {post.author}</small>
            <small className="text-muted">{post.date}</small>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="mt-2">
              {post.tags.map(tag => (
                <span key={tag} className="badge bg-secondary me-1">{tag}</span>
              ))}
            </div>
          )}
        </div>
        <div className="card-footer bg-transparent">
          <div className="d-flex justify-content-between">
            <button 
              className="btn btn-sm btn-outline-danger"
              onClick={() => onEdit(post)}
            >
              Modifier
            </button>
            <button 
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(post.id)}
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;