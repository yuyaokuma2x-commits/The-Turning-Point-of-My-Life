(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ===== KV autoplay（videoの場合） =====
  const kvMedia = document.getElementById("kvMedia");
  const overlayMedia = document.getElementById("overlayMedia");

  const tryPlay = async (el) => {
    if (!el) return;
    // imgの場合は play しない
    if (el.tagName.toLowerCase() !== "video") return;

    try {
      await el.play();
    } catch {
      // 自動再生がブロックされた場合は無視（ユーザー操作で再生される）
    }
  };

  tryPlay(kvMedia);

  // ===== ランダムノイズ（先生FB：時々だけ） =====
  const noise = document.querySelector(".noise");
  const overlayNoise = document.querySelector(".overlay-noise");

  const pulseNoise = (el, durationMs = 140) => {
    if (!el || prefersReduced) return;
    el.style.opacity = "0.16";
    window.setTimeout(() => (el.style.opacity = "0"), durationMs);
  };

  // 低頻度で“たまに”発生（体感：数十秒に数回）
  if (!prefersReduced) {
    window.setInterval(() => {
      const r = Math.random();
      if (r < 0.12) pulseNoise(noise, 120 + Math.random() * 120);
    }, 1800);
  }

  // ===== フィルム穴：前半だけスクロール連動（境界は後で調整） =====
  const leftPerf = document.querySelector(".film-perforation--left");
  const rightPerf = document.querySelector(".film-perforation--right");
  const marker = document.getElementById("perforation-end-marker");

  const getPerforationCutoff = () => {
    if (!marker) return 900; // ざっくり保険
    const rect = marker.getBoundingClientRect();
    const cutoff = window.scrollY + rect.top; // markerの位置まで
    return cutoff;
  };

  let perforationCutoff = getPerforationCutoff();
  window.addEventListener("resize", () => {
    perforationCutoff = getPerforationCutoff();
  });

  const onScrollPerf = () => {
    if (!leftPerf || !rightPerf) return;

    // cutoff未満のときだけ “微差” で動かす
    const active = window.scrollY < perforationCutoff;

    const t = active ? window.scrollY * 0.25 : perforationCutoff * 0.25;
    leftPerf.style.transform = `translateY(${t}px)`;
    rightPerf.style.transform = `translateY(${t * 0.85}px)`;

    leftPerf.style.opacity = active ? "0.75" : "0.45";
    rightPerf.style.opacity = active ? "0.75" : "0.45";
  };

  window.addEventListener("scroll", onScrollPerf, { passive: true });
  onScrollPerf();

  // ===== フルスクリーン上映（1〜2秒 / 自動 / contain / ビネット / 入りC + 戻りB） =====
  const overlay = document.getElementById("overlay");
  let screeningLocked = false;

  const showOverlay = async () => {
    if (!overlay || screeningLocked) return;
    screeningLocked = true;

    overlay.classList.remove("is-out");
    overlay.classList.add("is-on", "is-in");
    overlay.setAttribute("aria-hidden", "false");

    // overlayのノイズを“出現瞬間”だけ少し出す
    pulseNoise(overlayNoise, 140);

    // 再生（videoのみ）
    await tryPlay(overlayMedia);

    // 上映尺：1〜2秒の範囲（固定でもOK）
    const duration = 3000 + Math.random() * 600; // 1.2〜1.8s

    window.setTimeout(() => {
      // 戻りB：消える直前に一瞬フリッカー（ノイズも同調）
      overlay.classList.remove("is-in");
      overlay.classList.add("is-out");
      pulseNoise(overlayNoise, 160);

      window.setTimeout(() => {
        overlay.classList.remove("is-on", "is-out");
        overlay.setAttribute("aria-hidden", "true");

        // videoの場合は止めて頭に戻す（次の上映に備える）
        if (overlayMedia && overlayMedia.tagName.toLowerCase() === "video") {
          overlayMedia.pause();
          overlayMedia.currentTime = 0;
        }

        screeningLocked = false;
      }, 240);
    }, duration);
  };

  // IntersectionObserver：トリガー文に到達したら1回だけ上映
  const triggerEl = document.querySelector("[data-screen-trigger]");
  if (triggerEl) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            io.disconnect(); // 章1回だけ
            showOverlay();
          }
        });
      },
      {
        root: null,
        threshold: 0.8, // 文がしっかり見えたタイミングで
      }
    );
    io.observe(triggerEl);
  }
})();
