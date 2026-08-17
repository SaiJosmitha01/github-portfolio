"use strict";

document.documentElement.classList.replace("no-js", "js");

const header = document.querySelector("[data-header]");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const backToTop = document.querySelector("[data-back-to-top]");
const navLinks = [...document.querySelectorAll('.nav__link[href^="#"]')];
const sections = [...document.querySelectorAll("main section[id]")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const visibleSections = new Map();

const setMenuState = (isOpen) => {
  menu?.classList.toggle("is-open", isOpen);
  menuToggle?.setAttribute("aria-expanded", String(isOpen));
  menuToggle?.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  document.body.classList.toggle("menu-open", isOpen);
};

const updateScrollControls = () => {
  const hasScrolled = window.scrollY > 16;
  header?.classList.toggle("is-scrolled", hasScrolled);
  backToTop?.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.6);
};

menuToggle?.addEventListener("click", () => {
  const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  setMenuState(willOpen);
  if (willOpen) navLinks[0]?.focus();
});

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));

    if (!target) return;

    event.preventDefault();
    setMenuState(false);
    target.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth" });
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
    setMenuState(false);
    menuToggle.focus();
  }

  if (event.key !== "Tab" || menuToggle?.getAttribute("aria-expanded") !== "true") return;

  const focusableItems = [menuToggle, ...navLinks];
  const firstItem = focusableItems[0];
  const lastItem = focusableItems[focusableItems.length - 1];

  if (event.shiftKey && document.activeElement === firstItem) {
    event.preventDefault();
    lastItem.focus();
  } else if (!event.shiftKey && document.activeElement === lastItem) {
    event.preventDefault();
    firstItem.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 1024) setMenuState(false);
});

window.addEventListener("scroll", updateScrollControls, { passive: true });
updateScrollControls();

const activeSectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visibleSections.set(entry.target.id, entry.intersectionRatio);
      else visibleSections.delete(entry.target.id);
    });

    const activeSection = [...visibleSections.entries()]
      .sort((a, b) => b[1] - a[1])[0];

    if (!activeSection) return;

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${activeSection[0]}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  },
  { rootMargin: "-25% 0px -60%", threshold: [0, 0.25, 0.5] }
);

sections.forEach((section) => activeSectionObserver.observe(section));

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
});

// ===============================
// CASE STUDY MODAL
// ===============================

const modal = document.getElementById("case-study-modal");
const closeModal = document.getElementById("close-modal");

let experienceData = [];

fetch("data/site-data.json")
    .then(response => response.json())
    .then(data => {
      experienceData = data.experience;
    });
// Get all "Read Case Study" buttons
const caseStudyButtons = document.querySelectorAll(".case-study-btn");

// Open modal when button is clicked
caseStudyButtons.forEach(button => {

  button.addEventListener("click", () => {

    const companyId = button.dataset.company;

    const company = experienceData.find(
        item => item.id === companyId
    );

    if (!company) return;

    document.getElementById("modal-company").textContent =
        company.company;

    document.getElementById("modal-role").textContent =
        company.role;

    document.getElementById("modal-duration").textContent =
        company.duration;

    document.getElementById("modal-project").textContent =
        company.project;

    document.getElementById("modal-overview").textContent =
        company.overview;

    document.getElementById("modal-business-problem").textContent =
        company.businessProblem;

    document.getElementById("modal-technologies").innerHTML =
        company.technologies.map(
            tech => `<span class="tech-tag">${tech}</span>`
        ).join("");

    document.getElementById("modal-responsibilities").innerHTML =
        "<ul>" +
        company.responsibilities
            .map(item => `<li>${item}</li>`)
            .join("") +
        "</ul>";

    document.getElementById("modal-impact").innerHTML =
        "<ul>" +
        company.impact
            .map(item => `<li>${item}</li>`)
            .join("") +
        "</ul>";

    modal.showModal();

  });

});
closeModal.addEventListener("click", () => {
  modal.close();
});
