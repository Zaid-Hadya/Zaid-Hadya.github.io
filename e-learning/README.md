# CodeBench

A lightweight programming learning platform built with HTML, CSS,
and vanilla JavaScript.

## Current courses

- Introduction to Databases with SQL — available
- Introduction to Programming in Java — coming soon
- Object-Oriented Programming in Java — coming soon
- Data Structures and Algorithms — coming soon

## Project structure

- `index.html` — homepage and course catalogue
- `courses/` — individual course pages
- `assets/css/` — global, layout, component, and page styles
- `assets/js/` — navigation, catalogue, course, and playground logic
- `assets/images/` — logos and other static images

## Run locally

1. Open the project folder in your code editor.
2. Start a local development server.
3. Open the local URL provided by that server.

For example, in VS Code, you can use the Live Server extension.

Avoid opening the pages directly with `file://` because JavaScript
ES modules can be restricted when loaded from local files.

## SQL editor plan

The SQL playground will use SQL.js, which runs SQLite in the browser.
It will need a sample database, a query editor, execution controls,
a results table, and error handling.

The initial version will not require a backend for query execution.
Progress saving and user accounts can be added separately later.

## Deployment

The project is designed for static hosting. Before deploying, verify
the host's current usage policies and any limitations that apply to
your intended use.
