document.addEventListener("DOMContentLoaded", () => {

  // ══════════════════════════════════════
  // CANVAS BACKGROUND
  // ══════════════════════════════════════
  const scene = document.getElementById("scene");
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
  scene.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let W, H;
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  resize();
  window.addEventListener("resize", resize, { passive: true });

  // ── Large background crypto symbols ──
  const BG_SYMBOLS = [
    { sym:"₿", x:.10, y:.18, size:200, alpha:.025 },
    { sym:"Ξ", x:.83, y:.10, size:150, alpha:.020 },
    { sym:"₿", x:.66, y:.74, size:260, alpha:.016 },
    { sym:"◎", x:.03, y:.62, size:130, alpha:.018 },
    { sym:"Ξ", x:.91, y:.54, size:110, alpha:.014 },
    { sym:"₿", x:.44, y:.90, size:170, alpha:.013 },
    { sym:"◎", x:.28, y:.04, size:95,  alpha:.016 },
  ];

  const drawBgSymbols = (t) => {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    BG_SYMBOLS.forEach(s => {
      const drift = Math.sin(t * .00035 + s.x * 10) * 7;
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = "#909aa6";
      ctx.font = `100 ${s.size}px 'DM Mono', monospace`;
      ctx.fillText(s.sym, s.x * W, s.y * H + drift);
    });
    ctx.restore();
  };

  // ── Particle dots ──
  class Dot {
    constructor() { this.reset(true); }
    reset(randomY = false) {
      this.x     = Math.random() * W;
      this.y     = randomY ? Math.random() * H : H + 8;
      this.vx    = (Math.random() - .5) * .22;
      this.vy    = -(Math.random() * .28 + .07);
      this.r     = Math.random() * 1.2 + .3;
      this.alpha = Math.random() * .32 + .07;
      this.blue  = Math.random() > .6;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.y < -10) this.reset(false);
      if (this.x < 0)   this.x = W;
      if (this.x > W)   this.x = 0;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.blue
        ? `rgba(180,190,200,${this.alpha})`
        : `rgba(150,158,168,${this.alpha})`;
      ctx.fill();
    }
  }

  const dots = Array.from({ length: 75 }, () => new Dot());

  const drawLines = () => {
    const CONNECT = 110;
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < CONNECT) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(160,168,176,${(1 - d/CONNECT) * .07})`;
          ctx.lineWidth = .6;
          ctx.stroke();
        }
      }
    }
  };

  // ── Orbiting rings ──
  let tick = 0;
  const drawRings = () => {
    const cx = W * .74, cy = H * .24;
    const angle = -0.28;
    const cosA = Math.cos(angle), sinA = Math.sin(angle);

    ctx.save();
    ctx.globalAlpha = .032;
    ctx.strokeStyle = "#8fa8c4";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cx, cy, 210, 72, angle, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx, cy, 138, 47, angle, 0, Math.PI*2); ctx.stroke();
    ctx.restore();

    const a1 = tick * .007;
    const ox = cx + Math.cos(a1)*210*cosA - Math.sin(a1)*72*sinA;
    const oy = cy + Math.cos(a1)*210*sinA + Math.sin(a1)*72*cosA;
    ctx.save();
    ctx.globalAlpha = .5;
    ctx.beginPath(); ctx.arc(ox, oy, 2.5, 0, Math.PI*2);
    ctx.fillStyle = "#c8ccd2";
    ctx.shadowBlur = 12; ctx.shadowColor = "#888e96";
    ctx.fill(); ctx.restore();

    const a2 = -tick * .011 + Math.PI;
    const ix = cx + Math.cos(a2)*138*cosA - Math.sin(a2)*47*sinA;
    const iy = cy + Math.cos(a2)*138*sinA + Math.sin(a2)*47*cosA;
    ctx.save();
    ctx.globalAlpha = .32;
    ctx.beginPath(); ctx.arc(ix, iy, 1.8, 0, Math.PI*2);
    ctx.fillStyle = "#909aa6";
    ctx.shadowBlur = 7; ctx.shadowColor = "#606870";
    ctx.fill(); ctx.restore();
  };

  const drawScanline = () => {
    const y = (tick * .32) % H;
    const g = ctx.createLinearGradient(0, y-50, 0, y+50);
    g.addColorStop(0,  "rgba(255,255,255,0)");
    g.addColorStop(.5, "rgba(255,255,255,.011)");
    g.addColorStop(1,  "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, y-50, W, 100);
  };

  const loop = (t) => {
    ctx.clearRect(0, 0, W, H);
    tick++;
    drawBgSymbols(t);
    drawRings();
    drawScanline();
    drawLines();
    dots.forEach(d => { d.update(); d.draw(); });
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  // ══════════════════════════════════════
  // PAGE INTERACTIONS
  // ══════════════════════════════════════
  const header      = document.querySelector("header");
  const navLinks    = document.querySelectorAll(".nav-links a");
  const sections    = [...document.querySelectorAll("section[id], .split-offer[id]")];
  const faqItems    = document.querySelectorAll(".faq-item");
  const primaryBtns = document.querySelectorAll(".btn-primary");
  const bookCard    = document.querySelector("#heroCard");
  const visualShell = document.querySelector(".visual-shell");
  const hero        = document.querySelector(".hero");

  hero?.classList.add("float-in");
  bookCard?.classList.add("float-in");

  // Reveal on scroll
  const revealEls = document.querySelectorAll(
    ".proof-item,.card,.content-card,.offer-box,.guarantee-box,.faq-item,.final-cta,.section-heading"
  );
  revealEls.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = `${Math.min(i * 55, 260)}ms`;
  });

  const revealObs = new IntersectionObserver((entries, o) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("show");
      o.unobserve(e.target);
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => revealObs.observe(el));

  // Header + nav active
  let backToTop = null;

  const onScroll = () => {
    header?.classList.toggle("scrolled", window.scrollY > 20);
    const pos = window.scrollY + 160;
    let cur = "";
    sections.forEach(s => {
      if (pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight) cur = s.id;
    });
    navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href")?.replace("#","") === cur));
    if (backToTop) backToTop.classList.toggle("show", window.scrollY > 400);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Smooth scroll
  navLinks.forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      if (!id?.startsWith("#")) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.pageYOffset - (header?.offsetHeight || 80) - 12,
        behavior: "smooth"
      });
    });
  });

  // ── FAQ accordion ──
  faqItems.forEach(item => {
    item.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      faqItems.forEach(f => f.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });
  if (faqItems.length > 0) faqItems[0].classList.add("open");

  // Pulse CTA
  if (primaryBtns.length > 0) primaryBtns[0].classList.add("pulse-cta");

  // Back to top
  backToTop = document.createElement("button");
  backToTop.className = "back-to-top";
  backToTop.setAttribute("aria-label", "Voltar ao topo");
  backToTop.innerHTML = "↑";
  document.body.appendChild(backToTop);
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // 3D tilt
  if (bookCard) {
    let raf = null;
    const resetCard = () => {
      bookCard.style.transform = "none";
      bookCard.style.boxShadow = "";
      bookCard.style.removeProperty("--mouse-glow");
    };
    bookCard.addEventListener("mousemove", e => {
      const r  = bookCard.getBoundingClientRect();
      const x  = e.clientX - r.left, y = e.clientY - r.top;
      const rx = ((r.height/2 - y) / (r.height/2)) * 10;
      const ry = ((x - r.width/2)  / (r.width/2))  * 10;
      const sx = (x/r.width)*100, sy = (y/r.height)*100;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        bookCard.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px) scale(1.006)`;
        bookCard.style.boxShadow = "0 36px 90px rgba(0,0,0,.48), 0 0 44px rgba(255,255,255,.06)";
        bookCard.style.setProperty("--mouse-glow",
          `radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,.09), transparent 26%)`);
      });
    });
    bookCard.addEventListener("mouseleave", resetCard);
    resetCard();
  }

  // Parallax visual shell
  if (visualShell) {
    window.addEventListener("mousemove", e => {
      const x = (e.clientX/window.innerWidth  - .5) * 7;
      const y = (e.clientY/window.innerHeight - .5) * 7;
      visualShell.style.transform = `translate3d(${x*.3}px, ${y*.3}px, 0)`;
    }, { passive: true });
  }

});
