/* ============================================================
   MARY'S TAILORING STUDIO - services.js
   Add to services.html before </body>, after the Bootstrap script:
   <script src="services.js"></script>
============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  /* ----------------------------------------------------------
     1. NAVBAR: shadow when scrolling
  ---------------------------------------------------------- */
  const navbar = document.querySelector(".navbar");

  function handleNavbarScroll() {
    if (!navbar) return;
    navbar.style.boxShadow =
      window.scrollY > 40 ? "0 4px 15px rgba(0, 0, 0, 0.35)" : "none";
  }

  handleNavbarScroll();
  window.addEventListener("scroll", handleNavbarScroll);

  /* ----------------------------------------------------------
     2. MOBILE MENU: close after clicking a link
  ---------------------------------------------------------- */
  const navMenu = document.getElementById("navbarMenu");

  if (navMenu && window.bootstrap) {
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (navMenu.classList.contains("show")) {
          bootstrap.Collapse.getOrCreateInstance(navMenu).hide();
        }
      });
    });
  }

  /* ----------------------------------------------------------
     3. FADE-IN ANIMATION for service cards, process steps
        and the call-to-action. Cards appear one after another.
  ---------------------------------------------------------- */
  const animatedItems = document.querySelectorAll(
    ".service-showcase-card, .process-item, .services-heading, .service-final-cta .container",
  );

  if ("IntersectionObserver" in window) {
    animatedItems.forEach(function (item) {
      item.style.opacity = "0";
      item.style.transform = "translateY(25px)";
      item.style.transition = "opacity 0.7s ease, transform 0.7s ease";
    });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    animatedItems.forEach(function (item) {
      observer.observe(item);
    });

    // Stagger delay: service cards (resets every 3 cards per row)
    document
      .querySelectorAll(".service-showcase-card")
      .forEach(function (card, i) {
        card.style.transitionDelay = (i % 3) * 0.12 + "s";
      });

    // Stagger delay: process steps
    document.querySelectorAll(".process-item").forEach(function (item, i) {
      item.style.transitionDelay = i * 0.12 + "s";
    });
  }

  /* ----------------------------------------------------------
     4. SERVICE CARD LINKS: remember which service was clicked
        so order.html can pre-select it in the form.
        In order.html JS, read it with:
        localStorage.getItem("selectedService")
  ---------------------------------------------------------- */
  document.querySelectorAll(".service-showcase-card").forEach(function (card) {
    const link = card.querySelector("a");
    const title = card.querySelector("h3");
    if (!link || !title) return;

    link.addEventListener("click", function () {
      try {
        localStorage.setItem("selectedService", title.textContent.trim());
      } catch (err) {
        /* storage blocked - ignore */
      }
    });
  });

  /* ----------------------------------------------------------
     5. Hide an image that fails to load so no broken-image
        icon shows inside the service cards
  ---------------------------------------------------------- */
  document
    .querySelectorAll(".service-showcase-image img")
    .forEach(function (img) {
      img.addEventListener("error", function () {
        img.style.display = "none";
        img.parentElement.style.backgroundColor = "#efe6d3";
      });
    });

  /* ----------------------------------------------------------
     6. Placeholder social links (href="#") should not jump
        to the top of the page
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
    });
  });
});
