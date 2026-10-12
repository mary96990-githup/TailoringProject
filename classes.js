/* ============================================================
   MARY'S TAILORING STUDIO - book-class.js
   Used by book-class.html

   - Reads ?level=beginner|intermediate|advanced from the URL
   - Shows that course's details (tabs switch between levels)
   - Validates the booking form
   - Sends the booking to Mary on WhatsApp + shows a summary
============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  /* ----------------------------------------------------------
     SETTINGS - edit these
  ---------------------------------------------------------- */
  const WHATSAPP_NUMBER = "919999829846"; // country code + number, no + or spaces
  const LOCATION = "Lajpat Nagar, Delhi, India";
  const CLASS_SIZE = "Small groups (5-8 students)";
  const TIMINGS = "Morning | Afternoon | Evening";

  /* ----------------------------------------------------------
     COURSE DATA - edit text, durations and fees here.
     fee: put your real price, e.g. "Rs. 4,500"
  ---------------------------------------------------------- */
  const COURSES = {
    beginner: {
      name: "Beginner Classes",
      icon: "bi-scissors",
      tagline: "Build Your Foundation",
      level: "Beginner",
      duration: "3 months",
      fee: "Contact us",
      desc:
        "Perfect for those with no prior experience. Learn the basics of hand " +
        "sewing, machine sewing, measurements and simple garment construction.",
      who:
        "Anyone starting from zero: students, homemakers, hobbyists, or " +
        "anyone who wants to begin a tailoring career.",
      topics: [
        "Introduction to tools and fabrics",
        "Hand sewing techniques",
        "Machine sewing techniques",
        "Taking accurate measurements",
        "Basic garment construction",
        "Simple garment project",
      ],
    },
    intermediate: {
      name: "Intermediate Classes",
      icon: "bi-person-standing-dress",
      tagline: "Build Your Confidence",
      level: "Intermediate",
      duration: "3 months",
      fee: "Contact us",
      desc:
        "Take your skills to the next level. Learn advanced techniques like " +
        "fitting, pattern adjustments, lining and professional finishing methods.",
      who:
        "Learners who already know the basics and want to stitch better-fitting, " +
        "professionally finished garments.",
      topics: [
        "Darts, pleats and seams",
        "Necklines and sleeves",
        "Zippers and closures",
        "Fitting and alterations",
        "Pattern adjustments",
        "Lining and professional finishing",
      ],
    },
    advanced: {
      name: "Advanced Classes",
      icon: "bi-vector-pen",
      tagline: "Master Your Art",
      level: "Advanced",
      duration: "6 months",
      fee: "Contact us",
      desc:
        "For experienced learners who want to specialize. Learn couture " +
        "techniques, complex draping, bridal wear, and custom design development.",
      who:
        "Experienced tailors and designers who want to specialise in couture, " +
        "bridal and ethnic wear, or build their own design line.",
      topics: [
        "Pattern making and adjustments",
        "Draping techniques",
        "Couture techniques",
        "Bridal wear",
        "Ethnic wear",
        "Custom design and styling",
      ],
    },
  };

  const INCLUDED = [
    "Learn from experienced instructors",
    "Hands-on practice with real fabrics and professional tools",
    "Small class sizes with personal attention",
    "Flexible scheduling",
    "Certificate upon completion",
    "Lifetime support after your course",
  ];

  /* ----------------------------------------------------------
     ELEMENTS
  ---------------------------------------------------------- */
  const tabs = document.querySelectorAll(".level-tab");
  const courseCard = document.getElementById("courseCard");
  const levelSelect = document.getElementById("level");
  const form = document.getElementById("bookingForm");
  const formMsg = document.getElementById("formMsg");
  const success = document.getElementById("bookingSuccess");
  const startDate = document.getElementById("startDate");

  let currentLevel = "beginner";

  /* ----------------------------------------------------------
     NAVBAR: shadow on scroll + close mobile menu on link click
  ---------------------------------------------------------- */
  const navbar = document.querySelector(".navbar");

  function handleNavbarScroll() {
    if (!navbar) return;
    navbar.style.boxShadow =
      window.scrollY > 40 ? "0 4px 15px rgba(0, 0, 0, 0.35)" : "none";
  }

  handleNavbarScroll();
  window.addEventListener("scroll", handleNavbarScroll);

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

  document.querySelectorAll('a[href="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
    });
  });

  /* ----------------------------------------------------------
     SHOW A COURSE
  ---------------------------------------------------------- */
  function listHtml(items) {
    return items
      .map(function (t) {
        return "<li>" + t + "</li>";
      })
      .join("");
  }

  function factHtml(icon, label, value) {
    return (
      '<div class="fact"><i class="bi ' +
      icon +
      '"></i><small>' +
      label +
      "</small><strong>" +
      value +
      "</strong></div>"
    );
  }

  function renderCourse(levelKey) {
    const c = COURSES[levelKey];
    if (!c) return;

    document.getElementById("cdIcon").className = "bi " + c.icon;
    document.getElementById("cdTitle").textContent = c.name;
    document.getElementById("cdTagline").textContent = c.tagline;
    document.getElementById("cdDesc").textContent = c.desc;
    document.getElementById("cdWho").textContent = c.who;
    document.getElementById("crumbLevel").textContent = c.level;

    document.getElementById("cdFacts").innerHTML =
      factHtml("bi-clock-history", "Duration", c.duration) +
      factHtml("bi-bar-chart-steps", "Level", c.level) +
      factHtml("bi-people", "Class size", CLASS_SIZE) +
      factHtml("bi-calendar3", "Timings", TIMINGS) +
      factHtml("bi-geo-alt", "Location", LOCATION) +
      factHtml("bi-cash-coin", "Fee", c.fee);

    document.getElementById("cdTopics").innerHTML = listHtml(c.topics);
    document.getElementById("cdIncluded").innerHTML = listHtml(INCLUDED);

    tabs.forEach(function (tab) {
      const active = tab.dataset.level === levelKey;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });

    levelSelect.value = levelKey;
    document.title = c.name + " | Book a Class | Mary's Tailoring Studio";
    currentLevel = levelKey;
  }

  function switchCourse(levelKey, updateUrl) {
    if (!COURSES[levelKey] || levelKey === currentLevel) return;

    courseCard.classList.add("switching");
    setTimeout(function () {
      renderCourse(levelKey);
      courseCard.classList.remove("switching");
    }, 250);

    if (updateUrl && window.history && history.replaceState) {
      history.replaceState(null, "", "?level=" + levelKey);
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      switchCourse(tab.dataset.level, true);
    });
  });

  // changing the dropdown also switches the course shown
  levelSelect.addEventListener("change", function () {
    switchCourse(levelSelect.value, true);
  });

  // first load: use ?level= from the URL (or the last chosen level)
  const params = new URLSearchParams(window.location.search);
  let startLevel = (params.get("level") || "").toLowerCase();

  if (!COURSES[startLevel]) {
    try {
      startLevel = localStorage.getItem("selectedClassLevel") || "beginner";
    } catch (err) {
      startLevel = "beginner";
    }
  }
  if (!COURSES[startLevel]) startLevel = "beginner";

  renderCourse(startLevel);

  /* ----------------------------------------------------------
     DATE FIELD: can't pick a day in the past
  ---------------------------------------------------------- */
  function todayString() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  startDate.min = todayString();

  /* ----------------------------------------------------------
     FORM HELPERS
  ---------------------------------------------------------- */
  function showError(text, field) {
    formMsg.textContent = text;
    form.querySelectorAll(".invalid").forEach(function (el) {
      el.classList.remove("invalid");
    });
    if (field) {
      field.classList.add("invalid");
      field.focus();
    }
  }

  form.querySelectorAll("input, select, textarea").forEach(function (el) {
    el.addEventListener("input", function () {
      el.classList.remove("invalid");
      formMsg.textContent = "";
    });
  });

  function cleanPhone(value) {
    let digits = value.replace(/[^\d]/g, "");
    if (digits.length === 12 && digits.indexOf("91") === 0) {
      digits = digits.slice(2);
    }
    if (digits.length === 11 && digits.charAt(0) === "0") {
      digits = digits.slice(1);
    }
    return digits;
  }

  function formatDate(value) {
    if (!value) return "Not specified";
    const parts = value.split("-");
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function makeReference() {
    const d = new Date();
    const stamp =
      String(d.getFullYear()).slice(2) +
      String(d.getMonth() + 1).padStart(2, "0") +
      String(d.getDate()).padStart(2, "0");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return "MTS-" + stamp + "-" + rand;
  }

  /* ----------------------------------------------------------
     SUBMIT
  ---------------------------------------------------------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nameField = document.getElementById("fullName");
    const phoneField = document.getElementById("phone");
    const emailField = document.getElementById("email");
    const timingField = document.getElementById("timing");
    const notesField = document.getElementById("notes");

    const name = nameField.value.trim();
    const phone = cleanPhone(phoneField.value);
    const email = emailField.value.trim();
    const timing = timingField.value;
    const notes = notesField.value.trim();
    const dateValue = startDate.value;

    if (name.length < 2) {
      showError("Please enter your full name.", nameField);
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      showError("Please enter a valid 10-digit mobile number.", phoneField);
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Please enter a valid email address.", emailField);
      return;
    }

    if (!timing) {
      showError("Please choose a preferred timing.", timingField);
      return;
    }

    if (dateValue && dateValue < todayString()) {
      showError("Please choose a start date from today onwards.", startDate);
      return;
    }

    showError("", null);

    const course = COURSES[levelSelect.value];
    const reference = makeReference();

    // WhatsApp message to Mary
    const lines = [
      "Hello Mary's Tailoring Studio,",
      "",
      "I would like to book a class.",
      "",
      "Reference: " + reference,
      "Name: " + name,
      "Phone: +91 " + phone,
    ];
    if (email) lines.push("Email: " + email);
    lines.push(
      "Class: " + course.name + " (" + course.duration + ")",
      "Preferred timing: " + timing,
      "Preferred start date: " + formatDate(dateValue),
    );
    if (notes) lines.push("", "Notes: " + notes);

    const waUrl =
      "https://wa.me/" +
      WHATSAPP_NUMBER +
      "?text=" +
      encodeURIComponent(lines.join("\n"));

    // remember the booking in this browser (no server yet)
    try {
      const saved = JSON.parse(localStorage.getItem("classBookings") || "[]");
      saved.push({
        reference: reference,
        name: name,
        phone: phone,
        email: email,
        level: levelSelect.value,
        timing: timing,
        startDate: dateValue,
        notes: notes,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("classBookings", JSON.stringify(saved));
      localStorage.setItem("selectedClassLevel", levelSelect.value);
    } catch (err) {
      /* storage blocked - ignore */
    }

    // fill and show the success summary (textContent = safe)
    document.getElementById("sName").textContent = name;
    document.getElementById("sRef").textContent = reference;
    document.getElementById("sClass").textContent = course.name;
    document.getElementById("sDuration").textContent = course.duration;
    document.getElementById("sTiming").textContent = timing;
    document.getElementById("sDate").textContent = formatDate(dateValue);
    document.getElementById("sWhatsapp").href = waUrl;

    form.hidden = true;
    document.querySelector(".booking-form-card h2").hidden = true;
    document.querySelector(".form-intro").hidden = true;
    success.hidden = false;

    document
      .getElementById("bookingCard")
      .scrollIntoView({ behavior: "smooth", block: "start" });

    // open WhatsApp straight away (the button is there if it was blocked)
    window.open(waUrl, "_blank", "noopener");
  });

  /* ----------------------------------------------------------
     "Make another booking"
  ---------------------------------------------------------- */
  document.getElementById("bookAgain").addEventListener("click", function () {
    form.reset();
    levelSelect.value = currentLevel;
    form.hidden = false;
    document.querySelector(".booking-form-card h2").hidden = false;
    document.querySelector(".form-intro").hidden = false;
    success.hidden = true;
  });
});
