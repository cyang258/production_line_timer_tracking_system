# Production Line Timer Tracking System

## Project Description

The Timer Tracking System is a full-stack web application designed to manage and monitor production build processes efficiently. Users can log in using a unique Build Number and Login ID to track time per part, manage build data, and ensure accurate production metrics.

The system features:
- A **React (MUI)** frontend with a user-friendly interface.
- A **Node.js / Express** backend serving RESTful APIs.
- **MongoDB** as the primary database for build and session records.
- Custom validation ensuring only valid build numbers and login IDs can access tracking functionality.

## Setup Instructions

### Prerequisites
- Node.js (I am using version v22.18.0)
- MongoDB (Local or Cloud - e.g., MongoDB Atlas, I am using local version with Compass)
- npm (should be installed when you install Node)

### Clone the Repository And Install Dependency
```bash
git clone https://github.com/cyang258/production_line_timer_tracking_system.git
cd production_line_timer_tracking_system

Now you need to install Dependency, open another terminal, so you have one for client and one for server

in client:

```bash
cd client
npm install

in server:

```bash
cd server
npm install

### Environment File

If you already have MongoDB installed, create a new database and add your MongoDB connection string to the `.env` file.

Example `.env` file:

```env
MONGO_URL=mongodb://localhost:27017/your-database-name
PORT=8000

### Seeding Database

To seed initial build data into the database you have setup the MongoDB and env file first.
After setup env go to main folder and do following:

```bash
cd server
npm run seed

case consideration:
    1. if user clear the cache on browser, and re-entry, we still want to fetch the stored session data
    2. store only sessionId in localstorage, refetch when do refresh
        i. speed issue: since session is small, so it is not a issue

countdown library for counting animation

material UI as frontend UI library


-- seeding database
cd server
node seed/seed.js


why in page one has back, because some of build might be limited to role specific, if user want to change to another build, they might requre to change login ID as well