# Projects and Project Memberships

**Author:** James Corino

## Description

Projects and Project Memberships is a full-stack web application that extends the Login and Signup application from Programming Assignment 2. Users can sign up and log in, create software projects with a Project Lead chosen from the registered users, view all projects, and manage which users are members of each project. The frontend is built with React, and the backend is built with Node.js and Express, with data stored in MongoDB. The React interface sends requests to the Express server, which validates the data, reads from or writes to the database, and sends back a message that is displayed to the user.

## Features

* Sign up with a first name, last name, username, and password (duplicate usernames and empty fields are rejected)
* Log in with a username and password (empty fields, unknown usernames, and incorrect passwords are rejected)
* Create a project with a name, description, status (Planning, Active, or Completed), and a Project Lead selected from the registered users
* The Project Lead is automatically added as a member of the new project
* View all projects with their name, description, status, and Project Lead's username
* Select a project to view its members, add a registered user, or remove a non-lead member
* A user cannot be added to the same project twice, and the Project Lead cannot be removed
* Display a success or failure message after each action, including when the server cannot be reached or a database error occurs

## Data Model

The application uses three MongoDB collections in the `pa2` database:

* `users`: `_id`, `f_name`, `l_name`, `username`, `password`
* `projects`: `_id`, `name`, `description`, `status`, `project_lead_id`
* `projectMemberships`: `_id`, `project_id`, `user_id`

`project_lead_id`, `project_id`, and `user_id` are stored as MongoDB ObjectId references. Each membership document links one user to one project, so a user can belong to many projects and a project can have many users.

## API Routes

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/signup` | Create a user |
| POST | `/login` | Log in |
| GET | `/api/users` | Get registered users |
| POST | `/api/projects` | Create a project |
| GET | `/api/projects` | Get all projects |
| GET | `/api/projects/:projectId/members` | Get members of a project |
| POST | `/api/projects/:projectId/members` | Add a member to a project |
| DELETE | `/api/projects/:projectId/members/:userId` | Remove a non-lead member |

## Technologies

* React (Vite)
* Node.js
* Express
* MongoDB

## How to Run

1. Clone the repository:

```
git clone https://github.com/Jamescorino8/ICSI418Y-PA3.git
```

2. Install the server dependencies:

```
cd ICSI418Y-PA3/server
npm install
```

3. Create a file named `.env` inside the `server` folder with your MongoDB connection string:

```
MONGO_URI=your_mongodb_connection_string
```

4. Start the server (it runs on port 9000):

```
node server.js
```

5. In a second terminal, install the client dependencies and start the React app:

```
cd ICSI418Y-PA3/client
npm install
npm run dev
```

6. Open the local address shown in the terminal (usually `http://localhost:5173`) in a web browser.

## Known Issues

* None at this time.
