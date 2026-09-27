# Farmart — ER Diagram

Database: `farmart.db` · Engine: SQLite 3 (WAL mode) · ORM: `better-sqlite3`  
Schema source: `src/lib/db.ts`

```mermaid
erDiagram
    categories {
        TEXT slug PK
        TEXT label
        TEXT icon
    }
    products {
        TEXT id PK
        TEXT badge
        TEXT brand
        TEXT title
        TEXT category_slug FK
        TEXT unit
        REAL price
        REAL original_price
        REAL rating
        INTEGER reviews
        TEXT description
        REAL sold_percent
        TEXT sold_text
        INTEGER is_best_seller
        INTEGER is_top_saver
        INTEGER is_just_landing
        TEXT sale_ends_at
        TEXT icon
        TEXT icon_bg
        TEXT created_at
    }
    product_images {
        INTEGER id PK
        TEXT product_id FK
        TEXT icon
        TEXT icon_bg
        INTEGER sort_order
    }
    related_products {
        TEXT product_id FK
        TEXT related_id FK
    }
    users {
        TEXT id PK
        TEXT email UK
        TEXT password_hash
        TEXT created_at
    }
    cart_items {
        INTEGER id PK
        TEXT session_id
        TEXT product_id FK
        INTEGER quantity
    }
    wishlist_items {
        TEXT user_id FK
        TEXT product_id FK
        TEXT created_at
    }

    categories ||--o{ products : "categorizes"
    products ||--o{ product_images : "has images"
    products ||--o{ related_products : "source"
    products ||--o{ related_products : "target"
    products ||--o{ cart_items : "added to cart"
    products ||--o{ wishlist_items : "saved"
    users ||--o{ wishlist_items : "owns"
```

## Tables

| Table | Columns | PK | FK |
|---|---|---|---|
| `categories` | 3 | `slug` | — |
| `products` | 19 | `id` | `category_slug` |
| `product_images` | 5 | `id` | `product_id` |
| `related_products` | 2 | `(product_id, related_id)` | `product_id`, `related_id` |
| `users` | 4 | `id` | — |
| `cart_items` | 4 | `id` | `product_id` |
| `wishlist_items` | 3 | `(user_id, product_id)` | `user_id`, `product_id` |
