# C4 Code Level: Front-End View Pages

## Overview

- **Name**: Vue 3 View Pages
- **Description**: Page-level components for the SPA's main routes, composing child components into full pages
- **Location**: `packages/front/src/views/`
- **Language**: TypeScript + Vue 3 (`<script setup>`)
- **Purpose**: Provide page layouts for the four application routes: callback, reserve, profile, and debug

## Code Elements

### CallbackPage.vue
- **Location**: `packages/front/src/views/CallbackPage.vue:1-33`
- **Route**: `/callback`
- **Description**: OAuth 2.0 callback handler. On mount, calls `useKeycloak().init()` then redirects to `/reserve`.
- **Dependencies**: `useKeycloak` composable, `vue-router`

### ReservePage.vue
- **Location**: `packages/front/src/views/ReservePage.vue:1-36`
- **Route**: `/reserve` (name: `Reserve`)
- **Description**: Main page wrapping `<ReserveAccess />` component for API endpoint testing
- **Dependencies**: `ReserveAccess` component

### ProfilPage.vue
- **Location**: `packages/front/src/views/ProfilPage.vue:1-36`
- **Route**: `/profil` (name: `Profil`)
- **Description**: User profile page wrapping `<UserProfile />` component
- **Dependencies**: `UserProfile` component

### DebugPage.vue
- **Location**: `packages/front/src/views/DebugPage.vue:1-36`
- **Route**: `/debug` (name: `Debug`)
- **Description**: Token inspection page wrapping `<TokenDebug />` component
- **Dependencies**: `TokenDebug` component

## Dependencies

### Internal
- `useKeycloak` composable (CallbackPage)
- Components: `ReserveAccess`, `UserProfile`, `TokenDebug`

### External
- **Vue 3** (`onMounted`)
- **vue-router** (navigation)

## Relationships

```mermaid
flowchart TB
    subgraph Views
        CP["CallbackPage"]
        RP["ReservePage"]
        PP["ProfilPage"]
        DP["DebugPage"]
    end
    subgraph Components
        RA["ReserveAccess"]
        UP["UserProfile"]
        TD["TokenDebug"]
    end
    subgraph Composables
        UK["useKeycloak()"]
    end
    CP -->|onMounted: init()| UK
    RP --> RA
    PP --> UP
    DP --> TD
    RA --> UK
    UP --> UK
    TD --> UK
```
