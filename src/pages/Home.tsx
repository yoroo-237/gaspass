import React from "react";
import { useState } from "react";
import {
  Button,
  Container,
  Row,
  Carousel as BootstrapCarousel,
  Col,
  Card,
} from "react-bootstrap";
import {
  ArrowRight,
  StarFill,
  Cart as CartIcon,
} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import useCartStore from "../context/cartStore";
import { getReviews } from "../data/ReviewData";
import { getFeaturedProducts } from "../data/ProductData";
import { getBlogPosts } from "../data/BlogPostData";
import "./homecss.css";
import aboutImage from "../assets/about.jpg";
import MultiCarousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { Product } from '../types/Products';
import { Review } from "../types/Reviews";
import { BlogPost } from "../types/BlogPost";
import MediaCarousel from '../components/MediaCaroussel';

const Home: React.FC = () => {
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [featuredProducts, setFeaturedProducts] = React.useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = React.useState<BlogPost[]>([]);

  React.useEffect(() => {
    getReviews().then(setReviews).catch(console.error);
    getFeaturedProducts().then(setFeaturedProducts).catch(console.error);
    getBlogPosts().then(setBlogPosts).catch(console.error);
  }, []);

  // Products handlers
  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };
  
  const handleAddToCart = (
    product: Product,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        category: product.category,
        stock: product.stock,
        description: product.description,
      });
    } else {
      alert("Out of stock");
    }
  };
  
  const handleReviewClick = (id: number) => {
    navigate(`/review/${id}`);
  };

  // Navigation handlers
  const handleExploreClick = () => navigate("/products");
  const handleBlogClick = (id: number) => navigate(`/blog/${id}`);
  const handleAboutClick = () => navigate("/about");

  // shuffle utility
  const shuffleArray = <T,>(array: T[]): T[] =>
    [...array].sort(() => Math.random() - 0.5);

  // responsive settings for reviews carousel
  const reviewsResponsive = {
    superLargeDesktop: { breakpoint: { max: 4000, min: 1024 }, items: 2 },
    desktop: { breakpoint: { max: 1024, min: 768 }, items: 2 },
    tablet: { breakpoint: { max: 768, min: 464 }, items: 1 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
  };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  
  function getProductImageUrl(path: string) {
    return `${supabaseUrl}/storage/v1/object/public/product-images/${path}`;
  }

  // Fonction pour préparer les médias pour le carousel
  const prepareProductMedia = (product: Product) => {
    // Si le produit a plusieurs images/vidéos, créez un tableau
    // Sinon, utilisez l'image principale
    if (product.images && Array.isArray(product.images)) {
      return product.images.map((imagePath: string) => ({
        url: getProductImageUrl(imagePath),
        type: 'image'
      }));
    } else if (product.image) {
      return [{
        url: getProductImageUrl(product.image),
        type: 'image'
      }];
    }
    return [];
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section text-center position-relative overflow-hidden">
        <video className="bg-video" autoPlay muted loop playsInline>
          <source src="/gaspass.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="overlay" />
        <Container className="position-relative z-2">
          <img src="logo.png" alt="GasPass logo" className="mb-4" />
          <h1 className="home-title">
            Welcome to the OFFICIAL <span className="highlight">GasPass🍁</span>
          </h1>
          <p className="home-subtext">
            you'll get the best prices for the quality, stealth, and fast delivery.
          </p>
          <Button
            variant="danger"
            size="lg"
            className="mt-4 shop-now-btn"
            onClick={handleExploreClick}
          >
            Explore the shop <ArrowRight className="ms-2" />
          </Button>
        </Container>
      </section>

      {/* About Section */}
      <section className="about-section py-5 bg-white">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <img
                src={aboutImage}
                alt="About GasPass"
                className="img-fluid rounded"
              />
            </Col>
            <Col md={6} className="mt-4 mt-md-0">
              <h2 className="section-title">About GasPass</h2>
              <p className="lead">
                GasPass is a collective group of cannabis connoisseurs that fell in love with the art of growing.
                Throughout the past decade, we've been trying to perfect our craft by providing our fellow smokers and bag chasers with the best quality flower there is! Our goal is to build a bridge for everybody throughout the states to have access to top-notch, potent cannabis.
                Dealing with us, we provide the utmost transparency so everybody can be on the same page.
              </p>
              <p>
               On top of that, you'll get the best prices for the quality, stealth, and fast delivery.
                We carefully select each product in our catalog to ensure an optimal user experience.
              </p>
              <Button
                variant="outline-danger"
                className="mt-3"
                onClick={handleAboutClick}
              >
                Learn more about us
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Blog Carousel Section */}
      <section className="carousel-section py-5 bg-light">
        <Container>
          <h2 className="section-title mb-5 text-center">
            Our Featured Blog Posts
          </h2>
          <BootstrapCarousel fade indicators={false} interval={5000}>
            {blogPosts.map((post) => (
              <BootstrapCarousel.Item key={post.id}>
                <img
                  className="d-block w-100"
                  src={post.image}
                  alt={post.title}
                />
                <BootstrapCarousel.Caption>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <Button
                    variant="outline-light"
                    onClick={() => handleBlogClick(post.id)}
                  >
                    Read More
                  </Button>
                </BootstrapCarousel.Caption>
              </BootstrapCarousel.Item>
            ))}
          </BootstrapCarousel>
        </Container>
      </section>

      {/* Products Section - Corrigée */}
      <section className="products-section py-5">
        <Container>
          <h2 className="section-title mb-5 text-center">Our Best Sellers</h2>
          <Row xs={1} md={2} lg={4} className="g-4">
            {featuredProducts.map((product) => {
              const productMedia = prepareProductMedia(product);
              
              return (
                <Col key={product.id}>
                  <Card className="h-100 product-card">
                    {/* Utilisation corrigée du MediaCarousel */}
                    <div className="product-image-container">
                      {productMedia.length > 0 ? (
                        <MediaCarousel media={productMedia} />
                      ) : (
                        <div className="no-image-placeholder d-flex align-items-center justify-content-center">
                          <span className="text-muted">No image available</span>
                        </div>
                      )}
                    </div>
                    
                    <Card.Body className="d-flex flex-column">
                      <span className="badge bg-secondary mb-2 align-self-start">
                        {product.category}
                      </span>
                      <Card.Title>{product.name}</Card.Title>
                      <Card.Text className="product-description flex-grow-1">
                        {product.description}
                      </Card.Text>
                      <div className="d-flex justify-content-between align-items-center mt-auto">
                        <span className="price">
                          ${product.price.toLocaleString()}
                        </span>
                        <span className="rating">
                          <StarFill className="text-warning me-1" />
                          {product.rating ?? "N/A"}
                        </span>
                      </div>
                    </Card.Body>
                    
                    <Card.Footer className="bg-transparent">
                      <Button
                        variant="outline-danger"
                        className="w-100 mb-2"
                        onClick={() => handleProductClick(product.id)}
                      >
                        View Product <ArrowRight className="ms-2" />
                      </Button>
                      <Button
                        variant="outline-success"
                        className="w-100"
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={product.stock === 0}
                      >
                        {product.stock > 0 ? (
                          <>Add to Cart <CartIcon className="ms-2" /></>
                        ) : (
                          "Out of Stock"
                        )}
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Container>
      </section>

      {/* Reviews Section */}
      <section className="reviews-section py-5 bg-light">
        <Container>
          <h2 className="section-title mb-5 text-center">Customer Reviews</h2>
          <MultiCarousel
            responsive={reviewsResponsive}
            infinite
            autoPlay
            autoPlaySpeed={1000}
            arrows
            showDots
            containerClass="reviews-carousel"
            itemClass="px-3"
          >
            {reviews.map((review) => (
              <Card key={review.id} className="h-100 d-flex flex-column">
                <Card.Body className="flex-grow-1">
                  <div className="d-flex align-items-center mb-3">
                    <img
                      src={review.avatar}
                      alt={review.author}
                      className="avatar me-3"
                      style={{ width: 50, height: 50, borderRadius: "50%" }}
                    />
                    <div>
                      <Card.Title className="mb-1">{review.author}</Card.Title>
                      <div className="d-flex">
                        {[...Array(5)].map((_, idx) => (
                          <StarFill
                            key={idx}
                            className={
                              idx < Math.floor(review.rating!)
                                ? "text-warning"
                                : "text-muted"
                            }
                            style={{ width: 16, height: 16 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <Card.Text>{review.text}</Card.Text>
                  <div className="text-muted">
                    <small>{review.date}</small>
                  </div>
                </Card.Body>

                <Card.Footer className="bg-transparent border-0 mt-auto">
                  <Button
                    variant="link"
                    className="px-0 text-decoration-none"
                    onClick={() => handleReviewClick(review.id)}
                  >
                    Read More <ArrowRight className="ms-1" />
                  </Button>
                </Card.Footer>
              </Card>
            ))}
          </MultiCarousel>
        </Container>
      </section>
    </div>
  );
};

export default Home;