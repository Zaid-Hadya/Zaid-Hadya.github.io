export function initializeCourseCatalog() {
  const courseCards = document.querySelectorAll(".course-card");

  courseCards.forEach((card) => {
    const title = card.querySelector("h3");
    const link = card.querySelector(".course-link");
    const status = card.querySelector(".status");

    if (!title || !link) {
      return;
    }

    link.setAttribute("aria-label", `Open course: ${title.textContent.trim()}`);

    if (status?.classList.contains("status-upcoming")) {
      card.setAttribute("data-course-status", "upcoming");
    } else {
      card.setAttribute("data-course-status", "available");
    }
  });
}
