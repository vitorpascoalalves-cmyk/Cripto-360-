document.addEventListener("DOMContentLoaded", () => {
  const reveals = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  reveals.forEach((el) => revealObserver.observe(el));

  const navLinks = document.querySelectorAll(".nav-links a:not(.nav-cta)");
  const sections = document.querySelectorAll("section[id]");

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const id = entry.target.getAttribute("id");

        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    {
      threshold: 0.45,
      rootMargin: "-10% 0px -30% 0px"
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  const allAnchorLinks = document.querySelectorAll('a[href^="#"]');

  allAnchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();

      const navHeight = document.querySelector("nav")?.offsetHeight || 68;
      const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 14;

      window.scrollTo({
        top,
        behavior: "smooth"
      });
    });
  });

  const canvas = document.getElementById("tech-canvas");
  const bgGlow1 = document.querySelector(".bg-glow-1");
  const bgGlow2 = document.querySelector(".bg-glow-2");
  const tiltCards = document.querySelectorAll(".tilt-card");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let points = [];
  let mouseX = null;
  let mouseY = null;
  let glowFrame = null;

  const mouse = {
    x: null,
    y: null,
    radius: 150
  };

    const countdownElement = document.getElementById("offerCountdown");
  const countdownTimeElement = document.getElementById("offerCountdownTime");

  if (countdownElement && countdownTimeElement) {
    let remainingSeconds = 30 * 60;

    const renderCountdown = () => {
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;

      countdownTimeElement.innerHTML = `
        <span>${String(minutes).padStart(2, "0")}</span>
        <small>min</small>
        <span class="count-separator">:</span>
        <span>${String(seconds).padStart(2, "0")}</span>
        <small>seg</small>
      `;
    };

    renderCountdown();

    const countdownInterval = setInterval(() => {
      remainingSeconds -= 1;

      if (remainingSeconds <= 0) {
        clearInterval(countdownInterval);
        countdownElement.classList.add("is-expired");

        setTimeout(() => {
          countdownElement.remove();
        }, 450);

        return;
      }

      renderCountdown();
    }, 1000);
  }

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    const totalPoints = Math.max(28, Math.min(70, Math.floor(width / 28)));
    points = Array.from({ length: totalPoints }, createPoint);
  }

  function createPoint() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      size: Math.random() * 1.4 + 0.4
    };
  }

  function drawGlow(x, y, radius, color) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < points.length; i++) {
      const p = points[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      drawGlow(p.x, p.y, 9, "rgba(255,255,255,0.035)");

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.30)";
      ctx.fill();
    }

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          const alpha = (1 - distance / 120) * 0.08;

          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    if (mouse.x !== null && mouse.y !== null) {
      for (let i = 0; i < points.length; i++) {
        const dx = points[i].x - mouse.x;
        const dy = points[i].y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const alpha = (1 - distance / mouse.radius) * 0.12;

          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  function updateGlowParallax() {
    if (window.innerWidth < 769) return;

    if (bgGlow1) {
      const x1 = ((mouseX ?? width / 2) / width - 0.5) * -18;
      const y1 = ((mouseY ?? height / 2) / height - 0.5) * -12;
      bgGlow1.style.transform = `translate3d(${x1}px, ${y1}px, 0)`;
    }

    if (bgGlow2) {
      const x2 = ((mouseX ?? width / 2) / width - 0.5) * 18;
      const y2 = ((mouseY ?? height / 2) / height - 0.5) * 12;
      bgGlow2.style.transform = `translate3d(${x2}px, ${y2}px, 0)`;
    }

    glowFrame = null;
  }

  tiltCards.forEach((card) => {
    let frame = null;

    card.addEventListener("mousemove", (event) => {
      if (window.innerWidth < 769) return;

      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateY = ((x - centerX) / centerX) * 4;
      const rotateX = ((centerY - y) / centerY) * 4;

      if (frame) cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        card.style.setProperty("--tilt-x", `${rotateX}deg`);
        card.style.setProperty("--tilt-y", `${rotateY}deg`);
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      });
    });

    card.addEventListener("mouseleave", () => {
      if (frame) cancelAnimationFrame(frame);

      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--mouse-x", "50%");
      card.style.setProperty("--mouse-y", "50%");
    });
  });

  window.addEventListener("resize", resizeCanvas, { passive: true });

  window.addEventListener(
    "mousemove",
    (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouseX = event.clientX;
      mouseY = event.clientY;

      if (!glowFrame) {
        glowFrame = requestAnimationFrame(updateGlowParallax);
      }
    },
    { passive: true }
  );

  window.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
    mouseX = null;
    mouseY = null;

    if (bgGlow1) bgGlow1.style.transform = "";
    if (bgGlow2) bgGlow2.style.transform = "";
  });

  resizeCanvas();
  animate();



});