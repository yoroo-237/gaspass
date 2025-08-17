// THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY.

export async function getCategories() {
  const res = await fetch('http://localhost:5000/api/categories');
  if (!res.ok) throw new Error('Erreur lors du chargement des catégories');
  return await res.json();
}
