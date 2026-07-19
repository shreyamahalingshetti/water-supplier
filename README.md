# Water Supplier Application

Water Supplier is a full-stack water ordering and delivery platform with a Node.js/Express backend and a React/Vite frontend. The customer app supports bilingual navigation, order placement, login/signup, and dashboards, while the backend exposes REST APIs for authentication, orders, recurring orders, users, notifications, and disruptions.

## Project Structure

- `backend/`: Express API server with Supabase, Twilio, and shared middleware/services.
- `frontend/`: React client built with Vite and Tailwind CSS.

## Features

- Customer landing page with bilingual support.
- Login, signup, dashboard, and order placement flows.
- Admin login and admin dashboard routes.
- Order, recurring order, notification, disruption, and user APIs.
- Security middleware with `helmet`, `cors`, and `compression`.

## Requirements

- Node.js 18 or newer.
- npm.
- Supabase project credentials.
- Twilio credentials if notifications are enabled.

## Environment Variables

Create a `.env` file in the backend folder with the values used by the server:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

Create a frontend `.env` file if you want the client to call a different API base URL:

```env
VITE_API_URL=http://localhost:5000/api
```

## Installation

Install dependencies separately for the backend and frontend:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Running Locally

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

The backend runs on `http://localhost:5000` by default. The frontend uses the Vite dev server and calls the API through `VITE_API_URL` or `http://localhost:5000/api`.

## Available Scripts

### Backend

- `npm run dev`: start the API with `nodemon`.
- `npm start`: start the API with Node.js.

### Frontend

- `npm run dev`: start the Vite dev server.
- `npm run build`: build the production bundle.
- `npm run lint`: run ESLint.
- `npm run preview`: preview the production build.

## Backend Routes

The API is mounted under `/api` and includes these route groups:

- `/api/auth`
- `/api/orders`
- `/api/recurring-orders`
- `/api/notifications`
- `/api/disruptions`
- `/api/users`

The root route returns a health check response.

## Notes

- Admin pages are intentionally kept separate from the bilingual customer experience.
- The backend uses Supabase for data access and Twilio for notification delivery.
