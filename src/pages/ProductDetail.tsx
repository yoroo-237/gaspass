import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Container, Row, Col, Badge, Alert, Spinner } from "react-bootstrap";
import { StarFill, CartPlus, ArrowLeft, Heart, Share } from "react-bootstrap-icons";
import useCartStore from "../context/cartStore";
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

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToCart, setAddedToCart] = useState<boolean>(false);

  // Fonction pour récupérer un produit spécifique
  const fetchProduct = async (productId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const products = await response.json();
      const foundProduct = products.find((p: Product) => p.id === Number(productId));
      
      if (!foundProduct) {
        throw new Error('Product not found');
      }
      
      setProduct(foundProduct);
      
      // Récupérer les catégories pour avoir le nom de la catégorie
      const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
      if (categoriesResponse.ok) {
        const categories = await categoriesResponse.json();
        const foundCategory = categories.find((c: Category) => c.id === foundProduct.category);
        setCategory(foundCategory || null);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err instanceof Error ? err.message : 'Failed to load product');
    }
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchProduct(id).finally(() => setLoading(false));
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product || product.stock < quantity) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
      category: category?.name || product.category.toString(),
      stock: product.stock,
      description: product.description,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && product && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  const prepareProductMedia = (product: Product) => {
    return [{
      url: getProductImageUrl(product.image),
      type: 'image'
    }];
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading product details...</p>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <Alert.Heading>Product Not Found</Alert.Heading>
          <p>{error || "The product you're looking for doesn't exist."}</p>
          <div className="d-flex gap-2 justify-content-center">
            <Button variant="outline-danger" onClick={() => navigate(-1)}>
              <ArrowLeft className="me-1" /> Go Back
            </Button>
            <Button variant="danger" onClick={() => navigate('/products')}>
              Browse Products
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  const productMedia = prepareProductMedia(product);
  const isInStock = product.stock > 0;
  const maxQuantity = Math.min(10, product.stock); // Limite à 10 ou au stock disponible

  return (
    <Container className="py-5">
      {/* Breadcrumb / Navigation */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button
          variant="outline-secondary"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="me-1" /> Back
        </Button>
        
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={handleShare}>
            <Share className="me-1" /> Share
          </Button>
          <Button variant="outline-secondary" size="sm">
            <Heart className="me-1" /> Wishlist
          </Button>
        </div>
      </div>

      {/* Alert de confirmation d'ajout au panier */}
      {addedToCart && (
        <Alert variant="success" className="mb-4">
          ✅ Product successfully added to cart!
        </Alert>
      )}

      <Row className="g-4">
        {/* Images du produit */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <div className="position-relative">
              <MediaCarousel media={productMedia} />
              {!isInStock && (
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                     style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                  <Badge bg="danger" className="fs-6 p-3">OUT OF STOCK</Badge>
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Informations du produit */}
        <Col lg={6}>
          <div className="sticky-top" style={{ top: '2rem' }}>
            {/* Catégorie */}
            <Badge bg="light" text="dark" className="mb-3 fs-6">
              {category?.name || 'Unknown Category'}
            </Badge>

            {/* Titre */}
            <h1 className="display-6 fw-bold mb-3">{product.name}</h1>

            {/* Rating */}
            {product.rating && (
              <div className="d-flex align-items-center mb-3">
                <div className="d-flex me-2">
                  {[...Array(5)].map((_, i) => (
                    <StarFill
                      key={i}
                      className={i < Math.floor(product.rating!) ? "text-warning" : "text-muted"}
                    />
                  ))}
                </div>
                <span className="text-muted">({product.rating} out of 5)</span>
              </div>
            )}

            {/* Prix */}
            <div className="mb-4">
              <h2 className="text-success fw-bold mb-0">
                ${product.price.toLocaleString()}
              </h2>
              <small className="text-muted">Price includes all taxes</small>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h5 className="mb-3">Description</h5>
              <p className="text-muted" style={{ lineHeight: '1.6' }}>
                {product.description}
              </p>
            </div>

            {/* Disponibilité */}
            <div className="mb-4 p-3 bg-light rounded">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">Availability</h6>
                  {isInStock ? (
                    <div className="d-flex align-items-center">
                      <Badge bg="success" className="me-2">✓ In Stock</Badge>
                      <span className="text-muted">({product.stock} available)</span>
                    </div>
                  ) : (
                    <Badge bg="danger">Out of Stock</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Sélection quantité et ajout panier */}
            {isInStock && (
              <div className="mb-4">
                <div className="row g-3">
                  <div className="col-4">
                    <label htmlFor="quantity" className="form-label fw-semibold">
                      Quantity
                    </label>
                    <div className="input-group">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        -
                      </Button>
                      <input
                        type="number"
                        className="form-control text-center"
                        id="quantity"
                        min="1"
                        max={maxQuantity}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      />
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= maxQuantity}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="col-8">
                    <label className="form-label fw-semibold">Total Price</label>
                    <div className="h5 text-success fw-bold pt-2">
                      ${(product.price * quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="d-grid gap-2">
              <Button
                variant={isInStock ? "danger" : "secondary"}
                size="lg"
                onClick={handleAddToCart}
                disabled={!isInStock}
                className="py-3 fw-semibold"
              >
                <CartPlus className="me-2" size={20} />
                {isInStock ? `Add ${quantity} to Cart` : "Out of Stock"}
              </Button>
              
              <Button
                variant="outline-danger"
                size="lg"
                onClick={() => navigate('/products')}
                className="py-3"
              >
                Continue Shopping
              </Button>
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-4 small text-muted">
              <div className="row">
                <div className="col-6">
                  <strong>Product ID:</strong> #{product.id}
                </div>
                <div className="col-6">
                  <strong>Category:</strong> {category?.name || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetails;