import React from "react";
import {
  Button,
  Container,
  Carousel,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import {
  ArrowRight,
  StarFill,
  Calendar as CalendarIcon,
  Cart as CartIcon,
} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import useCartStore from "../context/cartStore";

import featuredProducts from "../data/ProductData";
import blogPosts from "../data/BlogData";
import "./homecss.css";
import aboutImage from "../assets/about.jpg";


interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  rating?: number;
  stock: number;
}

const Home: React.FC = () => {
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

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

  const handleExploreClick = () => {
    navigate("/products");
  };

  const handleBlogClick = (id: number) => {
    navigate(`/blog/${id}`);
  };

  const handleAboutClick = () => {
    navigate("/about");
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section text-center">
        <Container>
          <h1 className="home-title">
            Welcome to the OFFICIAL <span className="highlight">GasPass🍁</span>
          </h1>
          <p className="home-subtext">
          you’ll get the best prices for the quality, stealth, and fast delivery.
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
              <img src={aboutImage} alt="About GasPass" className="img-fluid rounded" />
            </Col>
            <Col md={6} className="mt-4 mt-md-0">
              <h2 className="section-title">About GasPass</h2>
              <p className="lead">
                GasPass is a collective group of cannabis connoisseurs that fell in love with the art of growing.
                Throughout the past decade, we’ve been trying to perfect our craft by providing our fellow smokers and bag chasers with the best quality flower there is! Our goal is to build a bridge for everybody throughout the states to have access to top-notch, potent cannabis.
                Dealing with us, we provide the utmost transparency so everybody can be on the same page.
              </p>
              <p>
               On top of that, you’ll get the best prices for the quality, stealth, and fast delivery.
                We carefully select each product in our catalog to ensure an optimal user experience.
              </p>
              <Button variant="outline-danger" className="mt-3" onClick={handleAboutClick}>
                Learn more about us
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Carousel Section */}
      <section className="carousel-section py-5 bg-light">
        <Container>
          <h2 className="section-title mb-5 text-center">Our Featured Products</h2>
          <Carousel fade indicators={false}>
            <Carousel.Item>
              <img
                className="d-block w-100"
                src="https://images.unsplash.com/photo-1623840767329-5f73c0c6a0b9?auto=format&fit=crop&w=1200&q=80"
                alt="Special Promotion"
              />
              <Carousel.Caption>
                <h3>Exceptional Promotion</h3>
                <p>Up to 30% off selected products</p>
              </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="d-block w-100"
                src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80"
                alt="New Releases 2023"
              />
              <Carousel.Caption>
                <h3>New Releases 2023</h3>
                <p>Check out our latest releases</p>
              </Carousel.Caption>
            </Carousel.Item>
          </Carousel>
        </Container>
      </section>

      {/* Products Section */}
      <section className="products-section py-5">
        <Container>
          <h2 className="section-title mb-5 text-center">Our Best Sellers</h2>
          <Row xs={1} md={2} lg={4} className="g-4">
            {featuredProducts.map((product) => (
              <Col key={product.id}>
                <Card className="h-100 product-card">
                  <Card.Img variant="top" src={product.image} />
                  <Card.Body>
                    <div className="product-category mb-2">
                      <span className="badge bg-secondary">{product.category}</span>
                    </div>
                    <Card.Title>{product.name}</Card.Title>
                    <Card.Text className="product-description">
                      {product.description}
                    </Card.Text>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <span className="price">
                        {product.price.toLocaleString()} FCFA
                      </span>
                      <span className="rating">
                        <StarFill className="text-warning" />{" "}
                        {product.rating !== undefined ? product.rating : "N/A"}
                      </span>
                    </div>
                  </Card.Body>
                  <Card.Footer>
                    <Button
                      variant="outline-danger"
                      className="w-100"
                      onClick={() => handleProductClick(product.id)}
                    >
                      View Product <ArrowRight className="ms-2" />
                    </Button>
                    <Button
                      variant="outline-success"
                      className="mt-2 w-100"
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      Add to Cart <CartIcon className="ms-2" />
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-5">
            <Button variant="outline-danger" size="lg" onClick={handleExploreClick}>
              View All Products <ArrowRight className="ms-2" />
            </Button>
          </div>
        </Container>
      </section>

      {/* Blog Section */}
      <section className="blog-section py-5 bg-light">
        <Container>
          <h2 className="section-title mb-5 text-center">Our Blog</h2>
          <Row>
            {blogPosts.map((post) => (
              <Col md={6} key={post.id} className="mb-4">
                <Card className="h-100">
                  <Card.Img variant="top" src={post.image} />
                  <Card.Body>
                    <Card.Title>{post.title}</Card.Title>
                    <Card.Text>{post.excerpt}</Card.Text>
                    <div className="d-flex align-items-center text-muted">
                      <CalendarIcon className="me-2" />
                      <small>{post.date}</small>
                    </div>
                  </Card.Body>
                  <Card.Footer>
                    <Button
                      variant="link"
                      className="px-0"
                      onClick={() => handleBlogClick(post.id)}
                    >
                      Read Post <ArrowRight className="ms-2" />
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;
