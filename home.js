/**
 * index.html 導入（ENTERなし／自動進行）
 * 0) 頭イラスト 3秒
 * 1) 光で intro表示（Scene1）＋Loading 3秒
 * 2) 光なしで文字だけ切替（Scene2） 3秒
 * 3) 光で home.html へ
 */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;

  const splash = document.getElementById("scene0");
  const intro = document.getElementById("intro");
  const flash = document.getElementById("flash");

  const MS = 3000;

  function setLoad(t) {
    if (!intro) return;
    intro.style.setProperty("--load", String(t));
  }


  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

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
    // 初期：1枚目
    if (splash) splash.hidden = false;
    if (intro) intro.hidden = true;
    root.classList.remove("is-scene2");

    await wait(MS);

await flashTransition(() => {
  if (splash) splash.hidden = true;
  if (intro) intro.hidden = false;
  root.classList.remove("is-scene2");
});


    // 2枚目を3秒
    await wait(MS);

    // 光なしで3枚目（文字だけ切替）
    root.classList.add("is-scene2");

    // 3枚目を3秒
    await wait(MS);

    // 光で home.html へ
    await flashTransition(() => {
      window.location.href = "./home.html";
    });
  }

  run();
});
