# SlotSwapper: Peer-to-Peer Time-Slot Scheduling Application

![SlotSwapper Concept](https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/main/docs/slotswapper-concept.png)
*(Optional: Replace `YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/main/docs/slotswapper-concept.png` with a link to an actual screenshot or diagram if you create one in your repo. For now, it's a placeholder to show where it would go.)*

## Table of Contents

1.  [Overview](#overview)
2.  [Features](#features)
3.  [Technology Stack](#technology-stack)
4.  [Design Choices](#design-choices)
5.  [Getting Started](#getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Backend Setup](#backend-setup)
    *   [Frontend Setup](#frontend-setup)
6.  [API Endpoints](#api-endpoints)
    *   [Authentication (`/api/auth`)](#authentication-api-auth)
    *   [Events (`/api/events`)](#events-api-events)
    *   [Swaps (`/api/swaps`)](#swaps-api-swaps)
7.  [Assumptions and Challenges](#assumptions-and-challenges)
8.  [Bonus Features (Considerations)](#bonus-features-considerations)
9.  [Live Demo (Optional)](#live-demo-optional)
10. [GitHub Repository](#github-repository)

---

## 1. Overview

SlotSwapper is a peer-to-peer time-slot scheduling application designed to allow users to manage their personal calendar events and facilitate flexible time slot exchanges. Users can mark their busy calendar slots as "swappable," which then become visible to other users in a marketplace. Other users can then initiate a swap request, offering one of their own swappable slots in return. The core of the application lies in its robust swap logic, ensuring atomic updates and maintaining data consistency across user calendars.

This project was built as a technical challenge to demonstrate full-stack development skills, covering data modeling, complex API logic, user authentication, and responsive frontend state management.

## 2. Features

*   **User Authentication:** Secure user registration and login using JWT for session management.
*   **Personal Calendar/Dashboard:**
    *   View, create, edit, and delete personal events.
    *   Toggle event status between `BUSY` and `SWAPPABLE`.
    *   Events currently involved in a `PENDING` swap request are visually indicated and their status is locked.
*   **Marketplace for Swappable Slots:**
    *   Browse a real-time list of `SWAPPABLE` events posted by other users.
    *   Initiate a swap request for a desired slot by offering one of your own `SWAPPABLE` slots.
*   **Swap Requests Management:**
    *   **Incoming Requests:** View requests sent by other users, with options to "Accept" or "Reject."
    *   **Outgoing Requests:** Monitor the status of swap requests you have sent to others (e.g., "Pending", "Accepted", "Rejected").
*   **Atomic Swap Logic:** Backend employs MongoDB transactions to ensure that an event swap (changing ownership and status) is an all-or-nothing operation, preventing inconsistent data states.

## 3. Technology Stack

*   **Frontend:**
    *   **React (with Vite):** Fast development build times and modern React features.
    *   **Material UI (MUI):** Comprehensive React UI library for responsive and accessible design components.
    *   **Axios:** Promise-based HTTP client for API requests.
    *   **React Router DOM:** For declarative routing within the single-page application.
    *   **date-fns:** Lightweight and efficient date utility library.
    *   **MUI X Date Pickers:** Material UI components for date and time selection.
*   **Backend:**
    *   **Node.js (with Express):** Fast, unopinionated, minimal web framework for the API server.
    *   **MongoDB (with Mongoose):** NoSQL database for flexible data storage, Mongoose for object data modeling (ODM).
    *   **JSON Web Tokens (JWT):** Securely transmit information between parties as a JSON object for authentication.
    *   **Bcrypt.js:** For hashing user passwords securely.
    *   **CORS:** Middleware to enable Cross-Origin Resource Sharing.
    *   **Dotenv:** To load environment variables from a `.env` file.
*   **Database:** MongoDB

## 4. Design Choices

*   **MERN Stack:** Chosen for its popularity, strong community support, and my familiarity with JavaScript across the full stack, allowing for consistent development. Vite was selected for the frontend for its modern tooling and improved developer experience over Create React App.
*   **Material UI:** Leveraged to accelerate UI development, ensure a consistent design language, and provide built-in accessibility features, allowing more focus on core logic.
*   **JWT for Authentication:** Provides a stateless authentication mechanism, suitable for single-page applications and microservices architectures, enhancing scalability.
*   **MongoDB Transactions:** Critically used for the core swap logic (`createSwapRequest` and `respondToSwapRequest`). This ensures that multiple interdependent database operations (e.g., updating two event owners and their statuses) are treated as a single, atomic unit. If any part of the transaction fails, all changes are rolled back, preventing partial updates and maintaining data integrity.
*   **Modular Backend:** The backend is organized into `models`, `controllers`, `routes`, and `middleware` for better separation of concerns, maintainability, and scalability.
*   **Context API for Frontend State:** `AuthContext` is used for global authentication state management, simplifying access to user information and authentication functions across components without external libraries like Redux.

## 5. Getting Started

Follow these instructions to set up and run the SlotSwapper application on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js:** (v14 or higher recommended)
    *   Verify with: `node -v`
*   **npm:** (Node Package Manager, usually comes with Node.js)
    *   Verify with: `npm -v`
*   **MongoDB Instance:** You'll need a running MongoDB database.
    *   **Option A (Recommended for transactions):** Use MongoDB Atlas (cloud-hosted free tier) and create a cluster configured as a Replica Set. This is necessary for backend transactions to function correctly.
    *   **Option B (Local, for development without transactions):** Install MongoDB locally. If you wish to use transactions with a local setup, you must configure your local MongoDB instance as a Replica Set. Otherwise, you may need to disable/remove the transaction logic from the `swapController.js` (which would make the swap logic less robust against failures).

### Backend Setup

1.  **Navigate to the `server` directory:**
    ```bash
    cd slotswapper/server
    ```
2.  **Install backend dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env` file:** In the `slotswapper/server` directory, create a file named `.env` and add the following environment variables. Replace the placeholder values with your actual MongoDB connection string and a strong, secret key for JWT.
    ```dotenv
    MONGO_URI=your_mongodb_atlas_connection_string_here # e.g., mongodb+srv://<user>:<password>@cluster0.abcde.mongodb.net/slotswapper?retryWrites=true&w=majority
    JWT_SECRET=a_very_long_and_complex_secret_string_for_jwt_signing_like_a_random_uuid
    PORT=5000
    ```
    *   **`MONGO_URI`**: Get this from your MongoDB Atlas cluster (Connect -> Drivers -> Node.js -> Version `4.0 or later` -> Copy the connection string). Make sure to replace `<password>` with your database user's password and `<dbname>` with `slotswapper` (or your desired database name).
    *   **`JWT_SECRET`**: Generate a strong, random string (e.g., using a password generator).
4.  **Start the backend server:**
    ```bash
    npm start
    ```
    You should see output indicating "MongoDB connected" and "Server running on port 5000". Keep this terminal running.

### Frontend Setup

1.  **Navigate to the `client` directory:**
    ```bash
    cd slotswapper/client
    ```
2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```
3.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```
    Vite will start the React application, usually on `http://localhost:5173`. Open this URL in your web browser.

You should now have both the backend and frontend running and accessible!

## 6. API Endpoints

The backend API is served from `http://localhost:5000/api/`.
**Authentication (JWT Bearer Token)**: For all private routes, include an `Authorization` header with the format `Bearer <YOUR_JWT_TOKEN>`.

### Authentication (`/api/auth`)

| Method | Endpoint      | Description           | Access      | Request Body                                        | Response                                               |
| :----- | :------------ | :-------------------- | :---------- | :-------------------------------------------------- | :----------------------------------------------------- |
| `POST` | `/register`   | Register a new user   | Public      | `{ "name": "...", "email": "...", "password": "..." }` | `{ "_id": "...", "name": "...", "email": "...", "token": "..." }`                          |
| `POST` | `/login`      | Log in a user         | Public      | `{ "email": "...", "password": "..." }`                               | `{ "_id": "...", "name": "...", "email": "...", "token": "..." }`                          |

### Events (`/api/events`)

| Method   | Endpoint          | Description                        | Access    | Request Body                                                                      | Response                                          |
| :------- | :---------------- | :--------------------------------- | :-------- | :-------------------------------------------------------------------------------- | :------------------------------------------------ |
| `GET`    | `/`               | Get all logged-in user's events    | Private   | None                                                                              | `[ { EventObject } ]`                             |
| `POST`   | `/`               | Create a new event                 | Private   | `{ "title": "...", "startTime": "ISO String", "endTime": "ISO String", "status": "BUSY"|"SWAPPABLE" (optional, default: 'BUSY') }`             | `EventObject`                                           |
| `PUT`    | `/:id`            | Update an event by ID              | Private   | `{ "title": "...", "startTime": "...", "endTime": "...", "status": "..." }` (any field can be updated)                | `Updated EventObject`                                           |
| `DELETE` | `/:id`            | Delete an event by ID              | Private   | None                                                                              | `{ "msg": "Event removed" }`                        |

**Event Status Enum:** `BUSY`, `SWAPPABLE`, `SWAP_PENDING`

### Swaps (`/api/swaps`)

| Method | Endpoint              | Description                                   | Access  | Request Body                                                               | Response                                                                  |
| :----- | :-------------------- | :-------------------------------------------- | :------ | :------------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| `GET`  | `/swappable-slots`    | Get all swappable slots from other users      | Private | None                                                                       | `[ { EventObject with populated user info } ]`                                      |
| `POST` | `/request`            | Create a new swap request                     | Private | `{ "mySlotId": "ID of your slot", "theirSlotId": "ID of opponent's slot" }`                                                | `{ "msg": "...", "swapRequest": SwapRequestObject }`                                       |
| `POST` | `/response/:requestId` | Respond to an incoming swap request           | Private | `{ "accept": true|false }`                                                      | `{ "msg": "...", "swapRequest": Updated SwapRequestObject }`                                       |
| `GET`  | `/incoming`           | Get all incoming swap requests for logged-in user | Private | None                                                                       | `[ { SwapRequestObject with populated user/slot info } ]`                           |
| `GET`  | `/outgoing`           | Get all outgoing swap requests from logged-in user | Private | None                                                                       | `[ { SwapRequestObject with populated user/slot info } ]`                           |

**SwapRequest Status Enum:** `PENDING`, `ACCEPTED`, `REJECTED`

## 7. Assumptions and Challenges

### Assumptions

*   **Time Zones:** For simplicity, the application primarily handles `Date` objects and `ISO Strings` from `date-fns`. It assumes consistent time zone handling (mostly UTC on the backend) for all users. A production application would require explicit time zone selection and conversion for user-friendly display.
*   **Single-Event Swaps:** The current implementation supports swapping one event for another. More complex scenarios (e.g., multi-event swaps, partial swaps) are beyond the current scope.
*   **No Overlapping Event Validation:** The application does not currently prevent users from creating events that overlap with their existing events. This could be a future enhancement.

### Challenges Faced

*   **Atomic Swap Logic:** Implementing the core swap mechanism (`createSwapRequest` and `respondToSwapRequest`) was the most challenging aspect. Ensuring that the database updates were atomic and consistent, especially when multiple fields in different documents (event owners, event statuses, swap request status) needed to change together, required careful use of **MongoDB Transactions**. Handling edge cases where slots might become unavailable during a pending swap also required meticulous validation and rollback logic.
*   **Frontend State Management:** Keeping the frontend UI synchronized with backend changes after complex operations (like a swap acceptance changing event owners) required re-fetching data in multiple components. While efficient for this scale, for larger applications, a more centralized global state management or real-time updates via WebSockets would be beneficial.
*   **User Feedback for Async Operations:** Providing clear loading states and informative success/error messages for API calls was crucial for a good user experience, especially during the multi-step swap request process.
*   **Date/Time Handling:** Working with `Date` objects, ISO strings, and integrating Material UI's `DateTimePicker` while ensuring correct `date-fns` parsing and formatting was a minor but recurring challenge to get right across the stack.

## 8. Bonus Features (Considerations)

If I had more time, I would consider implementing the following to further enhance the application:

*   **Unit and Integration Tests:** Comprehensive tests for both backend API endpoints (especially swap logic) and critical frontend components.
*   **Real-time Notifications:** Integrate WebSockets (e.g., Socket.IO) to push instant notifications to users when they receive a swap request or when one of their pending requests is accepted/rejected.
*   **Deployment:** Deploy the application to a cloud provider (e.g., Frontend on Vercel/Netlify, Backend on Render/Heroku) for a live demo.
*   **Containerization:** Provide Dockerfiles and a `docker-compose.yml` for easy local development and consistent deployment environments.
*   **Enhanced Calendar UI:** Integrate a more advanced calendar component (e.g., React Big Calendar) to provide a richer visual experience for event management.

## 9. Live Demo (Optional)

*(If you deploy your app, add links here)*
*   **Frontend:** [Link to your deployed frontend (e.g., Vercel/Netlify URL)]
*   **Backend API:** [Link to your deployed backend API (e.g., Render/Heroku URL)]

## 10. GitHub Repository

[Link to this GitHub Repository]

---
