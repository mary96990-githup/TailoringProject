/* ============================================================
   MARY'S TAILORING STUDIO - signup.js
   Used by signup.html

   IMPORTANT: this site has no server, so this sign-up is a DEMO.
   The account is saved only in THIS browser (localStorage) so you
   can try Sign Up -> Log In. The password is stored as a salted
   hash, never as plain text, but real accounts must be created
   and checked on a server. Replace  createAccount()  with a call
   to your backend (e.g. fetch("/api/register", ...)) when ready.
============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  /* ----------------------------------------------------------
     ELEMENTS
  ---------------------------------------------------------- */
  const form = document.getElementById("signupForm");
  const btn = document.getElementById("signupBtn");
  const formMsg = document.getElementById("formMsg");
  const success = document.getElementById("signupSuccess");
  const orDivider = document.getElementById("orDivider");
  const googleBtn = document.getElementById("googleBtn");

  const fields = {
    name: {
      input: document.getElementById("fullName"),
      wrap: document.getElementById("nameWrap"),
      error: document.getElementById("nameError"),
    },
    email: {
      input: document.getElementById("email"),
      wrap: document.getElementById("emailWrap"),
      error: document.getElementById("emailError"),
    },
    phone: {
      input: document.getElementById("phone"),
      wrap: document.getElementById("phoneWrap"),
      error: document.getElementById("phoneError"),
    },
    password: {
      input: document.getElementById("password"),
      wrap: document.getElementById("passwordWrap"),
      error: document.getElementById("passwordError"),
    },
    confirm: {
      input: document.getElementById("confirmPassword"),
      wrap: document.getElementById("confirmWrap"),
      error: document.getElementById("confirmError"),
    },
  };

  const terms = document.getElementById("terms");
  const termsError = document.getElementById("termsError");
  const strength = document.getElementById("strength");
  const strengthText = document.getElementById("strengthText");
  const rules = document.querySelectorAll("#pwRules li");
  const capsWarning = document.getElementById("capsWarning");

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const ACCOUNTS_KEY = "maryAccounts";

  /* ----------------------------------------------------------
     SAFE STORAGE HELPERS
  ---------------------------------------------------------- */
  function readAccounts() {
    try {
      const list = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return [];
    }
  }

  function writeAccounts(list) {
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
      return true;
    } catch (err) {
      return false;
    }
  }

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

  document.querySelectorAll('.lf-social a[href="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
    });
  });

  /* ----------------------------------------------------------
     SMALL HELPERS
  ---------------------------------------------------------- */
  function setError(key, text) {
    const f = fields[key];
    f.error.textContent = text || "";
    f.wrap.classList.toggle("invalid", !!text);
  }

  function setMessage(text, type) {
    formMsg.textContent = text || "";
    formMsg.className = "form-msg" + (type ? " " + type : "");
  }

  function cleanPhone(value) {
    let digits = value.replace(/[^\d]/g, "");
    if (digits.length === 12 && digits.indexOf("91") === 0)
      digits = digits.slice(2);
    if (digits.length === 11 && digits.charAt(0) === "0")
      digits = digits.slice(1);
    return digits;
  }

  function toHex(buffer) {
    return Array.prototype.map
      .call(new Uint8Array(buffer), function (b) {
        return b.toString(16).padStart(2, "0");
      })
      .join("");
  }

  // salted SHA-256 (demo only - a real server should use bcrypt/argon2)
  function hashPassword(password, salt) {
    if (!window.crypto || !window.crypto.subtle) {
      return Promise.reject(new Error("no-crypto"));
    }
    const data = new TextEncoder().encode(salt + ":" + password);
    return window.crypto.subtle.digest("SHA-256", data).then(toHex);
  }

  function randomSalt() {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return toHex(bytes);
  }

  /* ----------------------------------------------------------
     SHOW / HIDE PASSWORD (both password fields)
  ---------------------------------------------------------- */
  document.querySelectorAll(".eye-btn").forEach(function (eye) {
    eye.addEventListener("click", function () {
      const input = document.getElementById(eye.dataset.target);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      eye.innerHTML = show
        ? '<i class="bi bi-eye-slash"></i>'
        : '<i class="bi bi-eye"></i>';
      eye.setAttribute("aria-label", show ? "Hide password" : "Show password");
      input.focus();
    });
  });

  /* ----------------------------------------------------------
     CAPS LOCK WARNING
  ---------------------------------------------------------- */
  function checkCaps(e) {
    if (e.getModifierState)
      capsWarning.hidden = !e.getModifierState("CapsLock");
  }

  [fields.password.input, fields.confirm.input].forEach(function (input) {
    input.addEventListener("keydown", checkCaps);
    input.addEventListener("keyup", checkCaps);
    input.addEventListener("blur", function () {
      capsWarning.hidden = true;
    });
  });

  /* ----------------------------------------------------------
     PASSWORD STRENGTH METER + RULE CHECKLIST
  ---------------------------------------------------------- */
  function passwordChecks(pw) {
    return {
      length: pw.length >= 8,
      case: /[a-z]/.test(pw) && /[A-Z]/.test(pw),
      number: /\d/.test(pw),
      symbol: /[^A-Za-z0-9]/.test(pw),
    };
  }

  const LEVELS = [
    { label: "Too weak", cls: "s1" },
    { label: "Weak", cls: "s1" },
    { label: "Fair", cls: "s2" },
    { label: "Good", cls: "s3" },
    { label: "Strong", cls: "s4" },
  ];

  function updateStrength() {
    const pw = fields.password.input.value;
    const checks = passwordChecks(pw);

    rules.forEach(function (li) {
      li.classList.toggle("ok", !!checks[li.dataset.rule]);
    });

    if (!pw) {
      strength.hidden = true;
      return;
    }

    const score = Object.keys(checks).filter(function (k) {
      return checks[k];
    }).length;

    // very short passwords never rate above "Weak"
    const level = LEVELS[pw.length < 6 ? Math.min(score, 1) : score];

    strength.hidden = false;
    strength.className = "strength " + level.cls;
    strengthText.textContent = level.label;
  }

  fields.password.input.addEventListener("input", function () {
    updateStrength();
    setError("password", "");
    if (fields.confirm.input.value) checkMatch();
  });

  /* ----------------------------------------------------------
     LIVE VALIDATION
  ---------------------------------------------------------- */
  function checkMatch() {
    if (!fields.confirm.input.value) return;
    if (fields.confirm.input.value !== fields.password.input.value) {
      setError("confirm", "Passwords do not match.");
    } else {
      setError("confirm", "");
    }
  }

  fields.name.input.addEventListener("input", function () {
    setError("name", "");
    setMessage("");
  });
  fields.email.input.addEventListener("input", function () {
    setError("email", "");
    setMessage("");
  });
  fields.phone.input.addEventListener("input", function () {
    setError("phone", "");
    setMessage("");
  });
  fields.confirm.input.addEventListener("input", function () {
    setError("confirm", "");
    setMessage("");
  });

  fields.email.input.addEventListener("blur", function () {
    const v = fields.email.input.value.trim();
    if (v && !EMAIL_PATTERN.test(v))
      setError("email", "Please enter a valid email address.");
  });

  fields.phone.input.addEventListener("blur", function () {
    const v = fields.phone.input.value.trim();
    if (v && !/^[6-9]\d{9}$/.test(cleanPhone(v))) {
      setError("phone", "Enter a valid 10-digit mobile number.");
    }
  });

  fields.confirm.input.addEventListener("blur", checkMatch);

  terms.addEventListener("change", function () {
    termsError.textContent = "";
  });

  // placeholder terms link: show a short summary instead of jumping
  document.getElementById("termsLink").addEventListener("click", function (e) {
    e.preventDefault();
    setMessage(
      "We only use your details to manage your orders and class bookings, " +
        "and we never share them with third parties.",
      "success",
    );
  });

  /* ----------------------------------------------------------
     CREATE ACCOUNT  <-- replace with your real backend call
     Resolves { ok: true } or { ok: false, field, message }.
  ---------------------------------------------------------- */
  function createAccount(profile, password) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        const accounts = readAccounts();
        const exists = accounts.some(function (a) {
          return a.email === profile.email.toLowerCase();
        });

        if (exists) {
          resolve({
            ok: false,
            field: "email",
            message:
              "An account with this email already exists. Please log in.",
          });
          return;
        }

        let salt;
        try {
          salt = randomSalt();
        } catch (err) {
          resolve({
            ok: false,
            message:
              "Your browser can't create accounts securely. Please use a recent browser.",
          });
          return;
        }

        hashPassword(password, salt)
          .then(function (hash) {
            accounts.push({
              name: profile.name,
              email: profile.email.toLowerCase(),
              phone: profile.phone,
              salt: salt,
              hash: hash,
              createdAt: new Date().toISOString(),
            });

            if (!writeAccounts(accounts)) {
              resolve({
                ok: false,
                message:
                  "Could not save the account. Please allow site storage in your browser and try again.",
              });
            } else {
              resolve({ ok: true });
            }
          })
          .catch(function () {
            resolve({
              ok: false,
              message:
                "Secure account creation needs HTTPS or localhost. Open the site from a web server instead of a plain file.",
            });
          });
      }, 700);
    });
  }

  /* ----------------------------------------------------------
     SUBMIT
  ---------------------------------------------------------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setMessage("");

    const name = fields.name.input.value.trim().replace(/\s+/g, " ");
    const email = fields.email.input.value.trim();
    const phone = cleanPhone(fields.phone.input.value);
    const password = fields.password.input.value;
    const confirm = fields.confirm.input.value;

    let firstBad = null;

    function bad(key, text) {
      setError(key, text);
      if (!firstBad) firstBad = fields[key].input;
    }

    Object.keys(fields).forEach(function (k) {
      setError(k, "");
    });
    termsError.textContent = "";

    if (name.length < 2) bad("name", "Please enter your full name.");
    else if (!/^[A-Za-zÀ-ɏ][A-Za-zÀ-ɏ .'-]*$/.test(name))
      bad("name", "Name can only contain letters, spaces and . ' -");

    if (!email) bad("email", "Please enter your email address.");
    else if (!EMAIL_PATTERN.test(email))
      bad("email", "Please enter a valid email address.");

    if (!phone) bad("phone", "Please enter your mobile number.");
    else if (!/^[6-9]\d{9}$/.test(phone))
      bad("phone", "Enter a valid 10-digit mobile number.");

    const checks = passwordChecks(password);
    if (!password) bad("password", "Please create a password.");
    else if (!(checks.length && checks.case && checks.number)) {
      bad(
        "password",
        "Use 8+ characters with upper and lower case letters and a number.",
      );
    }

    if (!confirm) bad("confirm", "Please confirm your password.");
    else if (confirm !== password) bad("confirm", "Passwords do not match.");

    if (!terms.checked) {
      termsError.textContent =
        "Please accept the Terms & Privacy Policy to continue.";
      if (!firstBad) firstBad = terms;
    }

    if (firstBad) {
      firstBad.focus();
      return;
    }

    btn.disabled = true;
    btn.classList.add("loading");

    createAccount({ name: name, email: email, phone: phone }, password).then(
      function (result) {
        btn.disabled = false;
        btn.classList.remove("loading");

        if (!result.ok) {
          if (result.field) setError(result.field, result.message);
          else setMessage(result.message, "error");
          if (result.field) fields[result.field].input.focus();
          return;
        }

        // show success, hide the form
        document.getElementById("successName").textContent = name;
        document.getElementById("successEmail").textContent = email;

        try {
          localStorage.setItem("rememberedEmail", email); // pre-fills the login page
        } catch (err) {
          /* ignore */
        }

        form.hidden = true;
        orDivider.hidden = true;
        googleBtn.hidden = true;
        success.hidden = false;
        document.querySelector(".welcome-title").textContent = "Welcome!";
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      },
    );
  });

  /* ----------------------------------------------------------
     GOOGLE SIGN-UP (needs a Google Cloud client ID + server)
  ---------------------------------------------------------- */
  googleBtn.addEventListener("click", function () {
    setMessage(
      "Google sign-up isn't set up yet. Please create an account with your email.",
      "error",
    );
    formMsg.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});
