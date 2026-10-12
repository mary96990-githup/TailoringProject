/* ============================================================
   MARY'S TAILORING STUDIO - script.js
   Works with index.html (Bootstrap 5 + your style.css)
============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  /* ----------------------------------------------------------
     SETTINGS - change these if needed
  ---------------------------------------------------------- */
  const WHATSAPP_NUMBER = "919999829846"; // country code + number, no + or spaces

  /* ----------------------------------------------------------
     1. NAVBAR: shadow when scrolling
  ---------------------------------------------------------- */
  const navbar = document.querySelector(".navbar");

  function handleNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 40) {
      navbar.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.35)";
    } else {
      navbar.style.boxShadow = "none";
    }
  }

  handleNavbarScroll();
  window.addEventListener("scroll", handleNavbarScroll);

  /* ----------------------------------------------------------
     2. MOBILE MENU: close automatically after clicking a link
  ---------------------------------------------------------- */
  const navMenu = document.getElementById("navbarMenu");

  if (navMenu && window.bootstrap) {
    const menuLinks = navMenu.querySelectorAll("a");

    menuLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (navMenu.classList.contains("show")) {
          bootstrap.Collapse.getOrCreateInstance(navMenu).hide();
        }
      });
    });
  }

  /* ----------------------------------------------------------
     3. SMOOTH SCROLL for in-page links (href="#something")
        Accounts for the fixed navbar height
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId.length < 2) return; // ignore plain "#" (social icons)

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const offset = navbar ? navbar.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  /* ----------------------------------------------------------
     4. FADE-IN ANIMATION when sections scroll into view
  ---------------------------------------------------------- */
  const animatedItems = document.querySelectorAll(
    ".service-card, .why-item, .gallery-image, .review-card, .studio-card",
  );

  if ("IntersectionObserver" in window) {
    animatedItems.forEach(function (item) {
      item.style.opacity = "0";
      item.style.transform = "translateY(20px)";
      item.style.transition = "opacity 0.6s ease, transform 0.6s ease";
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
     5. CONTACT FORM
        - validates fields
        - shows a success / error message
        - opens WhatsApp with the message pre-filled
          (there is no server, so this is how Mary receives it)
  ---------------------------------------------------------- */
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    // message box shown under the form
    const formMessage = document.createElement("p");
    formMessage.style.cssText =
      "clear:both; margin-top:15px; font-family:Arial,sans-serif; font-size:13px; display:none;";
    contactForm.appendChild(formMessage);

    function showMessage(text, isError) {
      formMessage.textContent = text;
      formMessage.style.color = isError ? "#b3261e" : "#2e7d32";
      formMessage.style.display = "block";
    }

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const message = document.getElementById("message").value.trim();

      // Validation
      if (name.length < 2) {
        showMessage("Please enter your name.", true);
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        showMessage("Please enter a valid email address.", true);
        return;
      }

      if (message.length < 5) {
        showMessage("Please write a short message.", true);
        return;
      }

      // Build the WhatsApp message
      const text =
        "Hello Mary's Tailoring Studio,\n\n" +
        "Name: " +
        name +
        "\n" +
        "Email: " +
        email +
        "\n\n" +
        "Message: " +
        message;

      const url =
        "https://wa.me/" +
        WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(text);

      showMessage(
        "Thank you, " + name + "! Opening WhatsApp to send your message...",
        false,
      );
      window.open(url, "_blank");
      contactForm.reset();
    });
  }

  /* ----------------------------------------------------------
     6. FOOTER YEAR (optional)
        Add <span id="year"></span> in the footer if you want the
        year to update automatically.
  ---------------------------------------------------------- */
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});
