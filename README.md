# SwifPass Business

SwifPass Business is a modern web application built with **Vite** and **React**. It provides a secure onboarding flow, dashboards, and compliance management for businesses.

The app runs on **port 3001** by default.

---

## Table of Contents

* [Installation](#installation)
* [Available Scripts](#available-scripts)
* [Routes](#routes)
* [Project Structure](#project-structure)
* [Technologies Used](#technologies-used)
* [Contributing](#contributing)
* [License](#license)

---

## Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd swifpass-business
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

The app will run at [http://localhost:3001](http://localhost:3001).

---

## Available Scripts

* `dev` – Starts the Vite development server.
* `build` – Builds the app for production.
* `preview` – Previews the production build locally.
* `lint` – Runs code linting (if configured).
* `format` – Formats code using Prettier (if configured).

---

## Routes

### Authentication & Onboarding

| Route                        | Description                 |
| ---------------------------- | --------------------------- |
| `/`                          | Login page                  |
| `/forgot-password`           | Forgot password flow        |
| `/otp`                       | OTP verification            |
| `/confirm-password`          | Confirm password            |
| `/onboarding/registration`   | User registration           |
| `/onboarding/otp`            | Onboarding OTP verification |
| `/onboarding/create-account` | Create a new account        |
| `/onboarding/upload-docs`    | Upload required documents   |

### Dashboards & Compliance

| Route                             | Description                |
| --------------------------------- | -------------------------- |
| `/dashboard`                      | Main dashboard             |
| `/compliance`                     | Compliance overview        |
| `/compliance/document-categories` | Manage document categories |

### Notifications

| Route            | Description             |
| ---------------- | ----------------------- |
| `/notifications` | View user notifications |

---

## Project Structure

```
src/
├─ assets/        # Images, SVGs, icons
├─ components/    # Reusable UI components
├─ constants/     # Constants used widely in the app
├─ features/      # Contains pages and components that all work together
├─ routes/        # Handles app wide routing
├─ hooks/         # App wide hook managemt
├─ services/      # API calls and integrations
├─ store/         # State management (e.g., Redux)
├─ types/         # TypeScript types
├─ utils/         # Helper functions
└─ main.tsx       # App entry point
```

---

## Technologies Used

* [Vite](https://vitejs.dev/) – Frontend build tool
* [React](https://reactjs.org/) – UI library
* [TypeScript](https://www.typescriptlang.org/) – Typed JavaScript
* [Tailwind CSS](https://tailwindcss.com/) – Utility-first styling (optional)
* [React Router](https://reactrouter.com/) – Client-side routing

---

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/my-feature`
3. Make your changes and commit: `git commit -m "Add feature"`
4. Push to your branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

**SwifPass Business** – Secure, fast, and user-friendly onboarding and business management.
