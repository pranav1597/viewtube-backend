ViewTube Backend
This repository contains the backend code for ViewTube, a video-sharing platform. The backend is built using Node.js, Express, and MongoDB. It provides RESTful APIs for video upload, video likes, user subscriptions, and more, designed to support a frontend application for video streaming and social engagement.

Table of Contents
Getting Started
Project Structure
Environment Variables
Features
API Endpoints
Technologies Used
Contributing
License
Getting Started
Prerequisites
Node.js v16 or above
MongoDB (local or cloud instance)
Postman (for API testing)
Cloudinary account (for media storage)
Installation
Clone the Repository

bash
Copy code
git clone https://github.com/pranav1597/viewtube-backend.git
cd viewtube-backend
Install Dependencies

bash
Copy code
npm install
Set Up Environment Variables

Create a .env file in the root directory with the following variables:

plaintext
Copy code
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
Run the Server

bash
Copy code
npm start
The server should now be running on http://localhost:5000.

Running in Development Mode
To run the server in development mode with automatic reloading, use:

bash
Copy code
npm run dev
Project Structure
bash
Copy code
viewtube-backend/
├── controllers/         # Contains controller functions for handling requests
├── models/              # Contains Mongoose models
├── routes/              # Contains route definitions
├── middlewares/         # Middleware functions (e.g., error handling, authentication)
├── utils/               # Utility functions
├── config/              # Configuration files (e.g., database connection)
└── app.js               # Express application setup
Environment Variables
Variable	Description
PORT	Port on which the server runs
MONGODB_URI	MongoDB connection URI
JWT_SECRET	Secret for signing JWT tokens
CLOUDINARY_CLOUD_NAME	Cloudinary cloud name
CLOUDINARY_API_KEY	Cloudinary API key
CLOUDINARY_API_SECRET	Cloudinary API secret
Features
User Authentication: Users can register, log in, and manage their sessions.
Video Uploading: Upload and store videos via Cloudinary.
Video Liking: Toggle likes for videos.
Subscriptions: Follow and unfollow channels.
Video Search & Filtering: Search videos by title and filter by popularity or upload date.
API Endpoints
Authentication
POST /api/auth/register - Register a new user
POST /api/auth/login - Log in an existing user
POST /api/auth/logout - Log out the current user
Videos
POST /api/videos - Upload a new video (requires authentication)
GET /api/videos - Get a list of videos, with optional pagination, search, and sorting
DELETE /api/videos/
- Delete a video by ID (requires authentication)
Likes
POST /api/videos/
/like - Toggle like for a video (requires authentication)
GET /api/users/liked-videos - Get the list of videos liked by the authenticated user
Subscriptions
POST /api/users/
/subscribe - Toggle subscription to a channel (requires authentication)
GET /api/users/subscriptions - Get channels the user is subscribed to
Example API Usage
Here’s a sample request to upload a video:

http
Copy code
POST /api/videos
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
  - title: "Sample Video"
  - description: "This is a sample description"
  - videoFile: <file>
Sample Response
json
Copy code
{
  "status": 200,
  "message": "Video uploaded successfully",
  "data": {
    "title": "Sample Video",
    "description": "This is a sample description",
    "url": "https://res.cloudinary.com/<cloud_name>/video/upload/sample.mp4",
    "createdAt": "2024-11-07T12:00:00Z"
  }
}
Technologies Used
Node.js & Express: Server and API handling
MongoDB & Mongoose: Database and data modeling
JWT: Authentication
Cloudinary: Video file storage
Multer: Handling file uploads
dotenv: Environment variable management
