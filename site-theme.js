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
  /* ---- the side menu of every summary site: chapters first, then reference sheets, then exercises ----
     each group: [title, [[label, href], ...]]; "ex" on a chapter = its exercise page (linked at the end of the chapter) */
  var MENUS = {
    com: [
      ["מבוא", [["0.1 · רשת האינטרנט והשכבות", "00-intro.html"], ["0.2 · השהיות ברשת", "01-delays.html"]]],
      ["שכבת האפליקציה", [["1.1 · סוקטים, לקוח-שרת, P2P", "02-app-sockets.html"], ["1.2 · HTTP", "03-app-http.html"], ["1.3 · Proxy, Cache, Cond. GET", "04-app-proxy-cache.html"], ["1.4 · Cookies", "05-app-cookies.html"], ["1.5 · DNS", "06-app-dns.html"], ["סיכום השכבה", "sum-app.html"]]],
      ["שכבת התעבורה", [["2.1 · UDP ומולטיפלקסינג", "07-trans-udp.html"], ["2.2 · העברה אמינה (RDT)", "08-trans-rdt.html"], ["2.3 · TCP: מבנה", "09-trans-tcp.html"], ["2.4 · בקרת זרימה", "10-trans-flow.html"], ["2.5 · הקמת וסגירת קשר", "11-trans-handshake.html"], ["2.6 · בקרת גודש", "12-trans-congestion.html"], ["סיכום השכבה", "sum-trans.html"]]],
      ["שכבת הרשת", [["3.1 · IP דאטהגרם", "13-net-intro.html"], ["3.2 · פרגמנטציה", "14-net-fragmentation.html"], ["3.3 · כתובות IP", "15-net-ip-addressing.html"], ["3.4 · DHCP", "16-net-dhcp.html"], ["3.5 · NAT, IPv6, ICMP", "17-net-nat-ipv6.html"], ["3.6 · ראוטינג: DV, LS", "18-net-routing.html"], ["3.7 · OSPF, BGP, AS", "19-net-ospf-bgp.html"], ["סיכום השכבה", "sum-net.html"]]],
      ["שכבת הקישור", [["4.1 · Framing ושירותים", "20-link-framing.html"], ["4.2 · ALOHA", "21-link-aloha.html"], ["4.3 · CSMA, Ethernet", "22-link-csma.html"], ["4.4 · MAC, ARP", "23-link-mac-arp.html"], ["4.5 · סוויצ'ים", "24-link-switches.html"], ["4.6 · יום בחיי הודעה", "25-link-day-in-life.html"], ["סיכום השכבה", "sum-link.html"]]],
      ["השכבה הפיזית", [["5.1 · אותות וביטים", "26-phys-signals.html"]]],
      ["אבטחה וקריפטוגרפיה", [["6.1 · איומים", "27-sec-threats.html"], ["6.2 · הצפנה סימטרית ואסימטרית", "28-sec-crypto.html"], ["6.3 · חתימה דיגיטלית", "29-sec-signatures.html"], ["6.4 · SSL/TLS", "30-sec-ssl.html"], ["סיכום הנושא", "sum-sec.html"]]],
      ["חומרי עזר", [["דף נוסחאות", "31-cheatsheet.html"], ["סיכום ומילון מושגים", "33-summary-glossary.html"]]],
      ["תרגול ומבחנים", [["תרגול: IP, השהיות, הצפנה", "32-practice-cidr-delays.html"], ["שאלות ממבחן מועד א׳", "34-exam-moed-a.html"], ["לקראת מועד ב׳", "35-toward-moed-b.html"], ["מבחן לדוגמה", "36-sim-exam.html"]]],
    ],
    ml: [
      ["פייתון ונתונים", [["1 · NumPy", "01-numpy.html"], ["2 · Pandas", "02-pandas.html"]]],
      ["סטטיסטיקה", [["3 · סטטיסטיקה תיאורית", "03-descriptive-stats.html"], ["4 · סטטיסטיקה מסקנתית", "04-inferential-stats.html"]]],
      ["למידה מונחית", [["5 · רגרסיה לינארית", "05-linear-regression.html"], ["6 · רגרסיה מרובה", "06-multiple-regression.html"], ["7 · סיווג בסיסי", "07-classification-basics.html"], ["8 · רשתות נוירונים", "08-neural-networks.html"], ["9 · הערכת סיווג", "09-evaluation.html"]]],
      ["למידה לא מונחית", [["10 · K-Means", "10-clustering-kmeans.html"], ["11 · DBSCAN", "11-clustering-dbscan.html"], ["12 · עיבוד תמונה ולמידה עצמית", "12-image-and-self-supervised.html"]]],
      ["חומרי עזר", [["תבניות קוד למטלות", "13-code-patterns.html"]]],
      ["תרגול ומבחנים", [["מבחן מועד א׳ ופתרונות", "14-moed-a.html"], ["הכנה למועד ב׳", "15-moed-b-prep.html"], ["מבחן לדוגמה", "16-mock-exam.html"]]],
    ],
    algo: [
      ["יסודות", [["1 · מושג האלגוריתם", "01-intro.html"], ["2 · ייצוג מספרים", "02-numbers.html"]]],
      ["גרפים בסיסיים", [["3 · מושגי יסוד", "03-graph-basics.html"], ["4 · מיון טופולוגי", "04-toposort.html"]]],
      ["סריקות", [["5 · DFS", "05-dfs.html"], ["6 · יישומי DFS", "06-dfs-apps.html"], ["7 · BFS", "07-bfs.html"]]],
      ["מסלולים קלים ביותר", [["8 · מסלולים קלים א׳", "08-shortest-paths-1.html"], ["9 · מסלולים קלים ב׳", "09-shortest-paths-2.html"]]],
      ["אופטימיזציה ורשתות", [["10 · עצים פורשים", "10-mst.html"], ["11 · תכנות דינמי", "11-dp.html"], ["12 · זרימה", "12-flow.html"]]],
      ["חומרי עזר", [["דף סיכום", "cheatsheet.html"]]],
    ],
    stats: [
      ["בסיס הסתברותי", [["1 · חזרה: הסתברות ומשתנים מקריים", "01-revision.html"], ["2 · התפלגות נורמלית ומשפט הגבול המרכזי", "02-normal-clt.html"]]],
      ["תהליכים סטוכסטיים", [["3 · שרשרת מרקוב", "03-markov.html"], ["4 · Hidden Markov", "04-hmm.html"]]],
      ["סטטיסטיקה תיאורית", [["5 · סטטיסטיקה תיאורית", "05-descriptive.html"]]],
      ["בדיקת השערות", [["6 · יסודות בדיקת השערות", "06-hypothesis-intro.html"], ["7 · מבחן z", "07-z-test.html"], ["8 · מבחני t ו־F", "08-t-tests.html"], ["9 · מבחנים א־פרמטריים", "09-nonparametric.html"], ["10 · χ²: טיב התאמה ואי־תלות", "10-chi-squared.html"]]],
      ["חומרי עזר", [["דף נוסחאות", "formulas.html"], ["Cheat sheet ומילון מושגים", "cheat-sheet.html"]]],
    ],
    os: [
      ["פרקים", [["1 · מבוא", "intro.html"], ["2 · סביבת העבודה", "workenv.html"], ["3 · תהליכים", "processes.html"], ["4 · תזמון", "scheduling.html"], ["5 · זומבים וסיגנלים", "signals.html"], ["6 · הפניות וצינורות", "redir.html"], ["7 · זיכרון וירטואלי", "vmem.html"]]],
    ],
    db: [
      ["פרקים", [["1 · מודל ER", "er.html", "er-ex.html"], ["2 · מודל היחסים", "relational.html", "relational-ex.html"], ["3 · SQL", "sql.html", "sql-ex.html"], ["4 · תלויות פונקציונליות", "fd.html", "fd-ex.html"], ["5 · תיכון ונרמול", "norm.html", "norm-ex.html"], ["6 · אינדקסים ו־hashing", "indexing.html", "indexing-ex.html"], ["7 · בקרת בו־זמניות", "cc.html", "cc-ex.html"]]],
      ["תרגילים ומטלות", [["תרגיל 1 · מודל ER", "er-ex.html"], ["תרגיל 2 · מודל היחסים", "relational-ex.html"], ["תרגילים 3–4 · SQL", "sql-ex.html"], ["תרגיל 5 · תלויות פונקציונליות", "fd-ex.html"], ["תרגיל 6 · נרמול", "norm-ex.html"], ["תרגיל 7 · אינדקסים", "indexing-ex.html"], ["תרגיל 8 · בקרת בו־זמניות", "cc-ex.html"], ["מטלות תרגול נוספות", "practice.html"]]],
    ],
    crypto: [
      ["פרקים", [["0 · ידע מקדים וסימונים", "ch0.html"], ["1 · מבוא לקריפטוגרפיה", "ch1.html"], ["2 · הצפנה אסימטרית ו־RSA", "ch2.html"], ["3 · לוג דיסקרטי ו־Diffie-Hellman", "ch3.html"], ["4 · הצפנה סימטרית: DES", "ch4.html"]]],
      ["תרגילים ומטלות", [["תרגיל בית 1 · שיטת עבודה ובוחן מסכם", "hw1.html"]]],
    ],
    comp: [
      ["חלק א׳ · שפות ותכנות", [["1 · מבוא, פונקציות חלקיות ועצים", "#ch1"], ["2 · שפת WHILE", "#ch2"], ["3 · מטה-תכנות", "#ch3"], ["4 · השוואה בין שפות", "#ch4"], ["5 · אלגוריתמי קומפילציה", "#ch5"], ["6 · שפת F", "#chF"], ["7 · שפות מלאות-סבירות", "#chRC"]]],
      ["חלק ב׳ · חשיבות והכרעה", [["8 · פונקציות חשיבות ולא חשיבות", "#chComp"], ["9 · בעיות הכרעה: R, RE, coRE", "#chDec"], ["10 · רדוקציות ומשפט רייס", "#chRed"], ["11 · מכונות טיורינג", "#chTM"], ["12 · בעיות הכרעה מפורסמות", "#chFam"]]],
      ["תרגילים ומטלות", [["מטלה 1 · מפת עזרה", "#hw1"], ["מטלה 1 · פתרון מלא", "#hw1sol"]]],
    ],
  };
  /* each family's own side menu and menu buttons, hidden in favour of the shared menu */
  var OLD_MENU = {
    ind: ".sidebar, .menu-toggle, .sidebar-toggle, .side-toggle",
    rail: ".rail, #menu-btn",
    os: "nav.side, .menu-btn, .side-toggle",
    db: "nav.side, .menubtn, .scrim",
    cr: "nav.side, .menu-btn, .side-toggle, #menuBtn, .menu-toggle",
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
    var h = '<span class="mta-tb-t"></span>' + (C ? '<span class="mta-tb-who">' + esc(C.who) + "</span>" : "");
    cfg.links.split(";").filter(Boolean).forEach(function (l) {
      var p = l.split("|");
      h += '<a href="' + p[1] + '">' + p[0] + "</a>";
    });
    b.innerHTML = h;
    b.querySelector(".mta-tb-t").textContent = (C ? C.icon + " " : "") + cfg.topbar;
    document.body.insertBefore(b, document.body.firstChild);
  }

  var C = COURSES[cfg.course];

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

  /* ---- the shared side menu ---- */
  function here() {
    var f = location.pathname.split("/").pop() || "index.html";
    return f;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function currentItem(menu) {
    var f = here(), h = location.hash, best = null;
    menu.forEach(function (g) { g[1].forEach(function (it) {
      if (it[1].charAt(0) === "#") { if (h && (h === it[1] || (document.querySelector(h) && document.querySelector(h).closest && document.querySelector(h).closest("section.chapter") && "#" + document.querySelector(h).closest("section.chapter").id === it[1]))) best = it; }
      else if (it[1] === f) best = it;
    }); });
    return best;
  }
  function secsOf(it) {
    if (!it) return [];
    var scope = it[1].charAt(0) === "#" ? document.querySelector(it[1]) : (document.querySelector("main") || document.body);
    if (!scope) return [];
    var out = [];
    scope.querySelectorAll("h2[id]").forEach(function (h) {
      if (h.closest(".mta-menu, .mta-hero") || h.offsetParent === null && it[1].charAt(0) !== "#") return;
      var t = h.textContent.replace(/\s+/g, " ").trim(); if (t) out.push([t, "#" + h.id]);
    });
    return out;
  }
  function buildMenu() {
    var menu = MENUS[cfg.course];
    if (!menu || !C) return;
    var nav = document.querySelector(".mta-menu");
    if (!nav) {
      nav = document.createElement("nav");
      nav.className = "mta-menu"; nav.setAttribute("dir", "rtl"); nav.setAttribute("aria-label", "תפריט הקורס");
      document.body.appendChild(nav);
      root.classList.add("mta-has-menu");
      var btn = document.createElement("button");
      btn.type = "button"; btn.className = "mta-menu-btn"; btn.innerHTML = "☰ תפריט";
      btn.addEventListener("click", function () { root.classList.toggle("mta-menu-open"); });
      document.body.appendChild(btn);
      var scrim = document.createElement("div"); scrim.className = "mta-scrim";
      scrim.addEventListener("click", function () { root.classList.remove("mta-menu-open"); });
      document.body.appendChild(scrim);
      nav.addEventListener("click", function (e) { if (e.target.closest("a")) root.classList.remove("mta-menu-open"); });
    }
    var cur = currentItem(menu), homeHref = cfg.course === "comp" ? "#home" : "index.html";
    var isHome = !cur && (here() === "index.html" || (cfg.course === "comp" && (!location.hash || location.hash === "#home")));
    var h = '<a class="mta-menu-brand" href="' + homeHref + '" title="לדף הבית של הקורס"><span class="mta-brand-icon" aria-hidden="true">' + C.icon + "</span><span>" + esc(C.name) + "</span></a>" +
      '<div class="mta-menu-who">' + esc(C.who) + "</div>" +
      '<div class="mta-menu-meta">' + esc(C.sem) + " · MTA" + (C.num ? " · " + C.num : "") + "</div>";
    if (C.que) h += '<a class="mta-menu-que" href="../' + C.que + '/">📝 לאתר התרגול</a>';
    h += '<a class="mta-menu-item' + (isHome ? " on" : "") + '" href="' + homeHref + '">דף הבית של הקורס</a>';
    menu.forEach(function (g) {
      h += '<div class="mta-menu-group">' + esc(g[0]) + "</div>";
      g[1].forEach(function (it) {
        var on = it === cur;
        h += '<a class="mta-menu-item' + (on ? " on" : "") + '" href="' + it[1] + '">' + esc(it[0]) + "</a>";
        if (on) {
          var ss = secsOf(it);
          if (ss.length) h += '<div class="mta-menu-secs">' + ss.map(function (s) { return '<a href="' + s[1] + '">' + esc(s[0]) + "</a>"; }).join("") + "</div>";
        }
      });
    });
    h += '<a class="mta-side-home" href="../main/"><span aria-hidden="true">🏠</span> כל הקורסים</a>';
    nav.innerHTML = h;
    var on = nav.querySelector(".mta-menu-item.on");
    if (on && on.offsetTop > nav.clientHeight - 80) nav.scrollTop = on.offsetTop - 120;
    exerciseLink(cur);
  }
  /* at the end of a chapter page: a pointer to that chapter's exercise */
  function exerciseLink(cur) {
    if (!cur || !cur[2] || document.querySelector(".mta-ex-link")) return;
    var host = document.querySelector("main .wrap") || document.querySelector("main"); if (!host) return;
    var a = document.createElement("a");
    a.className = "mta-ex-link"; a.href = cur[2];
    a.innerHTML = "<b>✎ סיימת את הפרק?</b> <span>לתרגיל של הפרק, עם שאלות ופתרונות ←</span>";
    host.appendChild(a);
  }
  function hideOld() {
    var sel = OLD_MENU[cfg.fam]; if (!sel || !MENUS[cfg.course]) return;
    document.querySelectorAll(sel).forEach(function (e) { e.classList.add("mta-old-menu"); });
  }
  var WKEY = "mta-side-w";
  function resizer() {
    var nav = document.querySelector(".mta-menu"); if (!nav || document.querySelector(".mta-resize")) return;
    var w = 0; try { w = +localStorage.getItem(WKEY) || 0; } catch (e) {}
    if (w) root.style.setProperty("--mta-side-w", w + "px");
    var h = document.createElement("div");
    h.className = "mta-resize"; h.title = "גררו כדי לשנות את רוחב התפריט · לחיצה כפולה מחזירה לרוחב הרגיל";
    h.setAttribute("role", "separator"); h.setAttribute("aria-orientation", "vertical"); h.tabIndex = 0;
    document.body.appendChild(h);
    function setW(x) {
      x = Math.max(220, Math.min(520, Math.round(x)));
      root.style.setProperty("--mta-side-w", x + "px");
      try { localStorage.setItem(WKEY, x); } catch (e) {}
    }
    h.addEventListener("pointerdown", function (e) {
      e.preventDefault(); h.setPointerCapture(e.pointerId); root.classList.add("mta-resizing");
      function mv(ev) { setW(innerWidth - ev.clientX); }
      function up() { h.removeEventListener("pointermove", mv); h.removeEventListener("pointerup", up); root.classList.remove("mta-resizing"); }
      h.addEventListener("pointermove", mv); h.addEventListener("pointerup", up);
    });
    h.addEventListener("dblclick", function () { root.style.removeProperty("--mta-side-w"); try { localStorage.removeItem(WKEY); } catch (e) {} });
    h.addEventListener("keydown", function (e) {
      var cur = nav.getBoundingClientRect().width;
      if (e.key === "ArrowLeft") { setW(cur + 20); e.preventDefault(); }
      if (e.key === "ArrowRight") { setW(cur - 20); e.preventDefault(); }
    });
  }
  /* code and answer boxes grow with their content instead of scrolling inside */
  function autoGrow(ta) {
    if (ta.closest(".mta-fb") || ta.offsetParent === null) return;
    ta.style.overflowY = "hidden"; ta.style.height = "auto"; ta.style.height = (ta.scrollHeight + 4) + "px";
  }
  function growAll() { document.querySelectorAll("textarea").forEach(autoGrow); }
  document.addEventListener("input", function (e) { if (e.target.tagName === "TEXTAREA") autoGrow(e.target); });
  ["change", "click"].forEach(function (ev) { document.addEventListener(ev, function () { setTimeout(growAll, 60); }); });

  function osqBrand() {
    var b = cfg.fam === "osq" && C && document.querySelector("header.top .brand");
    if (b && !b.querySelector(".mta-brand-icon")) b.insertAdjacentHTML("afterbegin", '<span class="mta-brand-icon" aria-hidden="true">' + C.icon + "</span>");
  }

  function boot() {
    osqBrand();
    hero();
    hideOld();
    buildMenu();
    resizer();
    topbar();
    footer();
    if (!document.querySelector(".mta-theme-float")) document.body.appendChild(switcher("mta-theme-float"));
    set(get());
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  /* single-page apps that re-render their main view: put the footer back if it was wiped */
  window.addEventListener("hashchange", function () { setTimeout(function () { footer(); buildMenu(); growAll(); }, 60); });
  window.addEventListener("load", function () { growAll(); setTimeout(growAll, 800); });
  window.MTATheme = { set: set, get: get, footer: footer };
})();
