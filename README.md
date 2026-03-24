# Quotation Docker Project 🚀

A comprehensive solution for generating and managing quotations, featuring a modern **Next.js** frontend and a powerful **Appwrite** backend, all orchestrated using **Docker**.

## 🏗 Project Structure

- **`frontend/`**: The client-side application built with Next.js, React, and Tailwind CSS.
- **`appwrite/`**: Backend infrastructure using Appwrite for database, authentication, and file storage.

## 🚀 Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Node.js](https://nodejs.org/) (for local development)
- [Appwrite CLI](https://appwrite.io/docs/command-line) (optional, for backend management)

### 🛠 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/aditya-2129/quotation-docker.git
   cd quotation-docker
   ```

2. **Configure Environment Variables:**
   - There are `.env` files within both the `frontend/` and `appwrite/` directories that need to be configured correctly before running the services.

3. **Start the Backend (Appwrite):**
   ```bash
   cd appwrite
   docker-compose up -d
   ```
   *Note: Ensure your Docker engine is running.*

4. **Start the Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 🛠 Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Appwrite (Dockerized)
- **Deployment:** Docker, Docker Compose

## 📄 License

This project is for internal use.
