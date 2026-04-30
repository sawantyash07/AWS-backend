# VCS API Test Exam

This document provides a set of `curl` commands and scenarios to test all the implemented features of the VCS Backend.

## 1. Authentication

### Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
-H "Content-Type: application/json" \
-d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email": "test@example.com", "password": "password123"}'
```
*Note: Copy the `token` from the response for subsequent requests.*

---

## 2. User Profile

### Fetch Profile
```bash
curl -X GET http://localhost:5000/api/user/testuser
```

### Update Profile
```bash
curl -X PUT http://localhost:5000/api/user/profile \
-H "Authorization: Bearer YOUR_TOKEN_HERE" \
-H "Content-Type: application/json" \
-d '{"username": "updateduser", "email": "updated@example.com"}'
```

### Delete Profile
```bash
curl -X DELETE http://localhost:5000/api/user/profile \
-H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 3. Repository

### Create Repository (Init)
```bash
curl -X POST http://localhost:5000/api/repo/init \
-H "Authorization: Bearer YOUR_TOKEN_HERE" \
-H "Content-Type: application/json" \
-d '{"name": "my-cool-repo", "description": "A very cool repository"}'
```

### Fetch All Repositories
```bash
curl -X GET http://localhost:5000/api/repo/all
```

### Fetch Repository Details
```bash
curl -X GET http://localhost:5000/api/repo/REPO_ID_HERE
```

### Update Repository
```bash
curl -X PUT http://localhost:5000/api/repo/REPO_ID_HERE \
-H "Authorization: Bearer YOUR_TOKEN_HERE" \
-H "Content-Type: application/json" \
-d '{"description": "Updated description", "visibility": "private"}'
```

### Star Repository
```bash
curl -X POST http://localhost:5000/api/repo/REPO_ID_HERE/star \
-H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Delete Repository
```bash
curl -X DELETE http://localhost:5000/api/repo/REPO_ID_HERE \
-H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 4. Issues

### Create Issue
```bash
curl -X POST http://localhost:5000/api/issue/create \
-H "Authorization: Bearer YOUR_TOKEN_HERE" \
-H "Content-Type: application/json" \
-d '{"title": "Bug in feature X", "description": "It doesnt work", "repoName": "my-cool-repo"}'
```

### Fetch Repo Issues
```bash
curl -X GET http://localhost:5000/api/issue/repo/my-cool-repo
```

### Fetch Issue Details
```bash
curl -X GET http://localhost:5000/api/issue/ISSUE_ID_HERE
```

### Update Issue Status
```bash
curl -X PUT http://localhost:5000/api/issue/ISSUE_ID_HERE \
-H "Authorization: Bearer YOUR_TOKEN_HERE" \
-H "Content-Type: application/json" \
-d '{"status": "closed"}'
```

### Add Comment to Issue
```bash
curl -X POST http://localhost:5000/api/issue/ISSUE_ID_HERE/comment \
-H "Authorization: Bearer YOUR_TOKEN_HERE" \
-H "Content-Type: application/json" \
-d '{"text": "I will look into this"}'
```

### Delete Issue
```bash
curl -X DELETE http://localhost:5000/api/issue/ISSUE_ID_HERE \
-H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 5. Socket.io Real-time Test
1. Use a tool like [Postman](https://www.postman.com/) or a simple Node.js script to connect to `ws://localhost:5000`.
2. Emit `joinRepo` with the `repoId`.
3. Perform a `commit` or `issue` action via API.
4. Observe the incoming events: `commit`, `issue`, or `comment`.
