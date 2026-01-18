/* EP4.js は EP2.js と同一でOK */
(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const kvMedia = document.getElementById("kvMedia");
  const overlayMedia = document.getElementById("overlayMedia");

  const tryPlay = async (el) => {
    if (!el) return;
    if (el.tagName.toLowerCase() !== "video") return;
    try { await el.play(); } catch {}
  };

  tryPlay(kvMedia);

  const noise = document.querySelector(".noise");
  const overlayNoise = document.querySelector(".overlay-noise");

  const pulseNoise = (el, durationMs = 140) => {
    if (!el || prefersReduced) return;
    el.style.opacity = "0.16";
    window.setTimeout(() => (el.style.opacity = "0"), durationMs);
  };

  if (!prefersReduced) {
    window.setInterval(() => {
      if (Math.random() < 0.12) pulseNoise(noise, 120 + Math.random() * 120);
    }, 1800);
  }

  const leftPerf = document.querySelector(".film-perforation--left");
  const rightPerf = document.querySelector(".film-perforation--right");
  const marker = document.getElementById("perforation-end-marker");

  const getPerforationCutoff = () => {
    if (!marker) return 900;
    const rect = marker.getBoundingClientRect();
    return window.scrollY + rect.top;
  };

  let perforationCutoff = getPerforationCutoff();
  window.addEventListener("resize", () => { perforationCutoff = getPerforationCutoff(); });

  const onScrollPerf = () => {
    if (!leftPerf || !rightPerf) return;
    const active = window.scrollY < perforationCutoff;

    const t = active ? window.scrollY * 0.25 : perforationCutoff * 0.25;
    leftPerf.style.transform = `translateY(${t}px)`;
    rightPerf.style.transform = `translateY(${t * 0.85}px)`;

    leftPerf.style.opacity = active ? "0.75" : "0.45";
    rightPerf.style.opacity = active ? "0.75" : "0.45";
  };

  window.addEventListener("scroll", onScrollPerf, { passive: true });
  onScrollPerf();

  const overlay = document.getElementById("overlay");
  let screeningLocked = false;

  const showOverlay = async () => {
    if (!overlay || screeningLocked) return;
    screeningLocked = true;

    overlay.classList.remove("is-out");
    overlay.classList.add("is-on", "is-in");
    overlay.setAttribute("aria-hidden", "false");

    pulseNoise(overlayNoise, 140);
    await tryPlay(overlayMedia);

    const duration = 3000 + Math.random() * 600;

    window.setTimeout(() => {
      overlay.classList.remove("is-in");
      overlay.classList.add("is-out");
      pulseNoise(overlayNoise, 160);

      window.setTimeout(() => {
        overlay.classList.remove("is-on", "is-out");
        overlay.setAttribute("aria-hidden", "true");

        if (overlayMedia && overlayMedia.tagName.toLowerCase() === "video") {
          overlayMedia.pause();
          overlayMedia.currentTime = 0;
        }

        screeningLocked = false;
      }, 240);
    }, duration);
  };

  const triggerEl =
    document.querySelector("[data-screen-trigger]") ||
    document.querySelector(".js-screen-trigger");

  if (triggerEl) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            io.disconnect();
            showOverlay();
          }
        });
      },
      { threshold: 0.8 }
    );
    io.observe(triggerEl);
  }
})();
