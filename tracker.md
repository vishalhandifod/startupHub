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

- [ ] In progress: write Phase 3 profile module spec and implementation plan
- [ ] TODO: create profile update endpoints
- [ ] TODO: support bio and profile photo updates
- [ ] TODO: add public profile view
- [ ] TODO: add follower/following relationships

## Phase 4 - Discovery and Social Features

- [ ] TODO: search users and startups
- [ ] TODO: suggested connections
- [ ] TODO: notifications baseline
- [ ] TODO: activity feed improvements
