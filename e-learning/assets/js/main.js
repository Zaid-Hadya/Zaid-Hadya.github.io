import { initializeNavigation } from "./navigation.js";
import { initializeCourseCatalog } from "./course-catalog.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation();
  initializeCourseCatalog();
  initializeCopyrightYear();
});

function initializeCopyrightYear() {
  const yearElement = document.querySelector("#current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}
