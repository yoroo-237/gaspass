// THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function getReviews() {
  const res = await fetch(`${API_URL}/api/reviews`);
  if (!res.ok) throw new Error('Erreur lors du chargement des avis');
  return await res.json();
}
