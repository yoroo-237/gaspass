// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Interface pour la gestion des erreurs
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Fonction utilitaire pour les requêtes API
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(response.status, errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error('API Request failed:', error);
    throw new ApiError(0, 'Network error or server unavailable');
  }
}

// Services pour les produits
export const ProductService = {
  // Récupérer tous les produits
  async getAll(params?: {
    page?: number;
    limit?: number;
    category?: string | number;
    featured?: boolean;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category && params.category !== 'All') {
      searchParams.append('category', params.category.toString());
    }
    if (params?.featured) searchParams.append('featured', 'true');
    
    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<any[]>(endpoint);
  },

  // Récupérer un produit par ID
  async getById(id: number) {
    return apiRequest<any>(`/products/${id}`);
  },

  // Récupérer les produits en vedette
  async getFeatured() {
    return apiRequest<any[]>('/products/featured');
  },

  // Rechercher des produits
  async search(params: {
    q?: string;
    category?: string | number;
    min_price?: number;
    max_price?: number;
    sort?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params.q) searchParams.append('q', params.q);
    if (params.category && params.category !== 'All') {
      searchParams.append('category', params.category.toString());
    }
    if (params.min_price) searchParams.append('min_price', params.min_price.toString());
    if (params.max_price) searchParams.append('max_price', params.max_price.toString());
    if (params.sort) searchParams.append('sort', params.sort);
    
    return apiRequest<any[]>(`/search/products?${searchParams.toString()}`);
  }
};

// Services pour les catégories
export const CategoryService = {
  async getAll() {
    return apiRequest<any[]>('/categories');
  }
};

// Services pour les reviews
export const ReviewService = {
  async getAll() {
    return apiRequest<any[]>('/reviews');
  },

  async getById(id: number) {
    return apiRequest<any>(`/reviews/${id}`);
  },

  async getByProductId(productId: number) {
    return apiRequest<any[]>(`/products/${productId}/reviews`);
  }
};

// Services pour les posts de blog
export const BlogService = {
  async getAll() {
    return apiRequest<any[]>('/blogposts');
  },

  async getById(id: number) {
    return apiRequest<any>(`/blogposts/${id}`);
  }
};

// Service pour les statistiques
export const StatsService = {
  async get() {
    return apiRequest<{
      products: number;
      categories: number;
      reviews: number;
    }>('/stats');
  }
};

// Service pour vérifier la santé de l'API
export const HealthService = {
  async check() {
    return apiRequest<{
      status: string;
      database: string;
      server_time: string;
      environment: string;
    }>('/health');
  }
};

// Fonctions compatibles avec l'ancien système (pour la transition)
export async function getFeaturedProducts() {
  return ProductService.getFeatured();
}

export async function getCategories() {
  return CategoryService.getAll();
}

export async function getReviews() {
  return ReviewService.getAll();
}

export async function getBlogPosts() {
  return BlogService.getAll();
}