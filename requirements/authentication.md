# Feature: Authentication & User Profile Management

## Overview

BBQ Buddy implements authentication using Supabase Auth with email/password sign-in. The system automatically provisions user profiles upon registration, manages user sessions across server and client components using Supabase SSR pattern, and provides profile management capabilities including username updates and avatar uploads. Authentication integrates with Row Level Security (RLS) policies to ensure users can only access their own data.

## User Stories

- As a new user, I want to create an account with email and password so that I can start tracking my BBQ sessions
- As a registered user, I want to sign in with my credentials so that I can access my saved BBQ sessions
- As an authenticated user, I want to update my profile (username and avatar) so that I can personalize my account
- As an authenticated user, I want to sign out so that I can secure my account on shared devices
- As a user, I want my authentication state to persist across page refreshes so that I don't need to constantly re-login
- As a user, I want to see my avatar in the navigation bar so that I know I'm logged in and can quickly access my profile
- As a user, I want my username to be unique so that I can be clearly identified
- As a user, I want to upload and change my profile avatar so that my account feels personalized
