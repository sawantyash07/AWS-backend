# VCS Backend API

This is the core API for the Custom Version Control System (VCS). It handles repository management, user authentication, commit tracking, issue management, and real-time updates via Socket.io.

## 🚀 Features

- **Repository Management**: CRUD operations for repositories and their metadata.
- **Authentication**: Secure user login and signup with JWT.
- **Commit History**: Tracks file changes and commit metadata in MongoDB.
- **Issue Tracking**: Basic issue/ticket management system.
- **AWS S3 Integration**: Handles file storage for repository snapshots.
- **Real-time Updates**: Socket.io integration for collaborative features.

## 🛠️ Tech Stack

- **Node.js & Express**: Server-side framework.
- **MongoDB & Mongoose**: NoSQL database for flexible data modeling.
- **Socket.io**: Real-time bidirectional event-based communication.
- **AWS SDK**: For cloud storage integration.
- **JWT**: For stateless authentication.

## ⚙️ Setup Instructions

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/sawantyash07/AWS-backend.git
    cd AWS-backend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root directory based on `.env.example`:
    ```bash
    cp .env.example .env
    ```
    Fill in your `MONGO_URI`, AWS credentials, and other settings.

4.  **Start the server**:
    ```bash
    npm start
    ```
    The API will be available at `http://3.109.60.242:5000`.

## 📌 API Endpoints

- `POST /api/auth/signup` - Register a new user.
- `POST /api/auth/login` - Authenticate and get a token.
- `GET /api/repo` - List all repositories.
- `POST /api/repo/init` - Initialize a new repository.
- `GET /api/issue` - List all issues.

## 🌐 Related Repositories

- [VCS Frontend Dashboard](https://github.com/sawantyash07/AWS-frontend)
- [VCS CLI](https://github.com/sawantyash07/VCS-CLI) (link placeholder)

---
Developed by Yash Sawant.
