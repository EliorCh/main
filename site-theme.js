/* Shared look for all of Elior's MTA study sites.
   Every site loads it from the shared copy in the "main" repo, in <head>, not deferred:
     <link rel="stylesheet" href="../main/site-theme.css">
     <script src="../main/site-theme.js" data-course="com" data-fam="ind" data-footer="main"></script>
   - data-course: course key (accent color)          - data-fam: which site family's CSS hooks to use
   - data-footer: CSS selector to append the footer into (default: body)                          */
(function () {
  "use strict";
  var me = document.currentScript || document.querySelector('script[src*="site-theme.js"]');
  var cfg = {
    course: (me && me.dataset.course) || "home",
    fam: (me && me.dataset.fam) || "",
    footer: (me && me.dataset.footer) || "",
    topbar: (me && me.dataset.topbar) || "",   /* course title for an optional top bar */
    links: (me && me.dataset.links) || "",     /* "label|url;label|url" shown in that bar */
    hero: (me && me.dataset.hero) || "",       /* on a site's home page: the old header to replace with the shared one */
    heroHide: (me && me.dataset.heroHide) || "",
    heroAt: (me && me.dataset.heroAt) || "",   /* put the new header before this element instead of before the old one */ /* more old home-page bits to hide (e.g. a practice-site banner) */
  };
  /* ---- one place for each course's identity (used by the home hero, menus and top bars) ---- */
  var COURSES = {
    com:    { icon: "🌐", name: "מבוא לתקשורת מחשבים", num: "141418", who: "ד״ר הדר בינסקי · ד״ר מור פרי", sem: "סמסטר ב׳ · שנה ב׳", sum: "comsum", que: "comque" },
    ml:     { icon: "🤖", name: "מבוא ללמידת מכונה ומדעי הנתונים", num: "12112123", who: "ד״ר אלה רבינוביץ · פרופ׳ ראיד סעאבנה", sem: "סמסטר ב׳ · שנה ב׳", sum: "mlsum", que: "mlque" },
    algo:   { icon: "🧭", name: "אלגוריתמים", num: "121120", who: "ד״ר אלעזר גולדנברג · הגב׳ שלומית אריאן", sem: "סמסטר ב׳ · שנה ב׳", sum: "algosum" },
    stats:  { icon: "📊", name: "סטטיסטיקה", num: "142206", who: "ד״ר נילי בק", sem: "סמסטר ב׳ · שנה ב׳", sum: "statsum" },
    os:     { icon: "⚙️", name: "מערכות הפעלה", who: "ד״ר משה סולמי רדליך · בוראק מאדי", sem: "סמסטר א׳ · שנה ג׳", sum: "ossum", que: "osque" },
    db:     { icon: "🗄️", name: "מערכות בסיסי נתונים", who: "פרופ׳ גדעון דרור", sem: "סמסטר א׳ · שנה ג׳", sum: "dbsum" },
    crypto: { icon: "🔐", name: "מבוא לקריפטוגרפיה שימושית", who: "ד״ר יותם אשכנזי", sem: "סמסטר א׳ · שנה ג׳", sum: "cryptosum" },
    comp:   { icon: "♾️", name: "חישוביות", who: "פרופ׳ עופר אריאלי", sem: "סמסטר א׳ · שנה ג׳", sum: "computsum", que: "computque" },
  };
  /* where each site family keeps its side menu, the course name in it, and its default width */
  var FAMS = {
    ind:  { side: ".sidebar", brand: ".sidebar .brand", w: 320 },
    rail: { side: ".rail", brand: ".rail .brand", w: 320 },
    os:   { side: "nav.side", brand: "nav.side .brand", w: 250 },
    db:   { side: "nav.side", brand: "nav.side .brand", w: 270 },
    cr:   { side: "nav.side", brand: "nav.side .brand", w: 290 },
  };
  var root = document.documentElement;
  root.setAttribute("data-course", cfg.course);
  if (cfg.fam) root.setAttribute("data-fam", cfg.fam);

  var KEY = "mta-theme";
  var SVG = function (d) { return '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>"; };
  var THEMES = [
    ["light", SVG('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'), "בהיר"],
    ["sepia", SVG('<path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"/>'), "ספיה"],
    ["dark", SVG('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'), "כהה"],
  ];
  function get() { try { return localStorage.getItem(KEY) || "light"; } catch (e) { return "light"; } }
  function set(t) {
    root.setAttribute("data-mta-theme", t);
    root.setAttribute("data-theme", "light"); /* keeps older built-in dark modes off; dark is handled here */
    try { localStorage.setItem(KEY, t); } catch (e) {}
    var bs = document.querySelectorAll("[data-mta-theme]");
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute("aria-pressed", bs[i].getAttribute("data-mta-theme") === t ? "true" : "false");
  }
  root.setAttribute("data-mta-theme", get());
  root.setAttribute("data-theme", "light");

  function switcher(cls) {
    var w = document.createElement("div");
    w.className = "mta-theme " + cls;
    w.setAttribute("role", "group");
    w.setAttribute("aria-label", "ערכת צבע");
    THEMES.forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("data-mta-theme", t[0]);
      b.title = "ערכת צבע: " + t[2];
      b.innerHTML = t[1] + '<span class="mta-l">' + t[2] + "</span>";
      b.addEventListener("click", function () { set(t[0]); });
      w.appendChild(b);
    });
    return w;
  }

  function footer() {
    if (document.querySelector(".mta-foot")) return;
    var f = document.createElement("footer");
    f.className = "mta-foot";
    f.setAttribute("dir", "rtl");
    f.innerHTML =
      '<p class="mta-by">נבנה על ידי אליאור חן · <a href="mailto:eliorchen@gmail.com" dir="ltr">eliorchen@gmail.com</a></p>' +
      '<p class="mta-note">האתר נועד לעזור בלמידה ונבנה בעזרת בינה מלאכותית, ולכן ייתכנו בו טעויות. כדאי להצליב עם חומרי הקורס. השימוש באתר הוא באחריות הלומד.</p>';
    f.appendChild(switcher("mta-theme-inline"));
    var host = cfg.footer && document.querySelector(cfg.footer);
    (host || document.body).appendChild(f);
  }

  function topbar() {
    if (!cfg.topbar || document.querySelector(".mta-topbar")) return;
    var b = document.createElement("div");
    b.className = "mta-topbar";
    b.setAttribute("dir", "rtl");
    var h = '<span class="mta-tb-t"></span>';
    cfg.links.split(";").filter(Boolean).forEach(function (l) {
      var p = l.split("|");
      h += '<a href="' + p[1] + '">' + p[0] + "</a>";
    });
    b.innerHTML = h;
    b.querySelector(".mta-tb-t").textContent = (C ? C.icon + " " : "") + cfg.topbar;
    document.body.insertBefore(b, document.body.firstChild);
  }

  var C = COURSES[cfg.course], F = FAMS[cfg.fam];

  /* shared header for every site's home page */
  function hero() {
    if (!cfg.hero || !C || document.querySelector(".mta-hero")) return;
    var old = document.querySelector(cfg.hero); if (!old) return;
    var desc = "";
    var p = old.querySelector("p"); if (p) desc = p.innerHTML;
    root.classList.add("mta-home");
    var h = document.createElement("header");
    h.className = "mta-hero"; h.setAttribute("dir", "rtl");
    var btns = "";
    if (C.que) btns += '<a class="mta-hero-btn" href="../' + C.que + '/">📝 לאתר התרגול</a>';
    btns += '<a class="mta-hero-btn ghost" href="../main/">כל הקורסים ←</a>';
    h.innerHTML = '<div class="mta-hero-pill">' + C.sem + " · MTA" + (C.num ? " · " + C.num : "") + "</div>" +
      '<h1><span class="mta-hero-icon" aria-hidden="true">' + C.icon + "</span>" + C.name + "</h1>" +
      '<p class="mta-hero-who">' + C.who + "</p>" + (desc ? '<p class="mta-hero-desc">' + desc + "</p>" : "") +
      '<div class="mta-hero-btns">' + btns + "</div>";
    var at = (cfg.heroAt && document.querySelector(cfg.heroAt)) || old;
    at.parentNode.insertBefore(h, at);
    old.classList.add("mta-hidden");
    if (cfg.heroHide) document.querySelectorAll(cfg.heroHide).forEach(function (e) { e.classList.add("mta-hidden"); });
  }

  /* side menu: course icon, the course name as a clear link home, a link to all courses, and a width handle */
  function sidebar() {
    if (!F) return;
    var side = document.querySelector(F.side); if (!side || side.getAttribute("data-mta")) return;
    side.setAttribute("data-mta", "1");
    var brand = document.querySelector(F.brand);
    if (brand && C) {
      var link = brand.tagName === "A" ? brand : brand.querySelector("a");
      if (!link) { link = document.createElement("a"); link.href = "index.html"; while (brand.firstChild) link.appendChild(brand.firstChild); brand.appendChild(link); }
      link.classList.add("mta-brand");
      link.title = "לדף הבית של הקורס";
      var txt = link.textContent.trim();
      if (txt.indexOf(C.icon) !== 0 && !/^\p{Extended_Pictographic}/u.test(txt)) link.insertAdjacentHTML("afterbegin", '<span class="mta-brand-icon" aria-hidden="true">' + C.icon + "</span>");
    }
    var home = document.createElement("a");
    home.className = "mta-side-home"; home.href = "../main/";
    home.innerHTML = '<span aria-hidden="true">🏠</span> כל הקורסים';
    side.appendChild(home);
    resizer(side);
  }
  var WKEY = "mta-side-w";
  function resizer(side) {
    var w = 0; try { w = +localStorage.getItem(WKEY) || 0; } catch (e) {}
    if (w) root.style.setProperty("--mta-side-w", w + "px");
    var h = document.createElement("div");
    h.className = "mta-resize"; h.title = "גררו כדי לשנות את רוחב התפריט · לחיצה כפולה מחזירה לרוחב הרגיל";
    h.setAttribute("role", "separator"); h.setAttribute("aria-orientation", "vertical"); h.tabIndex = 0;
    document.body.appendChild(h);
    function place() {
      var r = side.getBoundingClientRect();
      var show = r.width > 0 && innerWidth > 900 && getComputedStyle(side).position !== "fixed";
      h.style.display = show ? "" : "none";
      if (show) { h.style.left = (r.left - 4) + "px"; h.style.top = Math.max(r.top, 0) + "px"; h.style.height = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0) + "px"; }
    }
    function setW(x) {
      x = Math.max(200, Math.min(520, Math.round(x)));
      root.style.setProperty("--mta-side-w", x + "px");
      try { localStorage.setItem(WKEY, x); } catch (e) {}
      place();
    }
    h.addEventListener("pointerdown", function (e) {
      e.preventDefault(); h.setPointerCapture(e.pointerId); root.classList.add("mta-resizing");
      var right = side.getBoundingClientRect().right;
      function mv(ev) { setW(right - ev.clientX); }
      function up() { h.removeEventListener("pointermove", mv); h.removeEventListener("pointerup", up); root.classList.remove("mta-resizing"); }
      h.addEventListener("pointermove", mv); h.addEventListener("pointerup", up);
    });
    h.addEventListener("dblclick", function () { root.style.removeProperty("--mta-side-w"); try { localStorage.removeItem(WKEY); } catch (e) {} place(); });
    h.addEventListener("keydown", function (e) {
      var cur = side.getBoundingClientRect().width;
      if (e.key === "ArrowLeft") { setW(cur + 20); e.preventDefault(); }
      if (e.key === "ArrowRight") { setW(cur - 20); e.preventDefault(); }
    });
    addEventListener("resize", place); addEventListener("scroll", place, { passive: true });
    setInterval(place, 800); place();
  }

  function osqBrand() {
    var b = cfg.fam === "osq" && C && document.querySelector("header.top .brand");
    if (b && !b.querySelector(".mta-brand-icon")) b.insertAdjacentHTML("afterbegin", '<span class="mta-brand-icon" aria-hidden="true">' + C.icon + "</span>");
  }

  function boot() {
    osqBrand();
    hero();
    sidebar();
    topbar();
    footer();
    if (!document.querySelector(".mta-theme-float")) document.body.appendChild(switcher("mta-theme-float"));
    set(get());
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  /* single-page apps that re-render their main view: put the footer back if it was wiped */
  window.addEventListener("hashchange", function () { setTimeout(footer, 50); });
  window.MTATheme = { set: set, get: get, footer: footer };
})();
