import React, { useState, useEffect } from "react";
import { Button, Card, Container, Row, Col, Badge } from "react-bootstrap";
import { StarFill, CartPlus, Eye } from "react-bootstrap-icons";
import useCartStore from "../context/cartStore";
import { useNavigate } from "react-router-dom";
import "./productcss.css";
import MediaCarousel from '../components/MediaCaroussel';

interface Product {
  id: number;
  name: string;
  description: string;
  category: number;
  price: number;
  image: string;
  rating?: number;
  stock: number;
}

interface Category {
  id: number;
  name: string;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

function getProductImageUrl(path: string) {
  return `${supabaseUrl}/storage/v1/object/public/product-images/${path}`;
}

const Products: React.FC = () => {
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<string | number>('All');
  const [sortOrder, setSortOrder] = useState<string>("Relevance");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const productsPerPage = 8;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fonction pour récupérer les produits depuis l'API
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    }
  };

  // Fonction pour récupérer les catégories depuis l'API
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchCategories()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Filtrage sur categoryId
  const filteredProducts = products.filter(product => {
    return selectedCategory === 'All'
      ? true
      : product.category === selectedCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOrder) {
      case "Price (ascending)":
        return a.price - b.price;
      case "Price (descending)":
        return b.price - a.price;
      case "Best ratings":
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        category: product.category.toString(),
        stock: product.stock,
        description: product.description,
      });
    } else {
      alert("Product out of stock");
    }
  };
  
  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const categoryList = [
    { id: 'All', name: 'All' },
    ...categories.map(cat => ({ id: cat.id, name: cat.name }))
  ];

  const prepareProductMedia = (product: Product) => {
    return [{
      url: getProductImageUrl(product.image),
      type: 'image'
    }];
  };

  if (loading) {
    return (
      <Container className="products-page py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading products...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="products-page py-5 text-center">
        <div className="alert alert-danger" role="alert">
          <h4>Error loading products</h4>
          <p>{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="products-page py-5">
      <h1 className="text-center mb-5 section-title">Our Products</h1>

      {/* Filtres et tri */}
      <div className="mb-4">
        {/* Boutons de catégorie */}
        <div className="mb-3 d-flex flex-wrap gap-2">
          {categoryList.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentPage(1);
              }}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Dropdown de tri et info */}
        <Row className="align-items-center">
          <Col md={6}>
            <select
              className="form-select form-select-sm"
              style={{ maxWidth: '250px' }}
              value={sortOrder}
              onChange={e => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Sort products by"
            >
              <option value="Relevance">Sort by: Relevance</option>
              <option value="Price (ascending)">Price (ascending)</option>
              <option value="Price (descending)">Price (descending)</option>
              <option value="Best ratings">Best ratings</option>
            </select>
          </Col>
          <Col md={6} className="text-md-end mt-2 mt-md-0">
            <small className="text-muted">
              Showing {currentProducts.length} of {sortedProducts.length} products
            </small>
          </Col>
        </Row>
      </div>

      {/* Message si aucun produit */}
      {currentProducts.length === 0 ? (
        <div className="text-center py-5">
          <h3>No products found</h3>
          <p className="text-muted">Try adjusting your filters or search criteria.</p>
        </div>
      ) : (
        <>
          {/* Cartes produit */}
          <Row xs={1} sm={1} md={2} lg={3} xl={4} className="g-4">
            {currentProducts.map(product => {
              const productMedia = prepareProductMedia(product);
              const categoryName = categories.find(c => c.id === product.category)?.name || 'Unknown';
              
              return (
                <Col key={product.id}>
                  <Card
                    className="h-100 product-card shadow-sm"
                    onClick={() => handleProductClick(product.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="product-badge position-absolute top-0 end-0 m-2" style={{ zIndex: 2 }}>
                      <Badge bg={product.stock > 0 ? "success" : "danger"}>
                        {product.stock > 0 ? "In stock" : "Out of stock"}
                      </Badge>
                    </div>
                    
                    <div className="product-image-container">
                      <MediaCarousel media={productMedia} />
                    </div>
                    
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Badge bg="light" text="dark">
                          {categoryName}
                        </Badge>
                        {product.rating && (
                          <div className="d-flex align-items-center">
                            <StarFill className="text-warning me-1" size={14} />
                            <small>{product.rating}</small>
                          </div>
                        )}
                      </div>
                      
                      <Card.Title className="product-title h6">{product.name}</Card.Title>
                      <Card.Text className="product-description text-muted small flex-grow-1">
                        {product.description}
                      </Card.Text>
                      
                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h5 className="price mb-0 text-success fw-bold">
                            ${product.price.toLocaleString()}
                          </h5>
                          <small className="text-muted">Stock: {product.stock}</small>
                        </div>
                        
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="flex-grow-1"
                            onClick={e => {
                              e.stopPropagation();
                              handleProductClick(product.id);
                            }}
                          >
                            <Eye className="me-1" size={14} /> View
                          </Button>
                          <Button
                            variant={product.stock > 0 ? "danger" : "secondary"}
                            size="sm"
                            className="flex-grow-1"
                            onClick={e => handleAddToCart(product, e)}
                            disabled={product.stock <= 0}
                          >
                            <CartPlus className="me-1" size={14} /> 
                            {product.stock > 0 ? "Add" : "N/A"}
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-5">
              <nav aria-label="Products pagination">
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <Button
                      className="page-link"
                      variant="link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                  </li>
                  
                  {/* Numéros de page */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <li key={pageNum} className={`page-item ${currentPage === pageNum ? "active" : ""}`}>
                        <Button
                          className="page-link"
                          variant="link"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      </li>
                    );
                  })}
                  
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <Button
                      className="page-link"
                      variant="link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default Products;