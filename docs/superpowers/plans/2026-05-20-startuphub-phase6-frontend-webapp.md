# StartupHub Phase 6 Frontend Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete browser-facing StartupHub web app with attractive multi-page UI, cookie-based auth, and media uploads on top of the existing backend modules.

**Architecture:** Add a web layer with page controllers, Thymeleaf templates, static assets, and cookie-aware auth support while preserving the existing REST APIs. Introduce a local file upload module and extend authentication so JWTs can be set and read through `HttpOnly` cookies as well as bearer headers.

**Tech Stack:** Java 17, Spring Boot 3.3.5, Spring Security, Spring MVC, Spring Data JPA, Thymeleaf, Bootstrap 5, vanilla JavaScript, MySQL, H2 test profile, JUnit 5, Mockito, MockMvc

---

## File Structure

### Files to modify

- `pom.xml` - add Thymeleaf dependency if missing
- `developer.md` - record Phase 6 architecture and browser test flow
- `tracker.md` - mark the frontend phase done and leave direct messaging as TODO
- `src/main/resources/application.properties` - add upload path configuration
- `src/main/java/com/startuphub/config/SecurityConfig.java` - allow page routes and logout, keep API auth rules
- `src/main/java/com/startuphub/security/JwtAuthenticationFilter.java` - resolve JWT from cookie as well as header
- `src/main/java/com/startuphub/controller/AuthController.java` - set and clear auth cookie in login/register/logout flow
- `src/main/java/com/startuphub/service/AuthService.java` - expose logout helper if needed and keep existing API response behavior

### Files to create

- `src/main/java/com/startuphub/config/WebMvcConfig.java`
- `src/main/java/com/startuphub/config/WebProperties.java`
- `src/main/java/com/startuphub/controller/WebController.java`
- `src/main/java/com/startuphub/controller/UploadController.java`
- `src/main/java/com/startuphub/service/FileStorageService.java`
- `src/main/java/com/startuphub/dto/UploadResponse.java`
- `src/test/java/com/startuphub/controller/WebControllerTest.java`
- `src/test/java/com/startuphub/controller/UploadControllerTest.java`
- `src/test/java/com/startuphub/security/JwtAuthenticationFilterTest.java`
- `src/main/resources/templates/index.html`
- `src/main/resources/templates/feed.html`
- `src/main/resources/templates/discovery.html`
- `src/main/resources/templates/profile.html`
- `src/main/resources/templates/startups.html`
- `src/main/resources/templates/startup-detail.html`
- `src/main/resources/templates/notifications.html`
- `src/main/resources/static/css/app.css`
- `src/main/resources/static/js/auth.js`
- `src/main/resources/static/js/feed.js`
- `src/main/resources/static/js/discovery.js`
- `src/main/resources/static/js/profile.js`
- `src/main/resources/static/js/startups.js`
- `src/main/resources/static/js/notifications.js`

## Task 1: Define the web and upload contract with failing tests

**Files:**
- Create: `src/test/java/com/startuphub/controller/WebControllerTest.java`
- Create: `src/test/java/com/startuphub/controller/UploadControllerTest.java`
- Create: `src/test/java/com/startuphub/security/JwtAuthenticationFilterTest.java`

- [ ] **Step 1: Write the failing web route tests**

Add tests for:

```java
@Test
void landingPageReturnsOk() throws Exception { }

@Test
void feedPageReturnsOkForAuthenticatedUser() throws Exception { }

@Test
void notificationsPageReturnsOkForAuthenticatedUser() throws Exception { }
```

Key assertions:
- `/` returns `200` and renders the landing template
- `/app/feed` and `/app/notifications` return `200` for authenticated users
- page responses contain expected template markers or key content strings

- [ ] **Step 2: Write the failing upload controller tests**

Add tests for:

```java
@Test
void uploadProfilePhotoReturnsPublicPath() throws Exception { }

@Test
void uploadWithoutFileReturnsBadRequest() throws Exception { }
```

Key assertions:
- upload route returns JSON with stored path
- empty uploads return `400`

- [ ] **Step 3: Write the failing JWT cookie test**

Add a filter test for:

```java
@Test
void authenticatesFromJwtCookieWhenAuthorizationHeaderMissing() throws Exception { }
```

Key assertions:
- if `Authorization` header is absent but auth cookie exists, the filter authenticates the request

- [ ] **Step 4: Run tests to verify they fail**

Run: `./mvnw -q -Dtest=WebControllerTest,UploadControllerTest,JwtAuthenticationFilterTest test`
Expected: FAIL because the web controller, upload controller, and cookie-aware filter behavior do not exist yet.

## Task 2: Add template engine and web configuration

**Files:**
- Modify: `pom.xml`
- Modify: `src/main/resources/application.properties`
- Create: `src/main/java/com/startuphub/config/WebProperties.java`
- Create: `src/main/java/com/startuphub/config/WebMvcConfig.java`

- [ ] **Step 1: Add the Thymeleaf dependency**

Add:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

- [ ] **Step 2: Add upload configuration properties**

Add application properties for:
- upload root directory
- public upload URL prefix

Suggested values:

```properties
app.upload-dir=uploads
app.upload-url-prefix=/uploads
```

- [ ] **Step 3: Create web configuration classes**

Responsibilities:
- bind upload properties
- expose uploaded files through Spring resource handlers

- [ ] **Step 4: Run targeted tests to verify they still fail later**

Run: `./mvnw -q -Dtest=WebControllerTest,UploadControllerTest test`
Expected: FAIL later because controllers and services are still missing.

## Task 3: Add cookie-aware auth behavior

**Files:**
- Modify: `src/main/java/com/startuphub/security/JwtAuthenticationFilter.java`
- Modify: `src/main/java/com/startuphub/controller/AuthController.java`
- Modify: `src/main/java/com/startuphub/config/SecurityConfig.java`
- Test: `src/test/java/com/startuphub/security/JwtAuthenticationFilterTest.java`

- [ ] **Step 1: Extend JWT extraction to support cookies**

Behavior:
- prefer bearer header when present
- otherwise look for the auth cookie
- authenticate exactly as today once a token is found

- [ ] **Step 2: Add cookie-setting auth responses**

On register and login:
- keep returning `AuthResponse`
- also set an `HttpOnly` cookie containing the JWT

Add logout endpoint:

```java
@PostMapping("/logout")
public ResponseEntity<Map<String, String>> logout() { }
```

Behavior:
- clear the auth cookie
- return JSON confirmation

- [ ] **Step 3: Adjust security rules for browser routes**

Requirements:
- `/`, static assets, and uploaded assets are public
- `/app/**` requires authentication
- existing `/api/**` protection remains in place

- [ ] **Step 4: Run cookie/auth tests**

Run: `./mvnw -q -Dtest=JwtAuthenticationFilterTest,AuthControllerTest test`
Expected: PASS

## Task 4: Add upload service and upload controller with TDD

**Files:**
- Create: `src/main/java/com/startuphub/service/FileStorageService.java`
- Create: `src/main/java/com/startuphub/controller/UploadController.java`
- Create: `src/main/java/com/startuphub/dto/UploadResponse.java`
- Test: `src/test/java/com/startuphub/controller/UploadControllerTest.java`

- [ ] **Step 1: Implement file storage service**

Responsibilities:
- create upload directories if missing
- generate unique filenames
- store multipart files under the configured upload root
- return the public path string

- [ ] **Step 2: Implement upload endpoints**

Add routes for:
- `POST /api/uploads/profile-photo`
- `POST /api/uploads/post-image`
- `POST /api/uploads/startup-logo`

Behavior:
- authenticated only
- reject empty file uploads with `400`
- return `UploadResponse`

- [ ] **Step 3: Run upload tests**

Run: `./mvnw -q -Dtest=UploadControllerTest test`
Expected: PASS

## Task 5: Add web page controller and template shells

**Files:**
- Create: `src/main/java/com/startuphub/controller/WebController.java`
- Create: `src/main/resources/templates/index.html`
- Create: `src/main/resources/templates/feed.html`
- Create: `src/main/resources/templates/discovery.html`
- Create: `src/main/resources/templates/profile.html`
- Create: `src/main/resources/templates/startups.html`
- Create: `src/main/resources/templates/startup-detail.html`
- Create: `src/main/resources/templates/notifications.html`
- Test: `src/test/java/com/startuphub/controller/WebControllerTest.java`

- [ ] **Step 1: Implement the page controller**

Add handlers for:
- `/`
- `/app/feed`
- `/app/discovery`
- `/app/profile`
- `/app/startups`
- `/app/startups/{startupId}`
- `/app/notifications`

- [ ] **Step 2: Add template shells with stable markers**

Each template should render:
- page title
- app shell/nav container
- one page-specific root element for JS hydration

- [ ] **Step 3: Run web controller tests**

Run: `./mvnw -q -Dtest=WebControllerTest test`
Expected: PASS

## Task 6: Build the visual system and shared frontend shell

**Files:**
- Create: `src/main/resources/static/css/app.css`
- Update: all template files from Task 5

- [ ] **Step 1: Define the visual system**

Add:
- CSS variables
- custom typography stack
- gradients and layered backgrounds
- responsive navigation and card primitives

- [ ] **Step 2: Apply the design to landing and app shell**

Requirements:
- attractive landing hero
- non-generic Bootstrap layout
- responsive navigation for desktop and mobile

- [ ] **Step 3: Keep template structure simple for JS binding**

Each page should expose clear root ids and data attributes for the page script.

## Task 7: Build page-specific JavaScript flows

**Files:**
- Create: `src/main/resources/static/js/auth.js`
- Create: `src/main/resources/static/js/feed.js`
- Create: `src/main/resources/static/js/discovery.js`
- Create: `src/main/resources/static/js/profile.js`
- Create: `src/main/resources/static/js/startups.js`
- Create: `src/main/resources/static/js/notifications.js`
- Update: related templates from Task 5

- [ ] **Step 1: Build landing/auth flow**

Behavior:
- register form calls `/api/auth/register`
- login form calls `/api/auth/login`
- success redirects to `/app/feed`
- logout calls `/api/auth/logout`

- [ ] **Step 2: Build feed page**

Behavior:
- load feed from `/api/posts`
- create posts
- upload post images before creating image posts
- like posts
- render comment counts and author summaries

- [ ] **Step 3: Build discovery and notifications pages**

Behavior:
- discovery search calls `/api/discovery/search/users`
- suggestions call `/api/discovery/suggestions`
- notifications call `/api/notifications`
- mark notification read via `/api/notifications/{id}/read`

- [ ] **Step 4: Build profile page**

Behavior:
- load `/api/profile/me`
- update profile
- upload profile photo
- render followers/following summaries

- [ ] **Step 5: Build startup pages**

Behavior:
- list startups from `/api/startups`
- create startup
- fetch startup details
- update owner startup
- upload startup logo
- follow and unfollow startup

## Task 8: Full verification and docs update

**Files:**
- Modify: `tracker.md`
- Modify: `developer.md`

- [ ] **Step 1: Run the full test suite**

Run: `./mvnw test`
Expected: PASS

- [ ] **Step 2: Update tracker**

Mark Phase 6 frontend UI, cookie auth, and media upload items done. Keep direct messaging as the next major TODO.

- [ ] **Step 3: Update developer context**

Document:
- final frontend architecture
- cookie auth behavior
- upload configuration and storage path
- browser testing steps

- [ ] **Step 4: Optional live verification**

Run the app and verify in browser or via `curl`:
- register/login sets cookie
- authenticated pages load
- logout clears cookie
- post image upload works
- profile photo upload works
- startup logo upload works

## Self-Review

Spec coverage check:
- browser auth, page routes, uploads, and attractive multi-page UI are covered in Tasks 2 through 7
- keeping existing APIs and adding cookie compatibility is covered in Task 3
- local file storage and serving are covered in Tasks 2 and 4
- docs and end-to-end verification are covered in Task 8

Placeholder scan:
- no `TODO`, `TBD`, or undefined implementation instructions remain inside the plan body

Type consistency:
- `FileStorageService`, `UploadController`, `UploadResponse`, `WebController`, and the page/template names are used consistently across the tasks
