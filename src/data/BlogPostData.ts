// THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY.

export async function getBlogPosts() {
  const res = await fetch('http://localhost:5000/api/blogposts');
  if (!res.ok) throw new Error('Erreur lors du chargement des articles');
  return await res.json();
}
