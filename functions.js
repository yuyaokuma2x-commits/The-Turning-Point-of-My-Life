/**
 * Desktop1 -> Desktop2（ロードで切替）
 * Desktop2でENTER表示 → ENTERで同一画面のままカーテンが開く（GSAP）
 */
document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;

  // 2〜3秒（CSSの --load-ms と合わせる）
  const LOAD_MS = 2600;

  // 初期はScene1
  root.classList.remove("is-scene2");

  // Scene2へ
  window.setTimeout(() => {
    root.classList.add("is-scene2");

    // aria-hidden更新
    const s1 = document.querySelector(".center__text--s1");
    const s2 = document.querySelector(".center__text--s2");
    if (s1 && s2) {
      s1.setAttribute("aria-hidden", "true");
      s2.setAttribute("aria-hidden", "false");
    }
  }, LOAD_MS);

  // ===== Curtain (GSAP) =====
  const intro = document.getElementById("intro");
  const enterBtn = document.getElementById("enterBtn");
  const curtainL = document.querySelector(".curtain--left");
  const curtainR = document.querySelector(".curtain--right");

  if (!intro || !enterBtn || !curtainL || !curtainR) return;

  const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // GSAP timeline（CodePen寄せ：4秒 / 畳まれる / 回転 / 少し縦に伸びる）
const tl = gsap.timeline({ paused: true });

// 初期状態：閉じてる・見えない
gsap.set([curtainL, curtainR], {
  opacity: 0,
  xPercent: 0,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  filter: "brightness(1.8)",   // 立ち上がりの照明感（任意）
  transformOrigin: "top left"  // いったん仮（個別に上書き）
});

// 内側で畳まれる感じのために origin を内側上に
gsap.set(curtainL, { transformOrigin: "top right" });
gsap.set(curtainR, { transformOrigin: "top left" });

// ① 出現（すぐ）
tl.to([curtainL, curtainR], {
  opacity: 1,
  duration: 0.2,
  ease: "power1.out"
}, 0);

// ② 明るさを落ち着かせる（CodePenの「brightness 180%→100%」っぽさ）
tl.to([curtainL, curtainR], {
  filter: "brightness(1)",
  duration: 2,
  ease: "power1.out"
}, 0);

// ③ 開く（4秒 / ease-in-out / 畳まれる＋回転＋縦に少し伸びる）
tl.to(curtainL, {
  xPercent: -100,
  rotation: 20,
  scaleX: 0,
  scaleY: 2,
  duration: 4,
  ease: "power1.inOut"
}, 0);

tl.to(curtainR, {
  xPercent: 100,
  rotation: -20,
  scaleX: 0,
  scaleY: 2,
  duration: 4,
  ease: "power1.inOut"
}, 0);


  const openCurtain = () => {
    // Desktop2以降だけ反応
    if (!root.classList.contains("is-scene2")) return;

    // 連打防止
    if (intro.classList.contains("is-curtain-open")) return;

    // UIを消す（舞台へ）
    intro.classList.add("is-curtain-active");

    

    if (prefersReduce) {
      // 動きなし：即開く
      gsap.set([curtainL, curtainR], { opacity: 1 });
      gsap.set(curtainL, { xPercent: -110 });
      gsap.set(curtainR, { xPercent: 110 });
      intro.classList.add("is-curtain-open");
      return;
    }

    // アニメ再生
    tl.play(0);

    // 終了フラグ
    tl.eventCallback("onComplete", () => {
      intro.classList.add("is-curtain-open");
       // ★ここを追加：カーテンが開ききったら自動で次へ
  startToHome();
});
  };
  enterBtn.addEventListener("click", openCurtain);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter") openCurtain();
  });
// ====== Auto flow: zoom -> light drop -> switch Home -> carousel loop ======
const home = document.getElementById("home");
const flash = document.getElementById("flash");
const heroWrap = document.querySelector(".stageLayer__hero");
const track = document.getElementById("carouselTrack");

let didStartToHome = false;
let carouselTimer = null;

function startToHome(){
  if (didStartToHome) return;
  didStartToHome = true;

  // prefers-reduced-motion: 即切替（酔い防止）
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce){
    switchToHome();
    startCarouselLoop();
    return;
  }

  // 1) ズーム（カメラが近づく）
  // ※heroWrap が無い場合でも落ちないようにガード
  if (window.gsap && heroWrap){
    gsap.to(heroWrap, {
      duration: 2.4,
      scale: 3.2,          // ここで寄りの強さ調整
      y: 60,               // ちょい下へ寄る（雰囲気）
      ease: "power2.inOut",
      onComplete: () => {
        lightDropToHome();
      }
    });
  } else {
    // GSAP無い/要素無いなら即白へ
    lightDropToHome();
  }
}

function lightDropToHome(){
  if (!window.gsap || !flash){
    switchToHome();
    startCarouselLoop();
    return;
  }

  // 白い板：上から落ちて覆う → 裏でHome切替 → 下へ抜ける
  gsap.set(flash, { opacity: 1, yPercent: -110 });

  gsap.timeline()
    .to(flash, {
      duration: 0.65,
      yPercent: 0,
      ease: "power2.in"
    })
    .add(() => {
      switchToHome();
    })
    .to(flash, {
      duration: 0.7,
      yPercent: 110,
      ease: "power2.out"
    })
    .to(flash, {
      duration: 0.2,
      opacity: 0
    });
}

function switchToHome(){
  // Introを隠してHome表示
  if (intro) intro.hidden = true;
  if (home) home.hidden = false;
}

function startCarouselLoop(){
  if (!track || !window.gsap) return;

  // 1枚分の移動距離 = カード幅 + gap
  // CSS: 260px + 46px
  const STEP = 306;

  // ループ：3〜4秒ごとに1枚分スライド
  if (carouselTimer) clearInterval(carouselTimer);

  carouselTimer = setInterval(() => {
    gsap.to(track, {
      duration: 0.9,
      x: `-=${STEP}`,
      ease: "power2.inOut",
      onComplete: () => {
        // 先頭要素を末尾へ回して位置を戻す（無限）
        track.appendChild(track.children[0]);
        gsap.set(track, { x: 0 });
      }
    });
  }, 3400); // 3.4秒（好みで 3000〜4000）
}

function startCarouselLoop(){
  if (!track || !window.gsap) return;

  const STEP = 306; // 260 + 46

  if (carouselTimer) clearInterval(carouselTimer);

  carouselTimer = setInterval(() => {
    gsap.to(track, {
      duration: 0.9,
      x: `-=${STEP}`,
      ease: "power2.inOut",
      onComplete: () => {
        track.appendChild(track.children[0]);
        gsap.set(track, { x: 0 });
      }
    });
  }, 3400);
}

});
