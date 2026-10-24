document.addEventListener("DOMContentLoaded", () => {
  const moduleLinks = document.querySelectorAll(
    '.module-link[href^="#module-"]',
  );

  moduleLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const targetSelector = link.getAttribute("href");
      const target = document.querySelector(targetSelector);

      if (!target) {
        return;
      }

      document.querySelectorAll(".module-content").forEach((module) => {
        module.classList.remove("module-highlight");
      });

      target.classList.add("module-highlight");
    });
  });
});
