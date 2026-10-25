const SQLJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/";

const CHALLENGES = {
  explore: {
    title: "Explore the database",
    label: "DATABASE EXPLORER",
    description: "Inspect the sample student data. Start with SELECT * FROM students; then explore courses and enrollments.",
    hint: "Tip: use the schema below the editor to discover table and column names.",
    query: "SELECT *\nFROM students;",
    check: ({ columns, rows }) => columns.includes("name") && rows.length >= 5,
    success: "Nice work — you successfully explored the student table.",
    failure: "Try selecting data from the students table. Your result should include a name column and several rows."
  },
  select: {
    title: "Select student names",
    label: "CODING CHALLENGE · SELECT",
    description: "Write a query that returns only the name column from the students table. Do not return every column.",
    hint: "Hint: SELECT name FROM students;",
    query: "SELECT name\nFROM students;",
    check: ({ columns, rows }) => columns.length === 1 && columns[0].toLowerCase() === "name" && rows.length >= 5,
    success: "Correct — you selected only the name column.",
    failure: "Your result should contain exactly one column named name, with one row for each student."
  },
  filter: {
    title: "Filter by major",
    label: "CODING CHALLENGE · WHERE",
    description: "Return the names of students whose major is Software Engineering. Show only the name and major columns.",
    hint: "Hint: use WHERE major = 'Software Engineering'. Text values need single quotes.",
    query: "SELECT name, major\nFROM students\nWHERE major = 'Software Engineering';",
    check: ({ columns, rows }) => columns.map((c) => c.toLowerCase()).join(",") === "name,major" && rows.length > 0 && rows.every((r) => String(r[1]) === "Software Engineering"),
    success: "Correct — every returned student studies Software Engineering.",
    failure: "Return exactly name and major, and filter the rows to Software Engineering students only."
  },
  debug: {
    title: "Debug the query",
    label: "DEBUGGING · FIND THE BUG",
    description: "This query has a mistake in the column name. Fix it so the query returns the name and major of students in year 2.",
    hint: "Hint: check the schema. The column is called year_level, not year.",
    query: "SELECT name, major\nFROM students\nWHERE year = 2;",
    check: ({ columns, rows }) => columns.map((c) => c.toLowerCase()).join(",") === "name,major" && rows.length === 3 && rows.every((r) => ["Omar", "Sara", "Mariam"].includes(String(r[0]))),
    success: "Query runs! Now verify the WHERE condition uses year_level = 2.",
    failure: "Fix the unknown column error by using the correct column name from the schema."
  },
  join: {
    title: "Join students and courses",
    label: "CODING CHALLENGE · JOIN",
    description: "Show each student's name alongside the course name they are enrolled in. Use students, enrollments, and courses.",
    hint: "Hint: join students.id to enrollments.student_id, then courses.course_id to enrollments.course_id.",
    query: "SELECT students.name, courses.course_name\nFROM students\nJOIN enrollments ON students.id = enrollments.student_id\nJOIN courses ON enrollments.course_id = courses.course_id;",
    check: ({ columns, rows }) => columns.length === 2 && columns[0].toLowerCase() === "name" && columns[1].toLowerCase() === "course_name" && rows.length > 0,
    success: "Great — your joins connected students to their enrolled courses.",
    failure: "Return two columns named name and course_name by joining all three tables."
  },
  aggregate: {
    title: "Count students by major",
    label: "EXAM PRACTICE · AGGREGATION",
    description: "Write a query that returns each major and the number of students in that major. Name the count column student_count.",
    hint: "Hint: GROUP BY major and use COUNT(*).",
    query: "SELECT major, COUNT(*) AS student_count\nFROM students\nGROUP BY major\nORDER BY major;",
    check: ({ columns, rows }) => columns.length === 2 && columns[0].toLowerCase() === "major" && columns[1].toLowerCase() === "student_count" && rows.length >= 2 && rows.every((r) => Number.isFinite(Number(r[1]))),
    success: "Correct — you grouped students by major and counted each group.",
    failure: "Return major and student_count using COUNT(*) and GROUP BY major."
  }
};

let database = null;
let SQL = null;
let lastResult = null;
let completed = new Set();
let activeChallenge = "explore";

export function initializeSQLPlayground() {
  const root = document.querySelector("[data-sql-playground]");
  if (!root) return;

  const $ = (selector) => root.querySelector(selector);
  const editor = $ ("[data-query-editor]");
  const runButton = $("[data-run-query]");
  const status = $("[data-engine-status]");
  const feedback = $("[data-query-feedback]");
  const resultWrap = $("[data-results-wrap]");
  const rowCount = $("[data-row-count]");
  const challengeSelect = $("[data-challenge-select]");
  const checkFeedback = $("[data-check-feedback]");

  try {
    completed = new Set(JSON.parse(localStorage.getItem("codebench-sql-completed") || "[]"));
  } catch {
    completed = new Set();
  }
  renderScore(root);

  const savedDraft = localStorage.getItem("codebench-sql-draft");
  if (savedDraft) editor.value = savedDraft;
  editor.addEventListener("input", () => {
    try { localStorage.setItem("codebench-sql-draft", editor.value); } catch { /* storage may be unavailable */ }
  });

  challengeSelect.addEventListener("change", () => loadChallenge(root, challengeSelect.value));
  $("[data-load-challenge]").addEventListener("click", () => loadChallenge(root, challengeSelect.value));
  runButton.addEventListener("click", () => runQuery(root));
  $("[data-reset-db]").addEventListener("click", () => resetDatabase(root));
  $("[data-check-challenge]").addEventListener("click", () => checkChallenge(root));
  editor.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      runQuery(root);
    }
    if (event.key === "Tab") {
      event.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.setRangeText("  ", start, end, "end");
      editor.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });

  loadChallenge(root, "explore");
  initializeEngine(root).catch((error) => {
    status.classList.add("is-error");
    status.innerHTML = '<span class="status-dot"></span> SQL engine unavailable';
    feedback.className = "sql-feedback is-error";
    feedback.textContent = `Could not load the SQL engine. Check your internet connection and reload this page. (${error.message})`;
  });
}

async function initializeEngine(root) {
  const status = root.querySelector("[data-engine-status]");
  const runButton = root.querySelector("[data-run-query]");
  await loadSqlJsScript();
  if (typeof window.initSqlJs !== "function") throw new Error("SQL.js did not initialize correctly");
  SQL = await window.initSqlJs({ locateFile: (file) => `${SQLJS_CDN}${file}` });
  database = createDatabase();
  status.classList.add("is-ready");
  status.innerHTML = '<span class="status-dot"></span> SQL engine ready';
  runButton.disabled = false;
  root.querySelector("[data-query-feedback]").className = "sql-feedback is-success";
  root.querySelector("[data-query-feedback]").textContent = "Ready. Write a query and run it to see live results.";
  runQuery(root);
}


function loadSqlJsScript() {
  if (typeof window.initSqlJs === "function") return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${SQLJS_CDN}sql-wasm.js`;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("The SQL.js library could not be downloaded"));
    document.head.append(script);
  });
}

function createDatabase() {
  const db = new SQL.Database();
  db.run(`
    CREATE TABLE students (
      id INTEGER PRIMARY KEY,
      student_id INTEGER UNIQUE,
      name TEXT NOT NULL,
      major TEXT NOT NULL,
      year_level INTEGER NOT NULL
    );
    CREATE TABLE courses (
      course_id TEXT PRIMARY KEY,
      course_name TEXT NOT NULL,
      credits INTEGER NOT NULL
    );
    CREATE TABLE enrollments (
      enrollment_id INTEGER PRIMARY KEY,
      student_id INTEGER NOT NULL,
      course_id TEXT NOT NULL,
      grade TEXT,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (course_id) REFERENCES courses(course_id)
    );
    INSERT INTO students (id, student_id, name, major, year_level) VALUES
      (101, 101, 'Amira', 'Software Engineering', 1),
      (102, 102, 'Omar', 'Computer Science', 2),
      (103, 103, 'Sara', 'Software Engineering', 2),
      (104, 104, 'Khalid', 'Cybersecurity', 3),
      (105, 105, 'Mariam', 'Computer Science', 2),
      (106, 106, 'Noor', 'Software Engineering', 3);
    INSERT INTO courses (course_id, course_name, credits) VALUES
      ('SE101', 'Programming Fundamentals', 3),
      ('CS202', 'Data Structures', 3),
      ('DB210', 'Introduction to Databases', 3),
      ('SE230', 'Software Design', 3);
    INSERT INTO enrollments (enrollment_id, student_id, course_id, grade) VALUES
      (1, 101, 'SE101', 'A'), (2, 101, 'DB210', 'B+'),
      (3, 102, 'CS202', 'B'), (4, 102, 'DB210', 'A-'),
      (5, 103, 'SE101', 'A-'), (6, 103, 'SE230', 'B+'),
      (7, 104, 'CS202', 'A'), (8, 105, 'DB210', 'B'),
      (9, 106, 'SE230', 'A');
  `);
  return db;
}

function runQuery(root) {
  if (!database) return;
  const editor = root.querySelector("[data-query-editor]");
  const feedback = root.querySelector("[data-query-feedback]");
  const resultWrap = root.querySelector("[data-results-wrap]");
  const rowCount = root.querySelector("[data-row-count]");
  const query = editor.value.trim();
  lastResult = null;

  if (!query) {
    showFeedback(feedback, "Enter a SQL query first.", "error");
    return;
  }
  if (/\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|ATTACH|DETACH|VACUUM|PRAGMA)\b/i.test(query)) {
    showFeedback(feedback, "This learning playground is read-only. Data-changing and schema-changing statements are blocked.", "error");
    rowCount.textContent = "Query blocked";
    return;
  }

  try {
    const statements = database.exec(query);
    const result = statements.length ? statements[statements.length - 1] : null;
    if (!result) {
      lastResult = { columns: [], rows: [] };
      resultWrap.innerHTML = '<div class="sql-empty-state"><strong>No result set</strong><p>The statement ran without returning rows.</p></div>';
      rowCount.textContent = "0 rows";
      showFeedback(feedback, "Query executed. No result set was returned.", "success");
      return;
    }
    lastResult = { columns: result.columns, rows: result.values };
    renderTable(resultWrap, result.columns, result.values);
    rowCount.textContent = `${result.values.length} row${result.values.length === 1 ? "" : "s"}`;
    showFeedback(feedback, `Query executed successfully · ${result.values.length} row${result.values.length === 1 ? "" : "s"} returned.`, "success");
  } catch (error) {
    resultWrap.innerHTML = '<div class="sql-empty-state is-error"><strong>Query needs a fix</strong><p>Read the error above, check the schema, and try again.</p></div>';
    rowCount.textContent = "Error";
    showFeedback(feedback, error.message, "error");
  }
}

function renderTable(container, columns, rows) {
  if (!columns.length) {
    container.innerHTML = '<div class="sql-empty-state"><strong>No columns returned</strong></div>';
    return;
  }
  const table = document.createElement("table");
  table.className = "sql-result-table";
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  columns.forEach((column) => {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = column;
    headerRow.append(th);
  });
  thead.append(headerRow);
  const tbody = document.createElement("tbody");
  rows.slice(0, 500).forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value === null ? "NULL" : String(value);
      if (value === null) td.className = "is-null";
      tr.append(td);
    });
    tbody.append(tr);
  });
  table.append(thead, tbody);
  container.replaceChildren(table);
  if (rows.length > 500) {
    const note = document.createElement("p");
    note.className = "sql-truncation-note";
    note.textContent = "Showing the first 500 rows.";
    container.append(note);
  }
}

function loadChallenge(root, key) {
  const challenge = CHALLENGES[key] || CHALLENGES.explore;
  activeChallenge = key;
  root.querySelector("[data-challenge-title]").textContent = challenge.title;
  root.querySelector(".sql-challenge-label").textContent = challenge.label;
  root.querySelector("[data-challenge-description]").textContent = challenge.description;
  root.querySelector("[data-challenge-hint]").textContent = challenge.hint;
  root.querySelector("[data-query-editor]").value = challenge.query;
  root.querySelector("[data-check-feedback]").textContent = "Run your query, then check your answer.";
  root.querySelector("[data-check-feedback]").className = "sql-score-note";
  const runButton = root.querySelector("[data-run-query]");
  if (runButton && database) runButton.disabled = false;
}

function checkChallenge(root) {
  const challenge = CHALLENGES[activeChallenge];
  const feedback = root.querySelector("[data-check-feedback]");
  if (!lastResult) {
    feedback.textContent = "Run a successful query first, then check your answer.";
    feedback.className = "sql-score-note is-error";
    return;
  }
  let passed = false;
  try { passed = challenge.check(lastResult); } catch { passed = false; }
  if (passed) {
    completed.add(activeChallenge);
    try { localStorage.setItem("codebench-sql-completed", JSON.stringify([...completed])); } catch { /* storage may be unavailable */ }
    feedback.textContent = challenge.success;
    feedback.className = "sql-score-note is-success";
    renderScore(root);
  } else {
    feedback.textContent = challenge.failure;
    feedback.className = "sql-score-note is-error";
  }
}

function renderScore(root) {
  const score = root.querySelector("[data-challenge-score]");
  const progress = root.querySelector("[data-progress-bar]");
  if (!score || !progress) return;
  score.innerHTML = `${completed.size} <span>/ 6</span>`;
  progress.style.width = `${Math.min(100, completed.size / 6 * 100)}%`;
}

function resetDatabase(root) {
  if (!SQL) return;
  if (database) database.close();
  database = createDatabase();
  lastResult = null;
  root.querySelector("[data-row-count]").textContent = "Database reset";
  showFeedback(root.querySelector("[data-query-feedback]"), "Sample database reset to its original data.", "success");
  runQuery(root);
}

function showFeedback(element, message, type) {
  element.className = `sql-feedback is-${type}`;
  element.textContent = message;
}

document.addEventListener("DOMContentLoaded", initializeSQLPlayground);
