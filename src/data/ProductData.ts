// THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY.

export async function getFeaturedProducts() {
  const res = await fetch('http://localhost:5000/api/products');
  if (!res.ok) throw new Error('Erreur lors du chargement des produits');
  return await res.json();
}
