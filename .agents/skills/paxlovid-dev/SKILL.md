---
name: paxlovid-dev
description: >-
  Use this skill when developing, debugging, or modifying the PaxlovidWeb project.
  It contains critical rules about the architecture, tech stack (Vanilla JS), and
  the text parsing logic for the cloud pharmacy records.
---

# PaxlovidWeb Development Skill

This skill provides guidelines and runbooks for developing the PaxlovidWeb project.

## 1. Architecture & Tech Stack Rules

- **Pure Vanilla Web**: This project is built using 100% standard HTML, CSS, and JavaScript.
- **NO Build Tools**: Do **NOT** introduce Node.js, Vite, Webpack, TypeScript, React, Vue, or any other build steps. The files must run directly in a modern web browser.
- **File Structure**:
  - `index.html`: The main UI.
  - `styles.css`: All styling, including `@media print` rules.
  - `main.js`: DOM manipulation, event listeners, login logic (`sessionStorage`), and print preview rendering.
  - `parser.js`: Business logic for parsing and categorizing the messy text from cloud pharmacy records.
  - `data.js`: The hardcoded database of drug keywords (`proh`, `dont`, `pote`, `safe`, `safe2`, `DICT`).

## 2. Parsing Logic (`parser.js`)

When modifying `parser.js`, be aware of the following text structures:
- **Record Blocks**: The input text is split into blocks using semicolons `；`. We replace all newlines with `；` first.
- **Data Positioning**: Fields in the clipboard text are separated by Tabs (`\t`).
  - **Source/Visit Type**: Look for a 1-3 digit item number at the start of a line (e.g., `/^(\d{1,3})\t(.+)/`). The 10-digit provider code must NOT be mistaken for an item number.
  - **Drug Code (ATC/健保碼)**: Matched via `codeRe = /^[A-Za-z]{1,3}\d{5,10}.../`. This is the anchor point.
  - **Generic/Brand Names**: Found by looking at the columns immediately left and right of the Drug Code.
  - **Date**: Matched using a Regex `dateRe = /^\d{2,4}[\/\.-]\d{1,2}[\/\.-]\d{1,2}/`. Republic of China (ROC) years (e.g., 115) are automatically converted to Gregorian (e.g., 2026).

## 3. UI and Print Preview (`main.js`)

- **Print Preview**: The app uses an `iframe` with `contenteditable="true"` applied to its `<body>` to allow users to modify the generated report (e.g., Patient Name, ID) *before* actual printing.
- **Security**: The login system is purely frontend-based. It checks `sessionStorage` and hardcoded credentials in `main.js`. This is intentional and sufficient for the deployment context.

## 4. Deployment Workflow

1. Modify the raw `.html`, `.js`, or `.css` files.
2. Add and commit the changes using `git`.
3. Push to the `main` branch (`git push origin main`).
4. GitHub Pages will automatically update. Advise the user to press `Ctrl+F5` after ~1 minute to clear the cache and see the changes.
