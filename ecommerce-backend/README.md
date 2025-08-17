# ecommerce-backend

Ce dossier contient le backend Express pour l’application EcommerceSimple.

## Installation

1. Copiez `.env.example` en `.env` et renseignez vos identifiants PostgreSQL.
2. Installez les dépendances :
   ```sh
   npm install express cors pg dotenv
   ```
3. Lancez le serveur :
   ```sh
   node server.cjs
   ```

Le backend sera accessible sur http://localhost:5000

## Endpoints disponibles
- `/api/blogposts`
- `/api/categories`
- `/api/products`
- `/api/reviews`

---

**Pensez à adapter le CORS si vous déployez en production.**
