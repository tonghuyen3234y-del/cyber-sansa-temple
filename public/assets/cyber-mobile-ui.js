/* 赛博산사 mobile chrome: occupancy-in-pill, 목탁 action, one-time hint, bottom-clear var,
 * language/network entry inside settings (mobile). Pure DOM add-on; no game/payment logic touched. */
(function () {
  "use strict";
  var HINT_KEY = "cyber-sansa-hint-seen-v1";
  var HINT_MS = 3600;
  var MOKTAK_KEY = "cyber-sansa-moktak-count";
  var MOBILE_MQ = window.matchMedia("(max-width: 480px)");

  var STR = {
    ko: { moktak: "목탁", merit: "공덕 +1", net: "언어 · 자매 사이트", people: "참배객" },
    "zh-CN": { moktak: "木鱼", merit: "功德 +1", net: "语言 · 姐妹站", people: "在线香客" },
    "zh-TW": { moktak: "木魚", merit: "功德 +1", net: "語言 · 姊妹站", people: "線上香客" },
    en: { moktak: "Moktak", merit: "Merit +1", net: "Language & sister sites", people: "Visitors" },
    ja: { moktak: "木魚", merit: "功徳 +1", net: "言語・姉妹サイト", people: "参拝者" },
    es: { moktak: "Moktak", merit: "Mérito +1", net: "Idioma y sitios hermanos", people: "Visitantes" },
    "pt-BR": { moktak: "Moktak", merit: "Mérito +1", net: "Idioma e sites irmãos", people: "Visitantes" }
  };
  function lang() {
    var l = (window.CyberSansaI18n && window.CyberSansaI18n.lang) || document.documentElement.lang || "ko";
    return STR[l] ? l : (/^zh/i.test(l) ? (/tw|hk|hant/i.test(l) ? "zh-TW" : "zh-CN") : (/^pt/i.test(l) ? "pt-BR" : (STR[l.slice(0, 2)] ? l.slice(0, 2) : "ko")));
  }
  function s(k) { return (STR[lang()] || STR.ko)[k]; }
  function $(sel) { return document.querySelector(sel); }

  /* ---------- bottom clearance var (toasts/sheets sit above the bar) ---------- */
  function updateBottomClear() {
    var bar = $(".game-bottom nav.game-modes") || $(".game-bottom");
    var px = 92;
    if (bar) {
      var r = bar.getBoundingClientRect();
      if (r.height > 0 && r.top > 0) px = Math.max(16, Math.round(window.innerHeight - r.top + 10));
    }
    document.documentElement.style.setProperty("--cs-bottom-clear", px + "px");
  }

  /* ---------- occupancy inside left pill ---------- */
  var PEOPLE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><path d="M15.5 5.2a3 3 0 0 1 0 5.6M17.5 14.4c1.6.7 2.6 2.4 3 4.6"/></svg>';
  function ensureOccupancy() {
    var tools = $(".game-entry-tools");
    var src = document.getElementById("game-presence-count");
    if (!tools || !src) return;
    var occ = document.getElementById("cs-occ");
    if (!occ) {
      occ = document.createElement("button");
      occ.type = "button";
      occ.id = "cs-occ";
      occ.className = "cs-occ";
      occ.innerHTML = PEOPLE_SVG + '<span></span>';
      occ.addEventListener("click", function () { var p = document.getElementById("game-people"); if (p) p.click(); });
      tools.appendChild(occ);
      new MutationObserver(syncOcc).observe(src, { childList: true, characterData: true, subtree: true });
    }
    syncOcc();
  }
  function syncOcc() {
    var occ = document.getElementById("cs-occ"), src = document.getElementById("game-presence-count");
    if (!occ || !src) return;
    var t = (src.textContent || "").trim();
    occ.querySelector("span").textContent = t || "·";
    var people = document.getElementById("game-people");
    occ.setAttribute("aria-label", (people && people.getAttribute("aria-label")) || (s("people") + " " + t));
  }

  /* ---------- 목탁 ---------- */
  var MOKTAK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 15.2c0-4.1 3.8-7.2 8.5-7.2s8.5 3.1 8.5 7.2c0 2-1.7 3.3-3.7 3.3H7.2c-2 0-3.7-1.3-3.7-3.3Z"/><path d="M8 14.6h8"/><path d="M13.6 3.2l4.6 4.6"/><circle cx="19.2" cy="8.8" r="1.3"/></svg>';
  var actx = null;
  function tok(volume) {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      actx = actx || new AC();
      if (actx.state === "suspended") actx.resume();
      var t0 = actx.currentTime + 0.005;
      var out = actx.createGain();
      out.gain.value = 0.55 * volume;
      out.connect(actx.destination);
      [[1180, 0.5, 0.07], [620, 0.9, 0.16], [2350, 0.16, 0.035]].forEach(function (m) {
        var o = actx.createOscillator(), g = actx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(m[0] * 1.04, t0);
        o.frequency.exponentialRampToValueAtTime(m[0], t0 + 0.03);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(m[1], t0 + 0.003);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + m[2] + 0.12);
        o.connect(g); g.connect(out);
        o.start(t0); o.stop(t0 + m[2] + 0.16);
      });
    } catch (e) {}
  }
  function onMoktak(ev) {
    var btn = ev.currentTarget;
    if ($('#audio-toggle[aria-checked="true"]') && $('#effects-toggle[aria-checked="true"]')) {
      tok(Number($("#effects-volume").value) / 100);
    }
    try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) {}
    var n = 0;
    try { n = (parseInt(localStorage.getItem(MOKTAK_KEY) || "0", 10) || 0) + 1; localStorage.setItem(MOKTAK_KEY, String(n)); } catch (e) {}
    btn.classList.remove("is-tok"); void btn.offsetWidth; btn.classList.add("is-tok");
    var pop = document.createElement("span");
    pop.className = "cs-merit-pop";
    pop.textContent = s("merit");
    btn.appendChild(pop);
    setTimeout(function () { pop.remove(); }, 950);
  }
  function ensureMoktak() {
    var src = $("nav.game-modes .liquid-nav-source") || $("nav.game-modes");
    if (!src) return;
    var b = document.getElementById("cs-moktak");
    if (!b) {
      b = document.createElement("button");
      b.type = "button";
      b.id = "cs-moktak";
      b.innerHTML = MOKTAK_SVG + '<span class="cs-moktak-label"></span>';
      b.addEventListener("click", onMoktak);
    }
    var beads = src.querySelector('[data-mode="beads"]');
    if (b.parentNode !== src) {
      if (beads && beads.parentNode === src) src.insertBefore(b, beads); else src.appendChild(b);
    }
    b.querySelector(".cs-moktak-label").textContent = s("moktak");
    b.setAttribute("aria-label", s("moktak"));
    b.title = s("moktak");
  }

  /* ---------- one-time controls hint ---------- */
  var hintDone = false;
  function maybeHint() {
    if (hintDone) return;
    var ready = $(".is-ready");
    if (!ready) return;
    hintDone = true;
    var seen = false;
    try { seen = !!localStorage.getItem(HINT_KEY); } catch (e) {}
    if (seen) return;
    document.body.classList.add("cs-hint-once");
    var end = function () {
      document.body.classList.remove("cs-hint-once");
      try { localStorage.setItem(HINT_KEY, String(Date.now())); } catch (e) {}
      window.removeEventListener("pointerdown", early, true);
    };
    var early = function () { setTimeout(end, 900); };
    window.addEventListener("pointerdown", early, true);
    setTimeout(end, HINT_MS);
  }

  function tick() {
    ensureOccupancy();
    ensureMoktak();
    updateBottomClear();
    maybeHint();
  }
  function start() {
    tick();
    var n = 0;
    var iv = setInterval(function () { tick(); if (++n > 60) clearInterval(iv); }, 500);
    setInterval(tick, 5000);
    window.addEventListener("resize", updateBottomClear);
    window.addEventListener("orientationchange", function () { setTimeout(updateBottomClear, 300); });
    window.addEventListener("cyber-sansa-lang", function () { setTimeout(tick, 0); });
    if (MOBILE_MQ.addEventListener) MOBILE_MQ.addEventListener("change", tick);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
