# DevInspect AI — Feature Testing Checklist

Run backend (`npm run dev` in `backend`) and frontend (`npm run dev` in `frontend`) before testing.

## Authentication

| Feature | Status | How to verify |
|---------|--------|----------------|
| Sign Up | ✅ | `/auth?signup=true` → register with valid email + password ≥6 chars |
| Login | ✅ | `/auth` → login with same credentials → redirects to workspace |
| Logout | ☐ | Navbar **Log Out** → lands on `/`, protected routes redirect to auth |
| Invalid Login Handling | ✅ | Wrong password → shows error message, stays on auth page |

## Reviews

| Feature | Status | How to verify |
|---------|--------|----------------|
| Submit Java Code | ✅ | Workspace → Java template → **Run Review** |
| Submit JavaScript Code | ✅ | Workspace → JavaScript template → **Run Review** |
| Submit Python Code | ✅ | Workspace → Python template → **Run Review** |
| Review Score Generated | ✅ | Result panel shows numeric score (0–100) |
| Suggestions Generated | ✅ | Issues list shows title, description, and fix per finding |

## History

| Feature | Status | How to verify |
|---------|--------|----------------|
| Review Saved | ✅ | Logged-in user runs review → appears in `/history` |
| Review Loaded | ✅ | Click a history card → detail panel shows full report |
| Review Deleted | ✅ | Click 🗑️ on a card → confirm → item removed from list |

## Favorites

| Feature | Status | How to verify |
|---------|--------|----------------|
| Add Favorite | ✅ | Star (☆→⭐) on history item or workspace after review |
| Remove Favorite | ✅ | Star again → removed from **Favorites** tab |

## Chat

| Feature | Status | How to verify |
|---------|--------|----------------|
| Ask AI Questions | ✅ | After review → **AI Code Chat** → send a question |
| Follow-up Questions | ✅ | Ask a second question referencing the first → contextual reply |

## GitHub Import

| Feature | Status | How to verify |
|---------|--------|----------------|
| Import Public Repository File | ✅ | **GitHub Import** → paste public `blob` URL → **Fetch Code** |
| Analyze Imported Code | ✅ | **Run Review** on imported content → score + issues |

## Dashboard (UI)

| Feature | Status | How to verify |
|---------|--------|----------------|
| Total Reviews card | ✅ | `/dashboard` → count matches history length |
| Average Score card | ✅ | Displays mean of all review scores |
| Critical Issues card | ✅ | Shows critical + high severity count |
| Favorite Reviews card | ✅ | Matches favorites tab count |
| Review Trend chart | ✅ | Line chart after 2+ reviews |
| Language Usage chart | ✅ | Bar chart per language used |
| Issue Severity chart | ✅ | Donut + legend for severity breakdown |
