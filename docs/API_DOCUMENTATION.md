# WedVow Backend API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Wedding Management](#wedding-management)
4. [Guest Management](#guest-management)
5. [Vendor Management](#vendor-management)
6. [Booking Management](#booking-management)
7. [Budget Management](#budget-management)
8. [Task Management](#task-management)
9. [Event Management](#event-management)
10. [Reminder Management](#reminder-management)
11. [Public Wedding Routes](#public-wedding-routes)
12. [Database Models](#database-models)

---

## Overview

**Base URL**: `http://localhost:3000/api`

**Tech Stack**:
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Nodemailer (Email Service)

**Environment Variables**:
```
MONGO_URI=<MongoDB Connection String>
JWT_SECRET=<JWT Secret Key>
PORT=3000
FRONTEND_URL=http://localhost:5173
EMAIL_USER=<Gmail Address>
EMAIL_PASSWORD=<Gmail App Password>
```

---

## Authentication

**Base Route**: `/api/auth`

### Endpoints

#### 1. Register User
- **POST** `/api/auth/register`
- **Access**: Public
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "couple" // or "vendor"
  }
  ```
- **Response**: Returns JWT token and user data

#### 2. Login User
- **POST** `/api/auth/login`
- **Access**: Public
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: Returns JWT token and user data

#### 3. Get User Profile
- **GET** `/api/auth/profile`
- **Access**: Private (Requires JWT token)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Returns logged-in user's profile

---

## Wedding Management

**Base Route**: `/api/weddings`

**All routes require authentication**

### Endpoints

#### 1. Create Wedding
- **POST** `/api/weddings`
- **Access**: Private (Couple only)
- **Body**:
  ```json
  {
    "brideName": "Jane Smith",
    "groomName": "John Doe",
    "weddingDate": "2025-06-15",
    "venue": "Grand Hotel",
    "venueAddress": "123 Main St",
    "venueLatitude": 40.7128,
    "venueLongitude": -74.0060,
    "city": "New York",
    "totalBudget": 50000,
    "theme": "Modern Elegance",
    "notes": "Optional notes"
  }
  ```
- **Response**: Returns created wedding object with auto-generated hashtag

#### 2. Get All My Weddings
- **GET** `/api/weddings/all`
- **Access**: Private
- **Response**: Returns array of all weddings for logged-in user

#### 3. Get My Wedding (First/Most Recent)
- **GET** `/api/weddings/my-wedding`
- **Access**: Private
- **Response**: Returns first wedding (backward compatibility)

#### 4. Get Wedding by ID
- **GET** `/api/weddings/:id`
- **Access**: Private
- **Response**: Returns specific wedding details

#### 5. Update Wedding
- **PUT** `/api/weddings/:id`
- **Access**: Private (Couple only)
- **Body**: Same as create wedding (partial updates allowed)
- **Response**: Returns updated wedding

#### 6. Delete Wedding
- **DELETE** `/api/weddings/:id`
- **Access**: Private (Couple only)
- **Response**: Success message

---

## Guest Management

**Base Route**: `/api/guests`

### Endpoints

#### 1. Add Guest
- **POST** `/api/guests`
- **Access**: Private (Couple only)
- **Body**:
  ```json
  {
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "+1234567890",
    "category": "family", // family, friends, colleagues, relatives
    "plusOneAllowed": true,
    "weddingId": "wedding_id_here"
  }
  ```
- **Response**: Returns created guest with unique RSVP token

#### 2. Get My Guests
- **GET** `/api/guests`
- **Access**: Private (Couple only)
- **Query**: `?weddingId=xxx`
- **Response**: Returns all guests with stats (total, confirmed, pending, declined)

#### 3. Update Guest
- **PUT** `/api/guests/:id`
- **Access**: Private (Couple only)
- **Body**: Same as add guest (partial updates allowed)
- **Response**: Returns updated guest

#### 4. Delete Guest
- **DELETE** `/api/guests/:id`
- **Access**: Private (Couple only)
- **Response**: Success message

#### 5. Send Invitations
- **POST** `/api/guests/send-invitations`
- **Access**: Private (Couple only)
- **Body**: None (uses weddingId from auth)
- **Response**: Sends RSVP emails to all guests with email addresses

#### 6. Get Guest by RSVP Token (Public)
- **GET** `/api/guests/rsvp/:token`
- **Access**: Public
- **Response**: Returns guest and wedding details for RSVP form

#### 7. Submit RSVP (Public)
- **POST** `/api/guests/rsvp/:token`
- **Access**: Public
- **Body**:
  ```json
  {
    "rsvpStatus": "confirmed", // confirmed, declined, maybe
    "attendeesCount": 2,
    "dietaryRestrictions": "Vegetarian",
    "specialRequests": "Optional notes"
  }
  ```
- **Response**: Sends confirmation email to guest

---

## Vendor Management

**Base Route**: `/api/vendors`

### Endpoints

#### 1. Get All Vendors (Public)
- **GET** `/api/vendors`
- **Access**: Public
- **Query**: 
  - `?category=photographer`
  - `?city=New York`
  - `?search=keyword`
- **Response**: Returns array of vendors

#### 2. Create Vendor Profile
- **POST** `/api/vendors`
- **Access**: Private (Vendor role only)
- **Body**:
  ```json
  {
    "businessName": "Dream Photography",
    "category": "photographer", // venue, caterer, photographer, decorator, makeup, dj, transportation, other
    "description": "Professional wedding photography",
    "services": ["Wedding shoots", "Pre-wedding", "Albums"],
    "location": "123 Studio St",
    "city": "New York",
    "priceRange": {
      "min": 5000,
      "max": 15000
    },
    "portfolio": ["image_url1", "image_url2"]
  }
  ```
- **Response**: Returns created vendor profile

#### 3. Get My Vendor Profile
- **GET** `/api/vendors/my/profile`
- **Access**: Private (Vendor only)
- **Response**: Returns logged-in vendor's profile

#### 4. Get Vendor by ID
- **GET** `/api/vendors/:id`
- **Access**: Public
- **Response**: Returns specific vendor details with reviews

#### 5. Update Vendor Profile
- **PUT** `/api/vendors/:id`
- **Access**: Private (Vendor only)
- **Body**: Same as create (partial updates allowed)
- **Response**: Returns updated vendor

#### 6. Delete Vendor Profile
- **DELETE** `/api/vendors/:id`
- **Access**: Private (Vendor only)
- **Response**: Success message

#### 7. Add Review
- **POST** `/api/vendors/:id/review`
- **Access**: Private
- **Body**:
  ```json
  {
    "rating": 5,
    "comment": "Excellent service!"
  }
  ```
- **Response**: Updates vendor with new review

---

## Booking Management

**Base Route**: `/api/bookings`

**All routes require authentication**

### Endpoints

#### 1. Create Booking
- **POST** `/api/bookings`
- **Access**: Private (Couple only)
- **Body**:
  ```json
  {
    "vendor": "vendor_id",
    "weddingId": "wedding_id",
    "serviceType": "Photography",
    "eventDate": "2025-06-15",
    "cost": 10000,
    "advancePaid": 3000,
    "notes": "Optional notes"
  }
  ```
- **Response**: Returns created booking

#### 2. Sync Bookings to Budget
- **POST** `/api/bookings/sync-budget`
- **Access**: Private (Couple only)
- **Response**: Creates budget items from confirmed bookings

#### 3. Get My Bookings
- **GET** `/api/bookings/my-bookings`
- **Access**: Private (Couple only)
- **Response**: Returns all bookings for couple

#### 4. Get Vendor Bookings
- **GET** `/api/bookings/vendor-bookings`
- **Access**: Private (Vendor only)
- **Response**: Returns all bookings for vendor

#### 5. Get Booking by ID
- **GET** `/api/bookings/:id`
- **Access**: Private
- **Response**: Returns specific booking details

#### 6. Update Booking
- **PUT** `/api/bookings/:id`
- **Access**: Private
- **Body**: Same as create (partial updates allowed)
- **Response**: Returns updated booking

#### 7. Update Booking Status
- **PUT** `/api/bookings/:id/status`
- **Access**: Private (Vendor only)
- **Body**:
  ```json
  {
    "status": "confirmed" // pending, confirmed, cancelled, completed
  }
  ```
- **Response**: Returns updated booking

#### 8. Update Payment
- **PUT** `/api/bookings/:id/payment`
- **Access**: Private
- **Body**:
  ```json
  {
    "advancePaid": 5000
  }
  ```
- **Response**: Returns updated booking

#### 9. Delete Booking
- **DELETE** `/api/bookings/:id`
- **Access**: Private
- **Response**: Success message

---

## Budget Management

**Base Route**: `/api/budgets`

**All routes require authentication**

### Endpoints

#### 1. Add Budget Item
- **POST** `/api/budgets`
- **Access**: Private (Couple only)
- **Body**:
  ```json
  {
    "category": "venue", // venue, catering, photography, etc.
    "estimatedCost": 20000,
    "actualCost": 18000,
    "notes": "Optional notes",
    "weddingId": "wedding_id"
  }
  ```
- **Response**: Returns created budget item

#### 2. Get My Budgets
- **GET** `/api/budgets`
- **Access**: Private (Couple only)
- **Query**: `?weddingId=xxx`
- **Response**: Returns budgets with summary (totalEstimated, totalActual)

#### 3. Get Budget Alerts
- **GET** `/api/budgets/alerts`
- **Access**: Private (Couple only)
- **Response**: Returns categories over budget

#### 4. Get Budget by ID
- **GET** `/api/budgets/:id`
- **Access**: Private
- **Response**: Returns specific budget item

#### 5. Update Budget
- **PUT** `/api/budgets/:id`
- **Access**: Private (Couple only)
- **Body**: Same as create (partial updates allowed)
- **Response**: Returns updated budget

#### 6. Delete Budget
- **DELETE** `/api/budgets/:id`
- **Access**: Private (Couple only)
- **Response**: Success message

---

## Task Management

**Base Route**: `/api/tasks`

**All routes require authentication**

### Endpoints

#### 1. Add Task
- **POST** `/api/tasks`
- **Access**: Private (Couple only)
- **Body**:
  ```json
  {
    "title": "Book photographer",
    "description": "Find and book a photographer",
    "dueDate": "2025-03-01",
    "priority": "high", // low, medium, high
    "completed": false,
    "weddingId": "wedding_id"
  }
  ```
- **Response**: Returns created task

#### 2. Get My Tasks
- **GET** `/api/tasks`
- **Access**: Private (Couple only)
- **Query**: `?weddingId=xxx&completed=false`
- **Response**: Returns tasks with stats

#### 3. Update Task
- **PUT** `/api/tasks/:id`
- **Access**: Private (Couple only)
- **Body**: Same as create (partial updates allowed)
- **Response**: Returns updated task

#### 4. Delete Task
- **DELETE** `/api/tasks/:id`
- **Access**: Private (Couple only)
- **Response**: Success message

---

## Event Management

**Base Route**: `/api/events`

### Endpoints

#### 1. Add Event
- **POST** `/api/events`
- **Access**: Private (Couple only)
- **Body**:
  ```json
  {
    "name": "Mehndi Ceremony",
    "date": "2025-06-13",
    "time": "18:00",
    "venue": "Home",
    "description": "Pre-wedding mehndi ceremony",
    "weddingId": "wedding_id"
  }
  ```
- **Response**: Returns created event

#### 2. Get My Events
- **GET** `/api/events`
- **Access**: Private (Couple only)
- **Query**: `?weddingId=xxx`
- **Response**: Returns all events for wedding

#### 3. Get Events by Wedding ID (Public)
- **GET** `/api/events/wedding/:weddingId`
- **Access**: Public
- **Response**: Returns all events for a wedding (for public viewing)

#### 4. Get Event by ID
- **GET** `/api/events/:id`
- **Access**: Private
- **Response**: Returns specific event details

#### 5. Update Event
- **PUT** `/api/events/:id`
- **Access**: Private (Couple only)
- **Body**: Same as create (partial updates allowed)
- **Response**: Returns updated event

#### 6. Delete Event
- **DELETE** `/api/events/:id`
- **Access**: Private (Couple only)
- **Response**: Success message

---

## Reminder Management

**Base Route**: `/api/reminders`

**All routes require authentication**

### Endpoints

#### 1. Get Reminders
- **GET** `/api/reminders`
- **Access**: Private
- **Response**: Returns pending RSVP guests as reminders

#### 2. Create Reminder
- **POST** `/api/reminders`
- **Access**: Private
- **Body**:
  ```json
  {
    "title": "Send invites",
    "description": "Send wedding invitations",
    "reminderDate": "2025-02-01",
    "reminderType": "task", // task, payment, booking
    "weddingId": "wedding_id"
  }
  ```
- **Response**: Returns created reminder

#### 3. Get RSVP Reminders
- **GET** `/api/reminders/rsvp`
- **Access**: Private
- **Response**: Returns guests who haven't RSVP'd

#### 4. Send Day Before Reminders
- **POST** `/api/reminders/day-before`
- **Access**: Private
- **Response**: Sends reminder emails to guests

#### 5. Update Reminder
- **PUT** `/api/reminders/:id`
- **Access**: Private
- **Body**: Same as create (partial updates allowed)
- **Response**: Returns updated reminder

#### 6. Delete Reminder
- **DELETE** `/api/reminders/:id`
- **Access**: Private
- **Response**: Success message

---

## Public Wedding Routes

**Base Route**: `/api/public-wedding`

### Endpoints

#### 1. Get Public Wedding
- **GET** `/api/public-wedding/:id`
- **Access**: Public
- **Response**: Returns wedding details, events, and couple info for public viewing

---

## Database Models

### 1. User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['couple', 'vendor']),
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Wedding Model
```javascript
{
  couple: ObjectId (ref: User),
  brideName: String (required),
  groomName: String (required),
  weddingDate: Date (required),
  venue: String (required),
  venueAddress: String,
  venueLatitude: Number,
  venueLongitude: Number,
  city: String (required),
  totalBudget: Number,
  theme: String,
  hashtag: String (auto-generated),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Guest Model
```javascript
{
  wedding: ObjectId (ref: Wedding),
  name: String (required),
  email: String,
  phone: String,
  category: String (enum: ['family', 'friends', 'colleagues', 'relatives']),
  rsvpStatus: String (enum: ['pending', 'confirmed', 'declined', 'maybe']),
  rsvpToken: String (unique),
  attendeesCount: Number,
  plusOneAllowed: Boolean,
  dietaryRestrictions: String,
  specialRequests: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Vendor Model
```javascript
{
  user: ObjectId (ref: User),
  businessName: String (required),
  category: String (enum: ['venue', 'caterer', 'photographer', 'decorator', 'makeup', 'dj', 'transportation', 'other']),
  description: String,
  services: [String],
  location: String,
  city: String,
  priceRange: {
    min: Number,
    max: Number
  },
  portfolio: [String],
  reviews: [{
    user: ObjectId,
    rating: Number (1-5),
    comment: String,
    createdAt: Date
  }],
  ratingAverage: Number,
  totalReviews: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Booking Model
```javascript
{
  couple: ObjectId (ref: User),
  vendor: ObjectId (ref: Vendor),
  wedding: ObjectId (ref: Wedding),
  serviceType: String,
  coupleName: String,
  eventDate: Date,
  cost: Number,
  advancePaid: Number,
  balanceAmount: Number (calculated),
  status: String (enum: ['pending', 'confirmed', 'cancelled', 'completed']),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Budget Model
```javascript
{
  wedding: ObjectId (ref: Wedding),
  category: String (required),
  estimatedCost: Number,
  actualCost: Number,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Task Model
```javascript
{
  wedding: ObjectId (ref: Wedding),
  title: String (required),
  description: String,
  dueDate: Date,
  priority: String (enum: ['low', 'medium', 'high']),
  completed: Boolean,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 8. Event Model
```javascript
{
  wedding: ObjectId (ref: Wedding),
  name: String (required),
  date: Date (required),
  time: String,
  venue: String,
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 9. Reminder Model
```javascript
{
  wedding: ObjectId (ref: Wedding),
  title: String,
  description: String,
  reminderDate: Date,
  reminderType: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Middleware

### 1. Authentication Middleware (`auth.js`)
- Verifies JWT token from Authorization header
- Attaches user data to `req.user`
- Required for protected routes

### 2. Role-Based Authorization
- Checks user role (couple/vendor)
- Restricts certain endpoints to specific roles

---

## Utilities

### 1. Email Templates (`emailTemplates.js`)
- RSVP confirmation emails
- RSVP declined acknowledgment
- Invitation emails with RSVP links
- Day-before reminder emails

### 2. Wedding Helpers (`weddingHelpers.js`)
- `getUserWedding()`: Gets first wedding for user
- Helper functions for wedding-related operations

---

## Error Handling

**Standard Error Response Format**:
```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes**:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Features Implemented

### Multi-Wedding Support
- Users can create multiple weddings
- Each wedding has a unique ID
- All related data (guests, tasks, etc.) is linked to wedding ID
- Wedding selection persisted in frontend localStorage

### Email Integration
- RSVP invitation emails
- RSVP confirmation emails
- Different handling for confirmed/declined guests
- Wedding location included in emails

### Budget Syncing
- Automatically sync confirmed bookings to budget
- Track estimated vs actual costs
- Budget alerts for overspending

### RSVP System
- Unique token per guest
- Public RSVP form (no login required)
- Email confirmation after RSVP
- Track attendee count and dietary restrictions

### Vendor Platform
- Public vendor directory
- Vendor profiles with reviews
- Booking management for vendors
- Rating system

---

## Development Notes

### Port Configuration
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173` (Vite)

### CORS Configuration
Currently allows all origins (`*`) - **Change for production!**

### Email Configuration
Uses Gmail SMTP with app-specific password. Ensure "Less secure app access" is enabled or use OAuth2.

---

## Future Enhancements
- File upload for vendor portfolios
- Payment gateway integration
- SMS notifications
- Calendar integration
- Wedding website customization
- Guest list import/export
- Vendor availability calendar

---

**Last Updated**: December 16, 2025
**Version**: 1.0.0
