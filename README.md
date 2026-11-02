# SplitEase React

A React + Vite version of SplitEase, kept in its own folder so the original static app remains available.

## Run locally

1. Open this `react-app` folder in VS Code.
2. Open the integrated terminal in this folder.
3. Run `npm install` once, then `npm run dev`.
4. Open the local address Vite prints in the terminal.

To make a production build locally, run `npm run build`. The output is created in `dist/`.

## Deploy on Vercel

Import the repository into Vercel and set **Root Directory** to `react-app`. Vercel should detect Vite and use `npm run build` with `dist` as the output directory. The included `vercel.json` supports SPA route fallback.

## Current prototype behavior

- Create an account or log in from the React app. New accounts start empty; there are no seeded people, groups, or expenses.
- Create groups and enter each member's name yourself. Use **Manage members** on a group card to add more people later.
- Accounts, passwords, groups, members, and expenses are stored in this browser's local storage. This is a front-end prototype, not secure authentication; the data does not sync across browsers or devices.
- Expense shares support equal and custom amounts. Custom amounts must add up exactly to the expense total.
