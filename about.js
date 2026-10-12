/* ============================================================
   MARY'S TAILORING STUDIO - about.js
   Use on about.html (add before </body>, after the Bootstrap script):
   <script src="about.js"></script>
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
     3. FADE-IN ANIMATION as sections scroll into view
  ---------------------------------------------------------- */
  const animatedItems = document.querySelectorAll(
    ".about-story-image, .about-story-section .col-lg-7, " +
      ".about-why-card, .values-content, .values-image, " +
      ".about-review-card, .about-cta-section .container",
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
      { threshold: 0.15 },
    );

    animatedItems.forEach(function (item) {
      observer.observe(item);
    });
  }

  /* ----------------------------------------------------------
     4. "WHY CHOOSE US" cards: stagger the animation delay
  ---------------------------------------------------------- */
  document.querySelectorAll(".about-why-card").forEach(function (card, i) {
    card.style.transitionDelay = i * 0.1 + "s";
  });

  /* ----------------------------------------------------------
     5. Hide a client photo that fails to load, so a broken
        image icon never shows (the circle keeps its grey bg)
  ---------------------------------------------------------- */
  document.querySelectorAll(".review-person img").forEach(function (img) {
    img.addEventListener("error", function () {
      img.style.display = "none";
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
