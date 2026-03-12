# Movie Full API

A comprehensive backend API for managing a movie database and user watchlists. Built with Node.js, Express, and Prisma, this project features robust authentication, detailed JSDoc documentation, and a complete unit test suite.

## 🚀 Features

- **Authentication**: Secure user registration, login, and logout using JWT and cookies.
- **Movie Management**: Full CRUD operations for movies, with ownership-based authorization.
- **Watchlist Tracking**: Users can maintain a personalized list of movies they plan to watch, are watching, or have completed.
- **Validation**: Strict request validation using Zod schemas.
- **Documentation**: Comprehensive JSDoc comments throughout the codebase for improved maintainability.
- **Unit Testing**: 20 passing unit tests using Vitest and Supertest, ensuring logic reliability across all layers.

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database ORM**: Prisma (MariaDB/MySQL)
- **Security**: JWT (JSON Web Tokens), Bcryptjs
- **Validation**: Zod
- **Testing**: Vitest, Supertest
- **Tools**: TSX, Nodemon

## 📁 Project Structure

```text
├── prisma/               # Prisma schema and seed data
├── src/
│   ├── config/           # Database and environment configuration
│   ├── controllers/      # Business logic and request handling
│   ├── middleware/       # Authentication, error handling, and validation wrappers
│   ├── routes/           # Express route definitions
│   ├── utils/            # Shared helper functions (e.g., JWT generation)
│   ├── validators/       # Zod schemas for request validation
│   └── server.js         # Application entry point
├── tests/
│   └── unit/             # Isolated unit tests for all components
└── README.md             # Project documentation
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register`: Create a new user account.
- `POST /api/auth/login`: Authenticate and receive a JWT cookie.
- `POST /api/auth/logout`: Clear the authentication cookie.

### Movies (Requires Auth)

- `GET /api/movies`: List all movies owned by the user.
- `POST /api/movies`: Register a new movie.
- `PUT /api/movies/:id`: Update an existing movie.
- `DELETE /api/movies/:id`: Remove a movie.

### Watchlist (Requires Auth)

- `POST /api/watchlist`: Add a movie to your watchlist.
- `PUT /api/watchlist/:id`: Update status, rating, or notes for a watchlist item.
- `DELETE /api/watchlist/:id`: Remove an item from the watchlist.

## ⚙️ Setup & Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/rvega1204/movie-api-nodejs-jwt.git
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and configure the following variables:

   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/db_name"
   JWT_SECRET="your_jwt_secret"
   JWT_EXPIRES_IN="1d"
   PORT=3000
   ```

4. **Database Migration**:

   ```bash
   npx prisma migrate dev
   ```

5. **Seed the Database (Optional)**:

   ```bash
   npm run seed:movies
   ```

6. **Start the server**:
   ```bash
   npm run dev
   ```

## 🧪 Testing

The project uses **Vitest** for unit testing. All tests use mocks to ensure they are isolated and do not require a live database.

Run all tests:

```bash
npm test
```

## 📄 License

This project is licensed under the **MIT License**.

## 👤 Author

**Ricardo Vega 2026**
