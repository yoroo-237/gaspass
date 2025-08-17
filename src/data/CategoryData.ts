// THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function getCategories() {
  const res = await fetch(`${API_URL}/api/categories`);
  if (!res.ok) throw new Error('Erreur lors du chargement des catégories');
  return await res.json();
}
