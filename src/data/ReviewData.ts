// THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY.

export async function getReviews() {
  const res = await fetch('http://localhost:5000/api/reviews');
  if (!res.ok) throw new Error('Erreur lors du chargement des avis');
  return await res.json();
}
