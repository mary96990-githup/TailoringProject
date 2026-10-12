/* ============================================================
   MARY'S TAILORING STUDIO - login.js
   Used by Login.html

   IMPORTANT: this site has no server, so the login below is a
   DEMO. Real login must be checked on a server (never in the
   browser). Replace the function  authenticate()  with a call
   to your backend (e.g. fetch("/api/login", ...)) when you
   have one.
============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  /* ----------------------------------------------------------
     SETTINGS - edit these
  ---------------------------------------------------------- */
  const REDIRECT_AFTER_LOGIN = "index.html";

  // DEMO account used only until you connect a real backend.
  // Set DEMO_MODE to false to disable it completely.
  const DEMO_MODE = true;
  const DEMO_EMAIL = "demo@marystailoring.com";
  const DEMO_PASSWORD = "Mary@123";

  const MAX_ATTEMPTS = 5; // wrong tries before a short lock
  const LOCK_SECONDS = 30;

  /* ----------------------------------------------------------
     ELEMENTS
  ---------------------------------------------------------- */
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const emailWrap = document.getElementById("emailWrap");
  const passwordWrap = document.getElementById("passwordWrap");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");
  const capsWarning = document.getElementById("capsWarning");
  const remember = document.getElementById("remember");
  const formMsg = document.getElementById("formMsg");
  const loginBtn = document.getElementById("loginBtn");
  const toggleBtn = document.getElementById("togglePassword");

  const forgotLink = document.getElementById("forgotLink");
  const forgotForm = document.getElementById("forgotForm");
  const resetEmail = document.getElementById("resetEmail");
  const resetError = document.getElementById("resetError");
  const backToLogin = document.getElementById("backToLogin");
  const googleBtn = document.getElementById("googleBtn");
  const orDivider = document.querySelector(".or-divider");

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let failedAttempts = 0;
  let lockTimer = null;

  /* ----------------------------------------------------------
     SAFE STORAGE HELPERS (storage can be blocked)
  ---------------------------------------------------------- */
  function store(area, key, value) {
    try {
      if (value === null) area.removeItem(key);
      else area.setItem(key, value);
    } catch (err) {
      /* ignore */
    }
  }

  function read(area, key) {
    try {
      return area.getItem(key);
    } catch (err) {
      return null;
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
     REMEMBER ME: pre-fill the saved email
     (only the email is stored, never the password)
  ---------------------------------------------------------- */
  const savedEmail = read(localStorage, "rememberedEmail");
  if (savedEmail) {
    emailInput.value = savedEmail;
    remember.checked = true;
  }

  /* ----------------------------------------------------------
     SHOW / HIDE PASSWORD
  ---------------------------------------------------------- */
  toggleBtn.addEventListener("click", function () {
    const show = passwordInput.type === "password";
    passwordInput.type = show ? "text" : "password";
    toggleBtn.innerHTML = show
      ? '<i class="bi bi-eye-slash"></i>'
      : '<i class="bi bi-eye"></i>';
    toggleBtn.setAttribute(
      "aria-label",
      show ? "Hide password" : "Show password",
    );
    passwordInput.focus();
  });

  /* ----------------------------------------------------------
     CAPS LOCK WARNING
  ---------------------------------------------------------- */
  function checkCaps(e) {
    if (!e.getModifierState) return;
    capsWarning.hidden = !e.getModifierState("CapsLock");
  }

  passwordInput.addEventListener("keydown", checkCaps);
  passwordInput.addEventListener("keyup", checkCaps);
  passwordInput.addEventListener("blur", function () {
    capsWarning.hidden = true;
  });

  /* ----------------------------------------------------------
     VALIDATION HELPERS
  ---------------------------------------------------------- */
  function setFieldError(wrap, errorEl, text) {
    errorEl.textContent = text || "";
    wrap.classList.toggle("invalid", !!text);
  }

  function setMessage(el, text, type) {
    el.textContent = text || "";
    el.className = "form-msg" + (type ? " " + type : "");
  }

  emailInput.addEventListener("input", function () {
    setFieldError(emailWrap, emailError, "");
    setMessage(formMsg, "");
  });

  passwordInput.addEventListener("input", function () {
    setFieldError(passwordWrap, passwordError, "");
    setMessage(formMsg, "");
  });

  emailInput.addEventListener("blur", function () {
    const v = emailInput.value.trim();
    if (v && !EMAIL_PATTERN.test(v)) {
      setFieldError(
        emailWrap,
        emailError,
        "Please enter a valid email address.",
      );
    }
  });

  /* ----------------------------------------------------------
     AUTHENTICATE  <-- replace this with your real backend call
     Must return a Promise that resolves { ok: true, name } or
     { ok: false, message }.
  ---------------------------------------------------------- */
  function toHex(buffer) {
    return Array.prototype.map
      .call(new Uint8Array(buffer), function (b) {
        return b.toString(16).padStart(2, "0");
      })
      .join("");
  }

  // accounts created on signup.html (demo only, stored in this browser)
  function checkStoredAccount(email, password) {
    let accounts = [];
    try {
      accounts = JSON.parse(localStorage.getItem("maryAccounts") || "[]");
    } catch (err) {
      return Promise.resolve(null);
    }

    const account = (Array.isArray(accounts) ? accounts : []).find(
      function (a) {
        return a.email === email.toLowerCase();
      },
    );

    if (!account || !window.crypto || !window.crypto.subtle) {
      return Promise.resolve(null);
    }

    const data = new TextEncoder().encode(account.salt + ":" + password);
    return window.crypto.subtle.digest("SHA-256", data).then(function (buf) {
      return toHex(buf) === account.hash ? account : null;
    });
  }

  function authenticate(email, password) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        checkStoredAccount(email, password)
          .catch(function () {
            return null;
          })
          .then(function (account) {
            if (account) {
              resolve({ ok: true, name: account.name });
            } else if (
              DEMO_MODE &&
              email.toLowerCase() === DEMO_EMAIL &&
              password === DEMO_PASSWORD
            ) {
              resolve({ ok: true, name: "Demo User" });
            } else {
              resolve({
                ok: false,
                message: "Incorrect email or password.",
              });
            }
          });
      }, 700);
    });
  }

  /* ----------------------------------------------------------
     LOADING STATE + LOCKOUT
  ---------------------------------------------------------- */
  function setLoading(on) {
    loginBtn.disabled = on;
    loginBtn.classList.toggle("loading", on);
  }

  function lockForm() {
    let remaining = LOCK_SECONDS;
    loginBtn.disabled = true;

    function tick() {
      setMessage(
        formMsg,
        "Too many failed attempts. Please try again in " + remaining + "s.",
        "error",
      );
      remaining -= 1;

      if (remaining < 0) {
        clearInterval(lockTimer);
        lockTimer = null;
        failedAttempts = 0;
        loginBtn.disabled = false;
        setMessage(formMsg, "");
      }
    }

    tick();
    lockTimer = setInterval(tick, 1000);
  }

  /* ----------------------------------------------------------
     LOGIN SUBMIT
  ---------------------------------------------------------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (lockTimer) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let valid = true;

    setMessage(formMsg, "");

    if (!email) {
      setFieldError(emailWrap, emailError, "Please enter your email address.");
      valid = false;
    } else if (!EMAIL_PATTERN.test(email)) {
      setFieldError(
        emailWrap,
        emailError,
        "Please enter a valid email address.",
      );
      valid = false;
    } else {
      setFieldError(emailWrap, emailError, "");
    }

    if (!password) {
      setFieldError(passwordWrap, passwordError, "Please enter your password.");
      valid = false;
    } else if (password.length < 6) {
      setFieldError(
        passwordWrap,
        passwordError,
        "Password must be at least 6 characters.",
      );
      valid = false;
    } else {
      setFieldError(passwordWrap, passwordError, "");
    }

    if (!valid) {
      (emailWrap.classList.contains("invalid")
        ? emailInput
        : passwordInput
      ).focus();
      return;
    }

    setLoading(true);

    authenticate(email, password)
      .then(function (result) {
        if (result.ok) {
          // remember email (never the password)
          store(
            localStorage,
            "rememberedEmail",
            remember.checked ? email : null,
          );

          // simple "logged in" flag for the rest of the site
          const area = remember.checked ? localStorage : sessionStorage;
          store(
            area,
            "maryUser",
            JSON.stringify({ email: email, name: result.name }),
          );

          setMessage(formMsg, "Login successful! Redirecting...", "success");

          const next = new URLSearchParams(window.location.search).get("next");
          const safeNext =
            next && /^[\w\-./]+\.html$/.test(next)
              ? next
              : REDIRECT_AFTER_LOGIN;

          setTimeout(function () {
            window.location.href = safeNext;
          }, 900);
        } else {
          setLoading(false);
          failedAttempts += 1;
          passwordInput.value = "";
          passwordInput.focus();

          if (failedAttempts >= MAX_ATTEMPTS) {
            lockForm();
          } else {
            setMessage(formMsg, result.message, "error");
          }
        }
      })
      .catch(function () {
        setLoading(false);
        setMessage(
          formMsg,
          "Something went wrong. Please check your connection and try again.",
          "error",
        );
      });
  });

  /* ----------------------------------------------------------
     FORGOT PASSWORD (swap the form for a reset form)
  ---------------------------------------------------------- */
  // reset-result message element (created once)
  const resetMsg = document.createElement("p");
  resetMsg.className = "form-msg";
  resetMsg.setAttribute("role", "status");
  forgotForm.insertBefore(resetMsg, backToLogin);

  function showForgot(show) {
    form.hidden = show;
    forgotForm.hidden = !show;
    orDivider.hidden = show;
    googleBtn.hidden = show;

    if (show) {
      resetEmail.value = emailInput.value.trim();
      setFieldError(resetEmail.parentElement, resetError, "");
      setMessage(resetMsg, "");
      resetEmail.focus();
    } else {
      emailInput.focus();
    }
  }

  forgotLink.addEventListener("click", function (e) {
    e.preventDefault();
    showForgot(true);
  });

  backToLogin.addEventListener("click", function () {
    showForgot(false);
  });

  forgotForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = resetEmail.value.trim();
    setMessage(resetMsg, "");

    if (!EMAIL_PATTERN.test(email)) {
      setFieldError(
        resetEmail.parentElement,
        resetError,
        "Please enter a valid email address.",
      );
      resetEmail.focus();
      return;
    }

    setFieldError(resetEmail.parentElement, resetError, "");

    // Real reset emails need a server. Until then, tell the visitor to
    // contact the studio on WhatsApp, which does work today.
    setMessage(
      resetMsg,
      "Password reset by email needs the studio's server, which isn't connected yet. " +
        "Please WhatsApp us on +91 9999829846 and we'll help you right away.",
      "success",
    );
  });

  resetEmail.addEventListener("input", function () {
    setFieldError(resetEmail.parentElement, resetError, "");
  });

  /* ----------------------------------------------------------
     GOOGLE SIGN-IN
     Real "Continue with Google" needs a Google Cloud client ID
     and a server, so it is not connected yet.
  ---------------------------------------------------------- */
  googleBtn.addEventListener("click", function () {
    setMessage(
      formMsg,
      "Google sign-in isn't set up yet. Please log in with your email and password.",
      "error",
    );
    formMsg.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  /* ----------------------------------------------------------
     ALREADY LOGGED IN? show a friendly note
  ---------------------------------------------------------- */
  const existing =
    read(sessionStorage, "maryUser") || read(localStorage, "maryUser");
  if (existing) {
    try {
      const user = JSON.parse(existing);
      if (user && user.email) {
        setMessage(
          formMsg,
          "You're already logged in as " + user.email + ".",
          "success",
        );
      }
    } catch (err) {
      /* ignore bad data */
    }
  }
});
