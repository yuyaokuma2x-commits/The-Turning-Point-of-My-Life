/**
 * index.html 導入（ENTERなし／自動進行）
 * 0) 頭イラスト（画像） 3秒
 * 1) 光（円形ワイプ）で intro表示（Scene1：The answer...）＋Loading 3秒
 * 2) 光なしで文字だけ切替（Scene2：Media Design...） 3秒
 * 3) 光（円形ワイプ）で home.html へ
 *
 * 必要DOM:
 * - #scene0（splash）
 * - #intro（テキスト画面）
 * - #flash（光演出）
 * CSS:
 * - html.is-scene2 で Scene2文字表示
 * - #intro の --load を loading表示に使用
 */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;

  const splash = document.getElementById("scene0");
  const intro = document.getElementById("intro");
  const flash = document.getElementById("flash");

  const MS = 5000; // 3秒

  // 安全ガード（要素が無いときは何もしない）
  if (!splash || !intro) return;

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  // loading用CSS変数 --load を 0→1 で更新
  function setLoad(t) {
    intro.style.setProperty("--load", String(t));
  }

  function animateLoading(ms) {
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / ms);
      setLoad(t);
      if (t < 1) requestAnimationFrame(tick);
    }
    setLoad(0);
    requestAnimationFrame(tick);
  }

  // 光（flash）演出：GSAPが無い場合は即切替
  function flashTransition(onMid) {
    if (!window.gsap || !flash) {
      onMid?.();
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      gsap.killTweensOf(flash);

      gsap.set(flash, {
        opacity: 1,
        clipPath: "circle(0% at 50% 50%)",
        webkitClipPath: "circle(0% at 50% 50%)",
      });

      gsap.timeline()
        .to(flash, {
          duration: 1.0,
          clipPath: "circle(150% at 50% 50%)",
          webkitClipPath: "circle(150% at 50% 50%)",
          ease: "power2.out",
        })
        .add(() => onMid?.())
        .to(flash, { duration: 0.25, opacity: 0, ease: "power1.out" })
        .set(flash, {
          clipPath: "circle(0% at 50% 50%)",
          webkitClipPath: "circle(0% at 50% 50%)",
          onComplete: resolve,
        });
    });
  }

  async function run() {
    // 初期：Scene0（頭イラスト）
    splash.hidden = false;
    intro.hidden = true;
    root.classList.remove("is-scene2");
    setLoad(0);

    await wait(MS);

    // 光でScene1へ（テキスト画面表示＋Loading開始）
    await flashTransition(() => {
      splash.hidden = true;
      intro.hidden = false;

      root.classList.remove("is-scene2"); // Scene1文字
      animateLoading(MS);
    });

    // Scene1を3秒
    await wait(MS);

    // 光なしでScene2へ（文字だけ切替）
    root.classList.add("is-scene2");

    // Scene2を3秒
    await wait(MS);

    // 光で home.html へ
    await flashTransition(() => {
      window.location.href = "./home.html";
    });
  }

  run();
});
