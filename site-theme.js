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
    b.querySelector(".mta-tb-t").textContent = cfg.topbar;
    document.body.insertBefore(b, document.body.firstChild);
  }

  function boot() {
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
