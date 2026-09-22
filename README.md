# Library & Book Rental Management System (MERN)

Backend-focused MERN app: catalog browsing, cart, checkout with a 14-day
rental fee, and email confirmation. Frontend is intentionally simple/functional.

## Design decisions (matching your notes)

- **Reusable, same-syntax functions:** `backend/utils/controllerFactory.js`
  generates identical create/getAll/getOne/update/remove handlers for any
  Mongoose model. `bookController.js` reuses this factory and only overrides
  the parts that need book-specific logic (format/availability filters,
  GridFS cover streaming). `frontend/src/api/api.js` has one `request()`
  function that every API call goes through.
- **DB schema** matches what you listed: `User` (role, name, email, password),
  `Book` (title, author, description, coverImageId, category, formats[]
  with per-format price+copies), `RentOrder` (userId, books[] with
  bookId/format/count, rentDate, rentCloseDate, fee), and `CartItem`
  (userId/guestId, bookId, format, count).
- **Fee formula:** `days(14) * pricePerDay(for that format) * count`,
  implemented once in `utils/fee.js` and reused by checkout.
- **Role-based JWT auth:** `middleware/auth.js` has `protect` (must be
  logged in), `identify` (logged in OR guest, for the cart), and
  `restrictTo("admin")` for catalog management.
- **GridFS + image optimization:** covers are uploaded via Multer straight
  into GridFS (`middleware/upload.js`) and streamed back out via
  `GET /api/books/:id/cover?w=300`, optionally resized on the fly with
  `sharp` — no separate resized copy is stored.
- **Pagination:** `?page=1&limit=10` (default 10), combinable with
  `search`, `category`, `format`, `availability` filters.

## Setup

### Backend
```bash
cd backend
cp .env.example .env    # fill in MONGO_URI, JWT_SECRET, SMTP_* (Nodemailer)
npm install
npm run seed             # inserts 24 demo books + an admin user (admin@library.local / Admin@123)
npm run dev               # starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm start                 # starts on http://localhost:3000
```

## API overview

| Method | Route                         | Auth        | Notes |
|--------|--------------------------------|-------------|-------|
| POST   | /api/auth/register             | -           | |
| POST   | /api/auth/login                | -           | |
| GET    | /api/auth/me                   | user        | |
| GET    | /api/books?search=&category=&format=&availability=&page=&limit= | - | combinable filters |
| GET    | /api/books/:id                 | -           | |
| GET    | /api/books/:id/cover?w=        | -           | streamed from GridFS |
| POST   | /api/books (multipart, field `cover`) | admin | |
| PUT    | /api/books/:id (multipart)     | admin       | |
| DELETE | /api/books/:id                 | admin       | |
| GET/POST/PUT/DELETE | /api/cart[...]    | user or guest (`x-guest-id` header) | |
| POST   | /api/cart/merge                | user        | merges guest cart on login |
| POST   | /api/orders/checkout           | user        | mock checkout, sends email |
| GET    | /api/orders                    | user        | |
| GET    | /api/orders/:id                | user        | |

## Notes

- Uses MongoDB transactions-free stock decrement (per-line `$inc`); fine for
  an assignment, but a real production version should wrap checkout in a
  Mongo session/transaction for full atomicity.
- Nodemailer is configured for SMTP (Gmail example in `.env.example`) — use
  an App Password, not your real password.
