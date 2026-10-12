/* =========================================================
   Mary's Tailoring Studio – Contact page JS
   ========================================================= */
(function () {
  "use strict";

  // >>> change these two to your real details <<<
  var WHATSAPP_NUMBER = "919999829846"; // country code + number, no + or spaces
  var STORE_KEY = "contactMessages";

  /* ---------- navbar shadow + close mobile menu on link click ---------- */
  var nav = document.querySelector(".navbar");
  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 30);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var menu = document.getElementById("navbarMenu");
  if (menu && window.bootstrap) {
    menu.querySelectorAll(".nav-link, .book-button").forEach(function (a) {
      a.addEventListener("click", function () {
        if (menu.classList.contains("show")) {
          window.bootstrap.Collapse.getOrCreateInstance(menu).hide();
        }
      });
    });
  }

  /* ---------- form ---------- */
  var form = document.getElementById("ctForm");
  var statusEl = document.getElementById("ctStatus");
  var sendBtn = document.getElementById("ctSend");

  var rules = {
    ctName: function (v) {
      if (v.length < 2) return "Please enter your name.";
      if (!/^[A-Za-z][A-Za-z .'-]*$/.test(v))
        return "Name can only contain letters.";
      return "";
    },
    ctEmail: function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
        ? ""
        : "Please enter a valid email address.";
    },
    ctPhone: function (v) {
      var digits = v.replace(/\D/g, "");
      if (!/^[0-9+\-\s()]+$/.test(v)) return "Phone can only contain digits.";
      return digits.length >= 10 && digits.length <= 13
        ? ""
        : "Please enter a valid phone number.";
    },
    ctSubject: function (v) {
      return v ? "" : "Please choose a subject.";
    },
    ctMessage: function (v) {
      return v.length >= 10 ? "" : "Message should be at least 10 characters.";
    },
  };

  function validateField(id) {
    var input = document.getElementById(id);
    if (!input) return true;
    var msg = rules[id](input.value.trim());
    var wrap = input.closest(".ct-field");
    var err = wrap.querySelector(".ct-error");
    wrap.classList.toggle("invalid", !!msg);
    err.textContent = msg;
    return !msg;
  }

  function setStatus(text, type) {
    statusEl.textContent = text;
    statusEl.className = "ct-status" + (type ? " " + type : "");
  }

  if (form) {
    Object.keys(rules).forEach(function (id) {
      var el = document.getElementById(id);
      el.addEventListener("blur", function () {
        validateField(id);
      });
      el.addEventListener("input", function () {
        if (el.closest(".ct-field").classList.contains("invalid"))
          validateField(id);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      setStatus("", "");

      var allOk = true;
      var firstBad = null;
      Object.keys(rules).forEach(function (id) {
        if (!validateField(id)) {
          allOk = false;
          if (!firstBad) firstBad = document.getElementById(id);
        }
      });
      if (!allOk) {
        firstBad.focus();
        setStatus("Please fix the highlighted fields.", "err");
        return;
      }

      var data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        subject: form.subject.value,
        message: form.message.value.trim(),
        date: new Date().toISOString(),
      };

      // keep a local copy (demo – no server)
      try {
        var list = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
        list.push(data);
        localStorage.setItem(STORE_KEY, JSON.stringify(list));
      } catch (err) {
        /* storage blocked – ignore */
      }

      // send through WhatsApp
      var text =
        "Hello Mary's Tailoring Studio,\n\n" +
        "*Name:* " +
        data.name +
        "\n" +
        "*Email:* " +
        data.email +
        "\n" +
        "*Phone:* " +
        data.phone +
        "\n" +
        "*Subject:* " +
        data.subject +
        "\n\n" +
        "*Message:*\n" +
        data.message;

      sendBtn.disabled = true;
      setStatus(
        "Thank you, " +
          data.name.split(" ")[0] +
          "! Opening WhatsApp to send your message…",
        "ok",
      );

      setTimeout(function () {
        window.open(
          "https://wa.me/" +
            WHATSAPP_NUMBER +
            "?text=" +
            encodeURIComponent(text),
          "_blank",
          "noopener",
        );
        form.reset();
        form.querySelectorAll(".ct-field").forEach(function (f) {
          f.classList.remove("invalid");
        });
        sendBtn.disabled = false;
        setStatus(
          "Message prepared! Press send in WhatsApp and we'll reply within 24 hours.",
          "ok",
        );
      }, 900);
    });
  }

  /* ---------- FAQ accordion (one open at a time) ---------- */
  var items = document.querySelectorAll(".ct-faq-item");
  items.forEach(function (item) {
    var btn = item.querySelector(".ct-faq-q");
    var ans = item.querySelector(".ct-faq-a");
    btn.addEventListener("click", function () {
      var opening = !item.classList.contains("open");
      items.forEach(function (o) {
        o.classList.remove("open");
        o.querySelector(".ct-faq-q").setAttribute("aria-expanded", "false");
        o.querySelector(".ct-faq-a").style.maxHeight = null;
      });
      if (opening) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        ans.style.maxHeight = ans.scrollHeight + "px";
      }
    });
  });

  /* ---------- fade-in on scroll ---------- */
  if ("IntersectionObserver" in window) {
    var targets = document.querySelectorAll(
      ".ct-info-item, .ct-card, .ct-find-box, .ct-faq-item",
    );
    targets.forEach(function (t) {
      t.style.opacity = "0";
      t.style.transform = "translateY(18px)";
      t.style.transition = "opacity .6s ease, transform .6s ease";
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.style.opacity = "1";
            en.target.style.transform = "none";
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    targets.forEach(function (t) {
      io.observe(t);
    });
  }
})();
