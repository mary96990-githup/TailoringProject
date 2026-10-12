/* =========================================================
   Mary's Tailoring Studio – Gallery page JS
   category filter + lightbox (arrows, keyboard, swipe)
   ========================================================= */
(function () {
  "use strict";

  /* ---------- navbar ---------- */
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
        if (menu.classList.contains("show"))
          window.bootstrap.Collapse.getOrCreateInstance(menu).hide();
      });
    });
  }

  /* ---------- category filter ---------- */
  var catWrap = document.getElementById("glCats");
  var cats = catWrap ? catWrap.querySelectorAll(".gl-cat") : [];
  var items = Array.prototype.slice.call(document.querySelectorAll(".gl-item"));
  var emptyMsg = document.getElementById("glEmpty");

  function applyFilter(key) {
    var shown = 0;
    items.forEach(function (it) {
      var match =
        key === "all" || it.dataset.category.split(" ").indexOf(key) !== -1;
      it.classList.toggle("hide", !match);
      if (match) {
        shown++;
        it.classList.remove("pop");
        void it.offsetWidth; // restart the animation
        it.classList.add("pop");
      }
    });
    if (emptyMsg) emptyMsg.hidden = shown !== 0;
  }

  cats.forEach(function (btn) {
    btn.addEventListener("click", function () {
      cats.forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      applyFilter(btn.dataset.filter);
      try {
        sessionStorage.setItem("glFilter", btn.dataset.filter);
      } catch (e) {}
    });
  });

  // remember last filter for this tab
  try {
    var saved = sessionStorage.getItem("glFilter");
    if (saved) {
      var b = catWrap.querySelector('[data-filter="' + saved + '"]');
      if (b) b.click();
    }
  } catch (e) {}

  /* ---------- hide broken images gracefully ---------- */
  document
    .querySelectorAll(".gl-thumb img, .gl-featured-img img")
    .forEach(function (img) {
      img.addEventListener("error", function () {
        img.style.visibility = "hidden";
      });
    });

  /* ---------- lightbox ---------- */
  var box = document.getElementById("glLightbox");
  var lbImg = document.getElementById("glLbImg");
  var lbCap = document.getElementById("glLbCap");
  var current = -1;
  var lastFocus = null;

  function visibleItems() {
    return items.filter(function (i) {
      return !i.classList.contains("hide");
    });
  }

  function show(list, idx) {
    var it = list[idx];
    if (!it) return;
    var img = it.querySelector("img");
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = img.alt;
    current = idx;
  }

  function open(item) {
    var list = visibleItems();
    lastFocus = document.activeElement;
    show(list, list.indexOf(item));
    box.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("glClose").focus();
  }
  function close() {
    box.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  function step(dir) {
    var list = visibleItems();
    if (!list.length) return;
    show(list, (current + dir + list.length) % list.length);
  }

  items.forEach(function (it) {
    it.querySelector(".gl-thumb").addEventListener("click", function () {
      open(it);
    });
  });
  document.getElementById("glClose").addEventListener("click", close);
  document.getElementById("glPrev").addEventListener("click", function () {
    step(-1);
  });
  document.getElementById("glNext").addEventListener("click", function () {
    step(1);
  });
  box.addEventListener("click", function (e) {
    if (e.target === box) close();
  });

  document.addEventListener("keydown", function (e) {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  // swipe on touch screens
  var startX = null;
  box.addEventListener(
    "touchstart",
    function (e) {
      startX = e.touches[0].clientX;
    },
    { passive: true },
  );
  box.addEventListener(
    "touchend",
    function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      startX = null;
    },
    { passive: true },
  );

  /* ---------- fade-in on scroll ---------- */
  if ("IntersectionObserver" in window) {
    var targets = document.querySelectorAll(".gl-featured");
    targets.forEach(function (t) {
      t.style.opacity = "0";
      t.style.transform = "translateY(16px)";
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
      { threshold: 0.1 },
    );
    targets.forEach(function (t) {
      io.observe(t);
    });
  }
})();
