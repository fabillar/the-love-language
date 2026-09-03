/* ============================================================
   THE LOVE LANGUAGE — main.js
   ============================================================ */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Preloader ---------------- */
  window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      setTimeout(() => preloader.classList.add("hide"), 350);
    }
  });

  /* ---------------- Footer year ---------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Sticky header ---------------- */
  const header = document.getElementById("siteHeader");
  const onScrollHeader = () => {
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------------- Mobile menu ---------------- */
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  navToggle.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  });
  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    })
  );

  /* ---------------- Scroll reveal ---------------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  /* ---------------- Count-up stats ---------------- */
  const statEls = document.querySelectorAll(".stat-num");
  const animateCount = (el) => {
    const target = parseInt(el.getAttribute("data-count"), 10) || 0;
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (statEls.length) {
    const statIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statEls.forEach((el) => statIO.observe(el));
  }

  /* ---------------- Petal canvas (hero) ---------------- */
  const canvas = document.getElementById("petalCanvas");
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext("2d");
    const hero = document.getElementById("hero");
    let petals = [];
    let running = true;
    let w, h;

    function resize() {
      w = canvas.width = hero.offsetWidth;
      h = canvas.height = hero.offsetHeight;
    }

    function makePetal() {
      return {
        x: Math.random() * w,
        y: -20 - Math.random() * h * 0.4,
        size: 6 + Math.random() * 10,
        speedY: 0.4 + Math.random() * 0.9,
        speedX: Math.random() * 0.6 - 0.3,
        rot: Math.random() * 360,
        rotSpeed: Math.random() * 1.2 - 0.6,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.01 + Math.random() * 0.015,
        opacity: 0.5 + Math.random() * 0.4,
        color: ["242,70,123", "240,164,0", "255,255,255"][Math.floor(Math.random() * 3)],
      };
    }

    function init() {
      resize();
      const count = Math.min(28, Math.floor(w / 45));
      petals = Array.from({ length: count }, makePetal);
    }

    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = `rgba(${p.color},1)`;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.55, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      petals.forEach((p) => {
        p.y += p.speedY;
        p.sway += p.swaySpeed;
        p.x += p.speedX + Math.sin(p.sway) * 0.6;
        p.rot += p.rotSpeed;
        if (p.y > h + 20) {
          Object.assign(p, makePetal(), { y: -20 });
        }
        drawPetal(p);
      });
      requestAnimationFrame(tick);
    }

    init();
    tick();
    window.addEventListener("resize", () => {
      resize();
    });

    const heroIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          running = entry.isIntersecting;
          if (running) requestAnimationFrame(tick);
        });
      },
      { threshold: 0 }
    );
    heroIO.observe(hero);
  }

  /* ---------------- Back to top ---------------- */
  const backToTop = document.getElementById("backToTop");
  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > 700) backToTop.classList.add("show");
      else backToTop.classList.remove("show");
    },
    { passive: true }
  );
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  /* ---------------- Gallery lightbox ---------------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");

  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      const full = item.getAttribute("data-full");
      const caption = item.getAttribute("data-caption");
      lightboxImg.src = full;
      lightboxImg.alt = caption || "";
      lightboxCaption.textContent = caption || "";
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  /* ---------------- Testimonial carousel ---------------- */
  const track = document.getElementById("testimonialTrack");
  const dotsWrap = document.getElementById("testimonialDots");
  if (track && dotsWrap) {
    const slides = Array.from(track.children);
    let current = 0;
    let timer;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.setAttribute("aria-label", `Show testimonial ${i + 1}`);
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function goTo(index) {
      slides[current].classList.remove("active");
      dots[current].classList.remove("active");
      current = (index + slides.length) % slides.length;
      slides[current].classList.add("active");
      dots[current].classList.add("active");
    }

    function startAuto() {
      timer = setInterval(() => goTo(current + 1), 5000);
    }
    function stopAuto() {
      clearInterval(timer);
    }
    if (!prefersReducedMotion) startAuto();

    track.addEventListener("mouseenter", stopAuto);
    track.addEventListener("mouseleave", () => {
      if (!prefersReducedMotion) startAuto();
    });
  }

  /* ---------------- Select floating label helper ---------------- */
  document.querySelectorAll(".field select").forEach((select) => {
    const sync = () => select.classList.toggle("has-value", !!select.value);
    select.addEventListener("change", sync);
    sync();
  });

  /* ---------------- Order form submission ---------------- */
  const form = document.getElementById("orderForm");
  const submitBtn = document.getElementById("submitBtn");
  const formStatus = document.getElementById("formStatus");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      formStatus.textContent = "";
      formStatus.className = "form-status";
      submitBtn.classList.add("loading");

      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          formStatus.textContent = "🌸 Thank you! Your order request has been sent — we'll be in touch shortly.";
          formStatus.classList.add("success");
          form.reset();
          document.querySelectorAll(".field select").forEach((s) => s.classList.remove("has-value"));
        } else {
          throw new Error("Request failed");
        }
      } catch (err) {
        formStatus.textContent =
          "Something went wrong sending your request. Please try again, or reach us directly by phone or email below.";
        formStatus.classList.add("error");
      } finally {
        submitBtn.classList.remove("loading");
      }
    });
  }
})();
