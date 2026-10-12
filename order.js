/* =========================================================
   Mary's Tailoring Studio – Order page JS
   validation, service pre-select, time slots, WhatsApp submit
   ========================================================= */
(function () {
  "use strict";

  // >>> change to your real WhatsApp number (country code + number, no + or spaces) <<<
  var WHATSAPP_NUMBER = "919999829846";
  var STORE_KEY = "marysOrders";

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

  var form = document.getElementById("odForm");
  if (!form) return;
  var statusEl = document.getElementById("odStatus");
  var submitBtn = document.getElementById("odSubmit");
  var svcErr = document.getElementById("odSvcErr");
  var dateEl = document.getElementById("odDate");
  var timeEl = document.getElementById("odTime");

  /* ---------- time slots 9:00 – 18:30 ---------- */
  function fmt(h, m) {
    var ap = h >= 12 ? "PM" : "AM";
    var hh = h % 12 || 12;
    return hh + ":" + (m < 10 ? "0" + m : m) + " " + ap;
  }
  for (var h = 9; h <= 18; h++) {
    [0, 30].forEach(function (m) {
      var o = document.createElement("option");
      o.textContent = fmt(h, m);
      timeEl.appendChild(o);
    });
  }

  /* ---------- date: today onwards ---------- */
  function iso(d) {
    var p = function (n) {
      return n < 10 ? "0" + n : n;
    };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }
  var today = new Date();
  dateEl.min = iso(today);
  var max = new Date();
  max.setFullYear(max.getFullYear() + 1);
  dateEl.max = iso(max);

  /* ---------- pre-select service (?service=… or from Services page) ---------- */
  function preselect() {
    var wanted = "";
    try {
      wanted = new URLSearchParams(location.search).get("service") || "";
    } catch (e) {}
    if (!wanted) {
      try {
        var s = localStorage.getItem("selectedService") || "";
        try {
          var j = JSON.parse(s);
          s = (j && (j.name || j.title || j.service)) || s;
        } catch (e) {}
        wanted = typeof s === "string" ? s : "";
      } catch (e) {}
    }
    wanted = wanted.toLowerCase();
    if (!wanted) return;
    var radios = form.querySelectorAll('input[name="service"]');
    radios.forEach(function (r) {
      var v = r.value.toLowerCase();
      if (wanted.indexOf(v.split(" ")[0]) !== -1 || v.indexOf(wanted) !== -1)
        r.checked = true;
    });
  }
  preselect();

  /* ---------- validation ---------- */
  var rules = {
    odName: function (v) {
      if (v.length < 2) return "Please enter your full name.";
      return /^[A-Za-z][A-Za-z .'-]*$/.test(v)
        ? ""
        : "Name can only contain letters.";
    },
    odEmail: function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
        ? ""
        : "Please enter a valid email address.";
    },
    odPhone: function (v) {
      var d = v.replace(/\D/g, "");
      if (!/^[0-9+\-\s()]+$/.test(v)) return "Phone can only contain digits.";
      return d.length >= 10 && d.length <= 13
        ? ""
        : "Please enter a valid phone number.";
    },
    odGarment: function (v) {
      return v ? "" : "Please select a garment type.";
    },
    odQty: function (v) {
      return v ? "" : "Please select quantity.";
    },
    odDate: function (v) {
      if (!v) return "Please choose a date.";
      var d = new Date(v + "T00:00:00");
      var t = new Date();
      t.setHours(0, 0, 0, 0);
      if (d < t) return "Date cannot be in the past.";
      if (d.getDay() === 0)
        return "We are closed on Sundays — please pick another day.";
      return "";
    },
    odTime: function (v) {
      return v ? "" : "Please select a time.";
    },
  };

  function check(id) {
    var el = document.getElementById(id);
    var msg = rules[id](el.value.trim());
    var wrap = el.closest(".od-field");
    wrap.classList.toggle("invalid", !!msg);
    wrap.querySelector(".od-error").textContent = msg;
    return !msg;
  }
  function checkService() {
    var ok = !!form.querySelector('input[name="service"]:checked');
    svcErr.textContent = ok ? "" : "Please choose a service.";
    svcErr.classList.toggle("show", !ok);
    return ok;
  }
  function setStatus(t, c) {
    statusEl.textContent = t;
    statusEl.className = "od-status" + (c ? " " + c : "");
  }

  Object.keys(rules).forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener("blur", function () {
      check(id);
    });
    el.addEventListener("input", function () {
      if (el.closest(".od-field").classList.contains("invalid")) check(id);
    });
    el.addEventListener("change", function () {
      if (el.closest(".od-field").classList.contains("invalid")) check(id);
    });
  });
  form.querySelectorAll('input[name="service"]').forEach(function (r) {
    r.addEventListener("change", checkService);
  });

  /* ---------- submit ---------- */
  function refNo() {
    var d = new Date();
    var p = function (n) {
      return n < 10 ? "0" + n : "" + n;
    };
    return (
      "MTS-" +
      d.getFullYear().toString().slice(2) +
      p(d.getMonth() + 1) +
      p(d.getDate()) +
      "-" +
      Math.floor(1000 + Math.random() * 9000)
    );
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setStatus("", "");
    var ok = true,
      first = null;
    Object.keys(rules).forEach(function (id) {
      if (!check(id)) {
        ok = false;
        if (!first) first = document.getElementById(id);
      }
    });
    if (!checkService()) {
      ok = false;
      if (!first) first = form.querySelector('input[name="service"]');
    }
    if (!ok) {
      if (first && first.type !== "radio") first.focus();
      else
        document
          .getElementById("odSvcs")
          .scrollIntoView({ behavior: "smooth", block: "center" });
      setStatus("Please fix the highlighted fields.", "err");
      return;
    }

    var data = {
      ref: refNo(),
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      service: form.querySelector('input[name="service"]:checked').value,
      garment: form.garment.value,
      qty: form.qty.value,
      instructions: form.instructions.value.trim(),
      date: form.date.value,
      time: form.time.value,
      budget: form.budget.value.trim(),
      notes: form.notes.value.trim(),
      created: new Date().toISOString(),
    };

    try {
      var list = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
      list.push(data);
      localStorage.setItem(STORE_KEY, JSON.stringify(list));
    } catch (err) {}

    var text =
      "*New Order – " +
      data.ref +
      "*\n\n" +
      "*Name:* " +
      data.name +
      "\n" +
      "*Phone:* " +
      data.phone +
      "\n" +
      "*Email:* " +
      data.email +
      "\n\n" +
      "*Service:* " +
      data.service +
      "\n" +
      "*Garment:* " +
      data.garment +
      " × " +
      data.qty +
      "\n" +
      "*Appointment:* " +
      data.date +
      ", " +
      data.time +
      "\n" +
      (data.instructions ? "*Instructions:* " + data.instructions + "\n" : "") +
      (data.budget ? "*Budget:* " + data.budget + "\n" : "") +
      (data.notes ? "*Notes:* " + data.notes + "\n" : "");

    submitBtn.disabled = true;
    setStatus("Sending your order…", "ok");

    setTimeout(function () {
      window.open(
        "https://wa.me/" +
          WHATSAPP_NUMBER +
          "?text=" +
          encodeURIComponent(text),
        "_blank",
        "noopener",
      );
      document.getElementById("odSName").textContent = data.name.split(" ")[0];
      document.getElementById("odRef").textContent = data.ref;
      form.hidden = true;
      document.getElementById("odSuccess").hidden = false;
      submitBtn.disabled = false;
      setStatus("", "");
      document
        .getElementById("odFormWrap")
        .scrollIntoView({ behavior: "smooth", block: "start" });
    }, 700);
  });

  document.getElementById("odAnother").addEventListener("click", function () {
    form.reset();
    form.querySelectorAll(".od-field").forEach(function (f) {
      f.classList.remove("invalid");
    });
    document.getElementById("odSuccess").hidden = true;
    form.hidden = false;
    preselect();
  });
})();
