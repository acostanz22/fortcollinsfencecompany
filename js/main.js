const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");

toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
});

document.querySelectorAll(".drop-btn").forEach((button) => {
  button.addEventListener("click", () => {
    if (window.matchMedia("(min-width: 861px)").matches) return;
    const drop = button.closest(".drop");
    const open = drop.classList.toggle("open");
    button.setAttribute("aria-expanded", open ? "true" : "false");
  });
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  nav?.classList.remove("open");
  toggle?.setAttribute("aria-expanded", "false");
});
