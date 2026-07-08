# 🏠 RentNest API

> **A secure and scalable RESTful API for a rental property marketplace built with Node.js, Express, TypeScript, Prisma, PostgreSQL, and Stripe Checkout.**

RentNest enables tenants to discover rental properties, submit rental requests, make secure online payments using Stripe Checkout, and leave reviews after successful rentals. Landlords can manage their property listings and rental requests, while administrators oversee users, categories, amenities, and platform activities.

---

## 🚀 Features

### 🔐 Authentication & Authorization

- JWT Authentication using **JOSE**
- Encrypted Access & Refresh Token Management
- HTTP Only Cookie Authentication
- Role Based Access Control (RBAC)
- Protected Routes

### 👤 Tenant

- Register & Login
- Browse Properties
- Search & Filter Properties
- View Property Details
- Submit Rental Requests
- View Rental History
- Secure Stripe Checkout Payment
- View Payment History
- Leave Property Reviews

### 🏠 Landlord

- Create Property Listings
- Update Property Listings
- Delete Property Listings
- Manage Property Availability
- Approve / Reject Rental Requests
- View Rental Requests

### 👑 Admin

- View All Users
- Ban / Unban Users
- Manage Categories
- Manage Amenities
- Monitor Properties
- Monitor Rental Requests

---

# 💳 Payment Flow

```
Tenant
    │
    ▼
Submit Rental Request
    │
    ▼
Landlord Approves
    │
    ▼
Create Stripe Checkout Session
    │
    ▼
Stripe Checkout
    │
    ▼
Stripe Webhook
    │
    ▼
Payment Completed
    │
    ▼
Rental Activated
```

---

# 🛠 Tech Stack

## Backend

- Node.js
- Express.js
- TypeScript

## Database

- PostgreSQL
- Prisma ORM

## Authentication

- JOSE (JWT)
- Bcrypt

## Validation

- Zod

## Payments

- Stripe Checkout
- Stripe Webhooks

## File Upload

- Multer
- Cloudinary

## Development

- PNPM
- TSX
- TSUP
- ESLint
- Husky
- Commitlint

---

# 📂 Project Structure

```text
.
├── src
│   ├── app
│   │   ├── configs
│   │   ├── constants
│   │   ├── helpers
│   │   ├── interfaces
│   │   ├── libs
│   │   ├── middlewares
│   │   ├── utils
│   │   └── v1
│   │       ├── modules
│   │       │   ├── amenity
│   │       │   ├── auth
│   │       │   ├── category
│   │       │   ├── payment
│   │       │   ├── property
│   │       │   ├── rental
│   │       │   └── user
│   │       └── routes
│   ├── prisma
│   │   ├── generated
│   │   ├── migrations
│   │   ├── schema
│   │   └── seed
│   ├── app.ts
│   └── server.ts
├── docker-compose.yml
├── prisma.config.ts
├── tsup.config.ts
├── package.json
└── README.md
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/adnan-b-akhlas-dev/rent-nest-backend.git
```

Move into the project

```bash
cd rent-nest
```

Install dependencies

```bash
pnpm install --frozen-lockfile
```

Copy environment variables

```bash
cp .env.example .env
```

Generate Prisma Client

```bash
pnpm prisma:generate
```

Run database migrations

```bash
pnpm prisma:dev
```

Seed the admin account

```bash
pnpm seed:admin
```

(Optional) Seed demo data

```bash
pnpm seed:data
```

Start development server

```bash
pnpm dev
```

---

# 📜 Available Scripts

| Script                 | Description                             |
| ---------------------- | --------------------------------------- |
| `pnpm dev`             | Start development server                |
| `pnpm build`           | Build project                           |
| `pnpm start`           | Run production build                    |
| `pnpm lint`            | Lint project                            |
| `pnpm lint:fix`        | Fix lint issues                         |
| `pnpm prisma:dev`      | Run migrations in development           |
| `pnpm prisma:deploy`   | Apply migrations to production          |
| `pnpm prisma:generate` | Generate Prisma Client                  |
| `pnpm prisma:studio`   | Open Prisma Studio                      |
| `pnpm prisma:reset`    | Reset database                          |
| `pnpm seed:admin`      | Seed admin user                         |
| `pnpm seed:data`       | Seed demo data                          |
| `pnpm stripe:webhook`  | Forward Stripe webhooks to local server |

---

# 🌍 Environment Variables

```env
PORT
NODE_ENV
CLIENT_URL
SERVER_URL
DATABASE_URL
BCRYPT_SALT
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
JWT_ACCESS_EXPIRES_IN
JWT_REFRESH_EXPIRES_IN
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_UPLOAD_PRESET
ADMIN_EMAIL
ADMIN_PASSWORD
```

---

# 👤 Demo Admin Credentials

| Email                  | Password      |
| ---------------------- | ------------- |
| **admin@rentnest.com** | **Admin@123** |

---

# 📬 API Documentation

### Postman Workspace

https://www.postman.com/adnan-b-akhlas-dev-9537537/rent-nest/?sideView=agentMode

> You can import the collection directly from the workspace and test every endpoint.

---

# 📌 Main API Modules

- Authentication
- Users
- Categories
- Amenities
- Properties
- Rental Requests
- Payments
- Reviews

---

# 🔒 Security Features

- JOSE-based JWT Authentication
- HTTP-only Secure Cookies
- Password Hashing with Bcrypt
- Role-Based Authorization
- Request Validation using Zod
- Global Error Handling
- Centralized Response Handler
- Prisma Error Handling
- Express 5 Async Error Handling

---

# 🧪 Testing the API

1. Seed the admin account.
2. Register a landlord.
3. Register a tenant.
4. Create categories and amenities.
5. Landlord creates properties.
6. Tenant submits a rental request.
7. Landlord approves the request.
8. Tenant completes payment via Stripe Checkout.
9. Stripe webhook updates payment and rental status automatically.

---

# 🚀 Future Improvements

- Property Wishlist
- Property Image Gallery Management
- Email Notifications
- Advanced Property Search
- Pagination & Sorting
- Refresh Token Rotation
- Rate Limiting
- Swagger / OpenAPI Documentation
- Docker Deployment
- CI/CD Pipeline
