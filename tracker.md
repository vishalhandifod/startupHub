# StartupHub Progress Tracker

## Phase 1 - Auth and JWT

- [x] DONE: rename base package to `com.startuphub`
- [x] DONE: align Maven project with Spring Boot 3.x and required dependencies
- [x] DONE: configure MySQL datasource and JWT properties
- [x] DONE: create `User` entity and `Role` enum
- [x] DONE: create auth DTOs
- [x] DONE: create `UserRepository`
- [x] DONE: implement JWT token provider
- [x] DONE: implement JWT authentication filter
- [x] DONE: implement `CustomUserDetailsService`
- [x] DONE: implement `AuthService`
- [x] DONE: implement `AuthController`
- [x] DONE: implement security configuration
- [x] DONE: implement global exception handling
- [x] DONE: add Phase 1 automated tests
- [x] DONE: verify live MySQL-backed register, login, and `/me` flow with curl

## Phase 2 - Post Module

- [x] DONE: write Phase 2 post module spec and implementation plan
- [x] DONE: create post entity and repository
- [x] DONE: create post DTOs
- [x] DONE: create post service and controller
- [x] DONE: create create/read feed endpoints
- [x] DONE: create like and unlike endpoints
- [x] DONE: create comment support
- [x] DONE: enforce post ownership and auth rules
- [x] DONE: verify live MySQL-backed post, feed, like, and comment flow with curl

## Phase 3 - Profile Module

- [x] DONE: write Phase 3 profile module spec and implementation plan
- [x] DONE: create profile update endpoints
- [x] DONE: support bio and profile photo updates
- [x] DONE: add public profile view
- [x] DONE: add follower/following relationships
- [x] DONE: verify live MySQL-backed profile update and follow graph flow with curl

## Phase 4 - Discovery and Social Features

- [x] DONE: write Phase 4 discovery module spec and implementation plan
- [x] DONE: search users by name and email
- [x] DONE: suggested connections
- [x] DONE: notifications baseline
- [x] DONE: personalized discovery feed improvements
- [x] DONE: verify automated discovery, notification, and controller coverage

## Phase 5 - Next TODO

- [x] DONE: startup/company pages separate from user profiles
- [ ] TODO: direct messaging or inbox
- [ ] TODO: post media upload handling
- [ ] TODO: frontend UI with Bootstrap 5

## Phase 6 - Frontend Web App

- [x] DONE: multi-page frontend UI with Bootstrap 5
- [x] DONE: HttpOnly cookie-based browser auth
- [x] DONE: media upload support for posts, profiles, and startups
- [x] DONE: responsive feed, discovery, profile, startup, and notification pages

## Remaining Major TODO

- [x] DONE: direct messaging or inbox

## Phase 8 - React SPA Frontend

- [x] DONE: bootstrap `frontend/` with React 18, Vite, React Router v6, Axios, Lucide, and Tailwind CSS
- [x] DONE: configure global theme tokens, dark mode, typography, and responsive layout system
- [x] DONE: build `AuthContext`, `NotificationContext`, toast system, and protected routing
- [x] DONE: build Login page
- [x] DONE: build Register page
- [x] DONE: build Feed page
- [x] DONE: build Discover page
- [x] DONE: build Profile page
- [x] DONE: build Startups page
- [x] DONE: build Startup detail page
- [x] DONE: build Messages page
- [x] DONE: build Notifications page
- [x] DONE: build Create Post modal, skeleton loaders, and mobile navigation
- [x] DONE: verify production frontend build with `npm run build`
- [x] DONE: remove remaining placeholder data and replace with real API states plus empty-state UI
- [x] DONE: fix page alignment, typography, loading states, and avatar fallback behavior
- [x] DONE: add WebSocket-backed real-time messaging and notification subscriptions
