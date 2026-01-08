/**
 * index.html 用 + 共通ページ遷移
 * - Scene1: "The answer..." + Loading
 * - Scene2: タイトル表示 + Enter出現
 * - Enter: カーテン → フラッシュ → home表示 → カルーセル自動
 */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;

  // ===== Scene switch (Desktop1 -> Desktop2) =====
  const LOAD_MS = 2600;
  root.classList.remove("is-scene2");

  const loadingEl = document.querySelector(".intro__loading");
function animateLoadingBar(ms){
  if(!loadingEl) return;
  const start = performance.now();
  function tick(now){
    const t = Math.min(1, (now - start) / ms);
    loadingEl.style.setProperty("--load", t);
    if(t < 1) requestAnimationFrame(tick);
  }
  loadingEl.style.setProperty("--load", 0);
  requestAnimationFrame(tick);
}
animateLoadingBar(LOAD_MS);


  // ===== Theater elements =====
  const intro = document.getElementById("intro");
  const enterBtn = document.getElementById("enterBtn");
  const curtainL = document.querySelector(".curtain--left");
  const curtainR = document.querySelector(".curtain--right");

  const home = document.getElementById("home");
  const flash = document.getElementById("flash");
  const heroWrap = document.querySelector(".stageLayer__hero");
  const track = document.getElementById("carouselTrack");

  // このページにintroが無ければここで終了（top.html等）
  if (!intro || !enterBtn) return;

  const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasCurtain = !!(window.gsap && curtainL && curtainR);

  // ===== Enter Lock/Unlock (B案の本体) =====
  function lockEnter() {
    // 見た目（CSSで効かせる用）
    intro.classList.add("is-enter-locked");

    // 操作を止める（buttonでもaでも効く）
    enterBtn.setAttribute("aria-disabled", "true");
    enterBtn.setAttribute("tabindex", "-1");

    // もし <button> なら disabled も効かせる
    if ("disabled" in enterBtn) enterBtn.disabled = true;
  }

  function unlockEnter() {
    intro.classList.remove("is-enter-locked");

    enterBtn.setAttribute("aria-disabled", "false");
    enterBtn.removeAttribute("tabindex");

    if ("disabled" in enterBtn) enterBtn.disabled = false;
  }

  // 初期はロック（scene2になるまで）
  lockEnter();

  // scene2へ移行したタイミングで解除
  window.setTimeout(() => {
    root.classList.add("is-scene2");

    // テキスト切替（あなたの元コード踏襲）
    const s1 = document.querySelector(".centerText__s1");
    const s2 = document.querySelector(".centerText__s2");
    if (s1 && s2) {
      s1.setAttribute("aria-hidden", "true");
      s2.setAttribute("aria-hidden", "false");
    }

    unlockEnter();
  }, LOAD_MS);

  // ===== Home表示 + カルーセル =====
  let didStartToHome = false;
  let carouselTimer = null;

  function switchToHome() {
    if (intro) intro.hidden = true;
    if (home) home.hidden = false;
     // ★ 追加：Enterを消す（フラッシュ後は不要）
  if (enterBtn) {
    enterBtn.hidden = true;                 // これだけでもOK
    enterBtn.style.display = "none";        // 念のため確実に消す
  }

  if (home) home.hidden = false;
  }

  function startCarouselLoop() {
    if (!track || !window.gsap) return;
    if (track.children.length < 2) return;

    const STEP = 276; // 260 + gap16（あなたの元コード）
    if (carouselTimer) clearInterval(carouselTimer);

    carouselTimer = setInterval(() => {
      gsap.to(track, {
        duration: 0.9,
        x: `-=${STEP}`,
        ease: "power2.inOut",
        onComplete: () => {
          track.appendChild(track.children[0]);
          gsap.set(track, { x: 0 });
        },
      });
    }, 3400);
  }

  function lightDropToHome() {
    // GSAP or flash が無い場合は即home
    if (!window.gsap || !flash) {
      switchToHome();
      startCarouselLoop();
      return;
    }

    gsap.set(flash, {
      opacity: 1,
      clipPath: "circle(0% at 50% 50%)",
      webkitClipPath: "circle(0% at 50% 50%)",
    });

    gsap.timeline()
      .to(flash, {
        duration: 1.5,
        clipPath: "circle(150% at 50% 50%)",
        webkitClipPath: "circle(150% at 50% 50%)",
        ease: "power2.out",
      })
      .add(() => {
        switchToHome();
        startCarouselLoop();
      })
      .to(flash, { duration: 0.25, opacity: 0, ease: "power1.out" })
      .set(flash, {
        clipPath: "circle(0% at 50% 50%)",
        webkitClipPath: "circle(0% at 50% 50%)",
      });
  }

  function startToHome() {
    if (didStartToHome) return;
    didStartToHome = true;

    if (prefersReduce || !window.gsap) {
      switchToHome();
      startCarouselLoop();
      return;
    }

    if (heroWrap) {
      gsap.to(heroWrap, {
        duration: 2.4,
        scale: 1.15,
        y: 40,
        ease: "power2.inOut",
        onComplete: () => lightDropToHome(),
      });
    } else {
      lightDropToHome();
    }
  }


function openCurtain() {
  // ★B案：scene2になるまで一切反応させない
  if (!root.classList.contains("is-scene2")) return;

  // ★Enterを押した瞬間に消す（即時・確実）
  if (enterBtn) {
    enterBtn.disabled = true;
    enterBtn.setAttribute("aria-disabled", "true");
    enterBtn.style.pointerEvents = "none";
    enterBtn.style.opacity = "0";
    enterBtn.style.display = "none";
  }

  // UIを消す
  intro.classList.add("is-curtain-active");

  // カーテン無し/GSAP無し/軽減設定なら即home
  if (!hasCurtain || prefersReduce) {
    startToHome();
    return;
  }

  const tl = gsap.timeline();
  gsap.set([curtainL, curtainR], { opacity: 0, xPercent: 0, rotation: 0, scaleX: 1, scaleY: 1 });
  gsap.set(curtainL, { transformOrigin: "top right" });
  gsap.set(curtainR, { transformOrigin: "top left" });

  tl.to([curtainL, curtainR], { opacity: 1, duration: 0.2, ease: "power1.out" }, 0);
  tl.to(curtainL, { xPercent: -110, rotation: 12, scaleX: 0.2, duration: 2.8, ease: "power2.inOut" }, 0.2);
  tl.to(curtainR, { xPercent: 110, rotation: -12, scaleX: 0.2, duration: 2.8, ease: "power2.inOut" }, 0.2);

  tl.eventCallback("onComplete", () => {
    intro.classList.add("is-curtain-open");
    startToHome();
  });
}


  // ★クリックはロック解除後だけ（aria-disabledも見る）
  enterBtn.addEventListener("click", (e) => {
    if (enterBtn.getAttribute("aria-disabled") === "true") {
      e.preventDefault();
      return;
    }
    openCurtain();
  });

  // ★Enterキーも同様
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    if (enterBtn.getAttribute("aria-disabled") === "true") return;
    openCurtain();
  });
});




/* ===== 共通：ページ遷移（同一オリジンのみ） ===== */
(() => {
  const wipe = document.getElementById("pageWipe");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function leaveTo(url) {
    if (!wipe || !window.gsap || prefersReduced) {
      window.location.href = url;
      return;
    }
    gsap.killTweensOf(wipe);
    gsap.set(wipe, { opacity: 0, transform: "scale(.2)" });
    gsap.to(wipe, {
      duration: 0.5,
      opacity: 1,
      scale: 1.6,
      ease: "power2.inOut",
      onComplete: () => (window.location.href = url),
    });
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    // 新規タブや外部は通常動作
    if (a.target === "_blank") return;

    const url = new URL(a.href, window.location.href);
    if (url.origin !== window.location.origin) return;

    // 同一ページ内アンカーは通常（top.html内で使う）
    if (url.pathname === window.location.pathname && url.hash) return;

    // 修飾キー押下は通常
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();
    leaveTo(url.href);
  });
})();
