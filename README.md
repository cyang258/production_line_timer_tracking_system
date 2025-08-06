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
when interaction popup shows up, it should be consider as pause
    -- because the time before you click Yes button, it is inactive time, unpause time is active time
    -- if you click No, it is a pause, and should have pause button there in case you want to start work
    -- if you do not click anything or click yes, the time gap between popup and yes/auto-submit is a pause, once submit, it will update resumeAt

when user go to final submission page, the countdown will not pause
    -- The timer represents real-world production time.
    -- Even if the user is on Page 3 reviewing or submitting data, the production process (in real life) hasn’t paused.

use cases
1. [X] when pause button clicked -> session was updated for pause
2. [X] when resume button clicked -> session was updated for resume
3. time is enough
    i) user click pause button
    ii) user enters defects entry
    iii) user click next button
    iv) redirect to final submission page -- unless user submit result or it should be considered as a pause
        a) user return to count page -> redirect to countdown page   
        b) user submit result -> redirect to login page
4. time is not enough
    i) user click pause button
    ii) user enters defects entry
    iii) popup shows
        a) user click yes or no -> dismiss popup and show again in 10 mins
        b) user ignore -> auto submit and redirect to login page