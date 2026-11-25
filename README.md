🛍️ Ecommerce Shop — Modern React Storefront
A responsive e-commerce web application built with React 19, Vite, and Redux Toolkit, engineered for smooth product discovery, cart and wishlist workflows, customer reviews, and clean maintainable code.

✨ Key Features
Catalog, Search & Filtering: Browse products smoothly with search, category/price filtering, sorting, and URL-synced query state.

Rich Product Details: Multi-image gallery, stock indicators, discount badges, related products marquee, and interactive customer reviews (add & delete).

Cart & Wishlist Management: Add items, adjust quantities, toggle wishlist items, and stay synced with real-time API state.

Form Validation & UX: Structured forms powered by React Hook Form and Zod, paired with Framer Motion and Lottie animations plus SweetAlert2 / Toast feedback.

Session Handling: Cookie-based session management via js-cookie and protected/authenticated flows.

🧠 Engineering & Code Quality Highlights
Server State & Caching: Powered by RTK Query for predictable API fetching, caching, and mutations.

Automated Code Quality Gate: Enforces formatting and lint rules across src/ with Biome, running automatically on staged files via Husky and lint-staged (*.{js,jsx,ts,tsx,json,css}).

Git Hooks with Husky: Configured with Husky (prepare script) so code formatting and linting checks run automatically before commits to keep the repository clean.

🛠️ Tech Stack
Layer	Technologies
Core & Routing	React 19, Vite, React Router DOM
State & API	Redux Toolkit, RTK Query, js-cookie
Forms & Validation	React Hook Form, Zod, @hookform/resolvers
UI & Motion	Tailwind CSS v4, Lucide React, Framer Motion, Lottie React, SweetAlert2, React Toastify
Linting & Hooks	Biome, Husky, lint-staged
🚀 Getting Started
1. Clone & Install
Bash
git clone <your-repo-url>
cd ecommerce_shop
npm install
Husky Git Hooks: Running npm install triggers the prepare script and sets up Husky Git hooks automatically. To initialize or attach hooks manually at any time:

Bash
npx husky
2. Environment Variables
Create a .env file in the project root if your backend API URL is configured via Vite environment variables:

 3. Run Locally
Bash
npm run dev
📜 Available Scripts
Command	Description
npm run dev	Start the Vite development server
npm run build	Build the app for production
npm run preview	Preview the production build locally
npm run lint	Run Biome check across src/
npm run format	Auto-format files in src/ with Biome
npm run prepare	Initialize Husky Git hooks
 

🗺️ Roadmap
[ ] Checkout & order history flow

[ ] Payment gateway integration

[ ] Performance & bundle optimization polish


