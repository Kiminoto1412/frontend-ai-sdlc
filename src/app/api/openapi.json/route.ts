import { NextResponse } from "next/server";

const spec = {
  openapi: "3.0.3",
  info: {
    title: "Farmart Grocery API",
    version: "1.0.0",
    description:
      "REST API backing the Farmart online grocery storefront. Covers products, categories, cart, wishlist, and authentication.",
    contact: {
      name: "Farmart Engineering",
      email: "paruj.lab@bigc.co.th",
    },
  },
  servers: [
    { url: "/api", description: "Same-origin API" },
  ],
  tags: [
    { name: "Products", description: "Browse and search the product catalogue" },
    { name: "Categories", description: "Product category hierarchy" },
    { name: "Cart", description: "Shopping cart management" },
    { name: "Wishlist", description: "Saved-for-later items" },
    { name: "Auth", description: "Registration and login" },
  ],
  paths: {
    "/products": {
      get: {
        tags: ["Products"],
        summary: "List products",
        description:
          "Returns a paginated list of products. Supports filtering by category, price range, and free-text search.",
        operationId: "listProducts",
        parameters: [
          {
            name: "q",
            in: "query",
            description: "Free-text search term",
            schema: { type: "string", example: "banana" },
          },
          {
            name: "category",
            in: "query",
            description: "Slug of the category to filter by",
            schema: {
              type: "string",
              enum: [
                "fruits-vegetables",
                "breads-sweets",
                "frozen-seafoods",
                "raw-meats",
                "wines-alcohol-drinks",
                "coffees-teas",
                "milks-dairies",
                "pet-foods",
              ],
            },
          },
          {
            name: "sort",
            in: "query",
            schema: {
              type: "string",
              enum: ["price_asc", "price_desc", "rating_desc", "newest"],
              default: "newest",
            },
          },
          {
            name: "minPrice",
            in: "query",
            schema: { type: "number", example: 0 },
          },
          {
            name: "maxPrice",
            in: "query",
            schema: { type: "number", example: 200 },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          "200": {
            description: "Paginated product list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductListResponse" },
                example: {
                  data: [
                    {
                      id: "ice-birds-beer-350ml",
                      badge: "Sale 12%",
                      brand: "Ice Bird's Brewery",
                      title: "Ice Bird's Beer 350ml x 24 Pack",
                      category: "wines-alcohol-drinks",
                      unit: "24 cans x 350ml",
                      price: 89.9,
                      originalPrice: 102.0,
                      rating: 4,
                      reviews: 18,
                      description:
                        "A crisp, refreshing lager brewed in small batches.",
                      images: [
                        { icon: "🍺", iconBg: "bg-amber-100" },
                      ],
                    },
                  ],
                  pagination: {
                    page: 1,
                    limit: 20,
                    total: 1,
                    totalPages: 1,
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get product by ID",
        operationId: "getProduct",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Product slug / identifier",
            schema: { type: "string", example: "british-beef-mince" },
          },
        ],
        responses: {
          "200": {
            description: "Product detail",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductDetail" },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/products/best-sellers": {
      get: {
        tags: ["Products"],
        summary: "Best-seller products",
        description: "Returns the current best-seller list, optionally filtered by category tab.",
        operationId: "getBestSellers",
        parameters: [
          {
            name: "category",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "all",
                "fruits-vegetables",
                "frozen-seafoods",
                "raw-meats",
                "coffees-teas",
                "milks-dairies",
              ],
              default: "all",
            },
          },
        ],
        responses: {
          "200": {
            description: "Best-seller product list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Product" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/products/top-savers": {
      get: {
        tags: ["Products"],
        summary: "Top-saver (flash-sale) products",
        description:
          "Returns products currently on flash sale. Each item includes a soldPercent progress indicator and the sale end time.",
        operationId: "getTopSavers",
        responses: {
          "200": {
            description: "Top-saver list with sale metadata",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    saleEndsAt: {
                      type: "string",
                      format: "date-time",
                      description: "ISO-8601 timestamp when the flash sale ends",
                    },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Product" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "List all categories",
        operationId: "listCategories",
        responses: {
          "200": {
            description: "Category list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Category" },
                    },
                  },
                },
                example: {
                  data: [
                    { slug: "fruits-vegetables", label: "Fruits & Vegetables", icon: "🍊" },
                    { slug: "breads-sweets", label: "Breads & Sweets", icon: "🍞" },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/cart": {
      get: {
        tags: ["Cart"],
        summary: "Get current cart",
        operationId: "getCart",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Cart contents",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Cart" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      delete: {
        tags: ["Cart"],
        summary: "Clear cart",
        operationId: "clearCart",
        security: [{ bearerAuth: [] }],
        responses: {
          "204": { description: "Cart cleared" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/cart/items": {
      post: {
        tags: ["Cart"],
        summary: "Add item to cart",
        operationId: "addCartItem",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CartItemInput" },
              example: { productId: "british-beef-mince", quantity: 2 },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated cart",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Cart" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/cart/items/{productId}": {
      put: {
        tags: ["Cart"],
        summary: "Update item quantity",
        operationId: "updateCartItem",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["quantity"],
                properties: {
                  quantity: { type: "integer", minimum: 0 },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated cart",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Cart" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Cart"],
        summary: "Remove item from cart",
        operationId: "removeCartItem",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Updated cart",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Cart" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/wishlist": {
      get: {
        tags: ["Wishlist"],
        summary: "Get wishlist",
        operationId: "getWishlist",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Wishlist items",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Product" },
                    },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        tags: ["Wishlist"],
        summary: "Add product to wishlist",
        operationId: "addToWishlist",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["productId"],
                properties: {
                  productId: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Added to wishlist" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "409": {
            description: "Already in wishlist",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/wishlist/{productId}": {
      delete: {
        tags: ["Wishlist"],
        summary: "Remove product from wishlist",
        operationId: "removeFromWishlist",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": { description: "Removed from wishlist" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new account",
        description: "Creates a new user account. New members receive a 15% discount coupon on their first order.",
        operationId: "register",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterInput" },
              example: {
                email: "shopper@example.com",
                password: "SecurePass123!",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Account created — returns JWT token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "409": {
            description: "Email already registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in",
        operationId: "login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginInput" },
              example: {
                email: "shopper@example.com",
                password: "SecurePass123!",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Authenticated — returns JWT token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      GalleryImage: {
        type: "object",
        required: ["icon", "iconBg"],
        properties: {
          icon: { type: "string", example: "🍺" },
          iconBg: {
            type: "string",
            description: "Tailwind background color class",
            example: "bg-amber-100",
          },
        },
      },
      Product: {
        type: "object",
        required: ["id", "brand", "title", "rating", "reviews", "price"],
        properties: {
          id: { type: "string", example: "british-beef-mince" },
          badge: { type: "string", example: "Sale 20%", nullable: true },
          brand: { type: "string", example: "MeatFarm" },
          title: { type: "string", example: "British Beef Mince (Specially Fed)" },
          rating: { type: "number", minimum: 0, maximum: 5, example: 5 },
          reviews: { type: "integer", minimum: 0, example: 33 },
          price: { type: "number", format: "float", example: 9.99 },
          originalPrice: {
            type: "number",
            format: "float",
            nullable: true,
            example: 12.5,
          },
          soldPercent: {
            type: "number",
            minimum: 0,
            maximum: 100,
            nullable: true,
            description: "Flash-sale sold percentage (0–100)",
          },
          soldText: {
            type: "string",
            nullable: true,
            example: "Sold: 20/32",
          },
        },
      },
      ProductDetail: {
        allOf: [
          { $ref: "#/components/schemas/Product" },
          {
            type: "object",
            required: ["category", "unit", "description", "images", "related"],
            properties: {
              category: { type: "string", example: "Wines & Alcohol Drinks" },
              unit: { type: "string", example: "24 cans x 350ml" },
              description: {
                type: "string",
                example: "A crisp, refreshing lager brewed in small batches.",
              },
              images: {
                type: "array",
                items: { $ref: "#/components/schemas/GalleryImage" },
              },
              related: {
                type: "array",
                items: { $ref: "#/components/schemas/Product" },
              },
            },
          },
        ],
      },
      ProductListResponse: {
        type: "object",
        required: ["data", "pagination"],
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Product" },
          },
          pagination: {
            type: "object",
            required: ["page", "limit", "total", "totalPages"],
            properties: {
              page: { type: "integer" },
              limit: { type: "integer" },
              total: { type: "integer" },
              totalPages: { type: "integer" },
            },
          },
        },
      },
      Category: {
        type: "object",
        required: ["slug", "label", "icon"],
        properties: {
          slug: { type: "string", example: "fruits-vegetables" },
          label: { type: "string", example: "Fruits & Vegetables" },
          icon: { type: "string", example: "🍊" },
        },
      },
      CartItem: {
        type: "object",
        required: ["product", "quantity"],
        properties: {
          product: { $ref: "#/components/schemas/Product" },
          quantity: { type: "integer", minimum: 1 },
          lineTotal: { type: "number", format: "float" },
        },
      },
      Cart: {
        type: "object",
        required: ["items", "subtotal", "itemCount"],
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/CartItem" },
          },
          subtotal: { type: "number", format: "float", example: 2480.59 },
          itemCount: { type: "integer", example: 2 },
          freeDeliveryThreshold: {
            type: "number",
            format: "float",
            example: 50.0,
            description: "Order value required for free delivery",
          },
        },
      },
      CartItemInput: {
        type: "object",
        required: ["productId", "quantity"],
        properties: {
          productId: { type: "string", example: "british-beef-mince" },
          quantity: { type: "integer", minimum: 1, example: 2 },
        },
      },
      RegisterInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: {
            type: "string",
            minLength: 8,
            description: "Minimum 8 characters",
          },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      AuthResponse: {
        type: "object",
        required: ["token", "expiresIn"],
        properties: {
          token: {
            type: "string",
            description: "JWT bearer token",
          },
          expiresIn: {
            type: "integer",
            description: "Token lifetime in seconds",
            example: 86400,
          },
        },
      },
      Error: {
        type: "object",
        required: ["message"],
        properties: {
          message: { type: "string" },
          code: { type: "string" },
        },
      },
    },
    responses: {
      BadRequest: {
        description: "Invalid request parameters",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      Unauthorized: {
        description: "Missing or invalid authentication token",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
  },
};

export function GET() {
  return NextResponse.json(spec, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
