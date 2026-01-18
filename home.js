/**
 * 導入：Scene0（最初のGIF）→ フラッシュ1回 → home.htmlへ
 * ※intro文字は一切使わない
 */

document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("scene0");
  const flash = document.getElementById("flash");

  // 最初のGIFを見せる時間（ms）
  const MS = 4000; // 例：1.2秒（好みで）

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // フラッシュして、そのまま白を保持して遷移（黒幕防止）
  const flashAndGo = (url) => {
    // GSAPがなければ即遷移（黒幕が気になるならGSAP必須）
    if (!window.gsap || !flash) {
      window.location.href = url;
      return;
    }

    gsap.killTweensOf(flash);

    // 白を確実に最前面で固定
    gsap.set(flash, {
      opacity: 1,
      clipPath: "circle(0% at 50% 50%)",
      webkitClipPath: "circle(0% at 50% 50%)",
    });

    // 1回だけ「広がる」→ 完了した瞬間に遷移
    gsap.to(flash, {
      duration: 1.0,
      clipPath: "circle(150% at 50% 50%)",
      webkitClipPath: "circle(150% at 50% 50%)",
      ease: "power2.out",
      onComplete: () => {
        // 白を消さずに遷移（黒い待ち時間が出にくい）
        window.location.href = url;
      },
    });
  };

  const run = async () => {
    // Scene0だけ表示（introは使わない）
    if (splash) splash.hidden = false;

    await wait(MS);

    // フラッシュ1回→homeへ
    flashAndGo("./home.html");
  };

  run();
});
