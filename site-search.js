/* Site-wide free-text search for every summary site (loaded by site-theme.js).
   Index: the site's own searchidx.js when it has one (built from the rendered pages);
   otherwise the pages listed in the site's menu are fetched and indexed in the browser on first use. */
(function () {
  if (window.MTASearch) return;
  var SITE = window.MTA_SITE || { pages: [{ href: "index.html", label: "" }], name: document.title };
  var FIN = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ", "־": " ", "_": " ", "-": " ", "–": " ", "—": " ", "״": '"', "׳": "'" };
  function norm(s) { var o = ""; s = String(s).toLowerCase(); for (var i = 0; i < s.length; i++) { var c = s[i]; o += FIN[c] || c; } return o; } // same length
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  var IDX = null, loading = null;
  var DROP = "script,style,svg,textarea,select,button,noscript,nav,.mta-menu,.mta-menu-btn,.mta-expand,.mta-theme,.mta-theme-float,.mta-topbar,.mta-footer,.mta-srch-ov,.mta-srch-fab,.mta-old-menu,.mta-ex-link";
  var ANCH = "section[id],article[id],h1[id],h2[id],h3[id],h4[id]";
  function segments(doc, page, title) {
    var root = doc.querySelector("main") || doc.body; if (!root) return [];
    root.querySelectorAll(DROP).forEach(function (e) { e.remove(); });
    var A = Array.prototype.slice.call(root.querySelectorAll(ANCH)), out = [];
    function text(r) {
      var f = r.cloneContents();
      f.querySelectorAll("p,li,td,th,div,h1,h2,h3,h4,pre,tr,br,code,summary,dd,dt").forEach(function (e) { e.append(" "); });
      return (f.textContent || "").replace(/\s+/g, " ").trim();
    }
    if (!A.length) { var r0 = doc.createRange(); r0.selectNodeContents(root); var x0 = text(r0); if (x0) out.push({ p: page, pt: title, id: "", t: title, x: x0.slice(0, 20000) }); return out; }
    var r1 = doc.createRange(); r1.setStart(root, 0); r1.setEndBefore(A[0]); var x1 = text(r1);
    if (x1.length > 30) out.push({ p: page, pt: title, id: "", t: "פתיחה", x: x1.slice(0, 20000) });
    A.forEach(function (a, i) {
      var r = doc.createRange(); r.setStartBefore(a);
      if (A[i + 1]) r.setEndBefore(A[i + 1]); else r.setEnd(root, root.childNodes.length);
      var x = text(r);
      var h = /^H[1-4]$/.test(a.tagName) ? a.textContent : ((a.querySelector("h1,h2,h3,h4") || {}).textContent || "");
      h = h.replace(/\s+/g, " ").trim().slice(0, 110);
      if (x.length < 15 && !h) return;
      out.push({ p: page, pt: title, id: a.id, t: h || title, x: x.slice(0, 20000) });
    });
    return out;
  }
  function crawl() {
    var seen = {}, list = [];
    SITE.pages.forEach(function (pg) { var f = (pg.href || "").split("#")[0] || "index.html"; if (!seen[f]) { seen[f] = 1; list.push({ f: f, label: pg.label }); } });
    return Promise.all(list.map(function (pg) {
      return fetch(pg.f, { cache: "no-cache" }).then(function (r) { return r.ok ? r.text() : ""; }).then(function (html) {
        if (!html) return [];
        var doc = new DOMParser().parseFromString(html, "text/html");
        var t = (doc.querySelector("title") || {}).textContent || pg.label || pg.f;
        t = t.replace(/\s*[—|-]\s*(מדריך פתרון|סיכום).*$/, "").trim() || pg.label || pg.f;
        return segments(doc, pg.f, t);
      }).catch(function () { return []; });
    })).then(function (parts) { return [].concat.apply([], parts); });
  }
  function prebuilt() {
    return new Promise(function (res) {
      var v = (document.querySelector("meta[name=sidx]") || {}).content;
      var s = document.createElement("script"); s.src = "searchidx.js" + (v ? "?v=" + v : "");
      s.onload = function () { res(window.SIDX && window.SIDX.length ? window.SIDX : null); };
      s.onerror = function () { res(null); };
      document.head.appendChild(s);
    });
  }
  function load() {
    if (IDX) return Promise.resolve(IDX); if (loading) return loading;
    loading = prebuilt().then(function (pre) { return pre || crawl(); }).then(function (L) {
      IDX = L.map(function (e) { e.nt = norm(e.t || ""); e.nx = norm(e.x || ""); return e; }); return IDX;
    });
    return loading;
  }
  function terms(q) { return norm(q).split(/\s+/).filter(function (t) { return t.length > 0; }); }
  var WL = /[a-z0-9א-ת]/;
  function count(h, t) { var n = 0, i = 0; while ((i = h.indexOf(t, i)) >= 0) { var b = h[i - 1], a = h[i + t.length]; n += (!b || !WL.test(b)) && (!a || !WL.test(a)) ? 3 : 1; i += t.length; if (n > 80) break; } return n; }
  function search(q) {
    var T = terms(q); if (!T.length) return []; var ph = norm(q.trim()), out = [];
    IDX.forEach(function (e) {
      var sc = 0, ok = true;
      for (var k = 0; k < T.length; k++) { var a = count(e.nt, T[k]), b = count(e.nx, T[k]); if (!a && !b) { ok = false; break; } sc += a * 12 + Math.min(b, 10); }
      if (!ok) return; if (T.length > 1 && (e.nx.indexOf(ph) >= 0 || e.nt.indexOf(ph) >= 0)) sc += 15; if (e.k === "q") sc += 2;
      out.push([sc, e]);
    });
    return out.sort(function (a, b) { return b[0] - a[0]; }).slice(0, 60).map(function (x) { return x[1]; });
  }
  function mark(x, nx, T, cls) {
    var hit = []; for (var i = 0; i < x.length; i++) hit.push(false);
    T.forEach(function (t) { var i = 0; while ((i = nx.indexOf(t, i)) >= 0) { for (var k = i; k < i + t.length; k++) hit[k] = true; i += t.length; } });
    var o = "", on = false, open = cls ? '<mark class="' + cls + '">' : "<mark>";
    for (var j = 0; j < x.length; j++) { if (hit[j] && !on) { o += open; on = true; } if (!hit[j] && on) { o += "</mark>"; on = false; } o += esc(x[j]); }
    return o + (on ? "</mark>" : "");
  }
  function snippet(e, q) {
    var T = terms(q), at = -1; T.forEach(function (t) { var i = e.nx.indexOf(t); if (i >= 0 && (at < 0 || i < at)) at = i; });
    var s = Math.max(0, at - 70); return (s > 0 ? "…" : "") + mark(e.x.slice(s, s + 220), e.nx.slice(s, s + 220), T) + (s + 220 < e.x.length ? "…" : "");
  }
  /* ---- UI ---- */
  var ICON = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  var ov = document.createElement("div"); ov.className = "mta-srch-ov"; ov.hidden = true; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-label", "חיפוש באתר"); ov.dir = "rtl";
  ov.innerHTML = '<div class="mta-srch-box"><div class="mta-srch-top">' + ICON + '<input type="search" class="mta-srch-in" placeholder="חיפוש בכל העמודים של ' + esc(SITE.name || "האתר") + '…" autocomplete="off" spellcheck="false"><button type="button" class="mta-srch-x" aria-label="סגור">✕</button></div><div class="mta-srch-meta"></div><ol class="mta-srch-res"></ol></div>';
  document.body.appendChild(ov);
  var fab = document.createElement("button"); fab.type = "button"; fab.className = "mta-srch-fab"; fab.title = "חיפוש באתר (Ctrl+K)"; fab.setAttribute("aria-label", "חיפוש באתר"); fab.innerHTML = ICON;
  document.body.appendChild(fab);
  var inp = ov.querySelector(".mta-srch-in"), res = ov.querySelector(".mta-srch-res"), meta = ov.querySelector(".mta-srch-meta"), sel = 0, tmr;
  function open() {
    ov.hidden = false; document.documentElement.classList.add("mta-srch-open"); document.documentElement.classList.remove("mta-menu-open"); inp.focus(); inp.select();
    meta.textContent = "טוען את תוכן האתר…";
    load().then(function () {
      var np = {}; IDX.forEach(function (e) { np[e.p] = 1; });
      meta.textContent = inp.value ? "" : IDX.length + " קטעים ב־" + Object.keys(np).length + " עמודים. החיפוש מוצא מילים בדיוק כמו שהן כתובות באתר — אם אין תוצאה, נסה את המונח באנגלית או בעברית (למשל Dijkstra / דייקסטרה). בכמה מילים — כולן צריכות להופיע.";
      if (inp.value) run();
    }).catch(function () { meta.textContent = "לא הצלחתי לטעון את תוכן האתר."; });
  }
  function close() { ov.hidden = true; document.documentElement.classList.remove("mta-srch-open"); }
  function href(e) { var q = encodeURIComponent(inp.value.trim()); return e.p + "?q=" + q + (e.id ? "#" + e.id : ""); }
  function run() {
    if (!IDX) return; var q = inp.value, cur = search(q); sel = 0; var T = terms(q);
    meta.textContent = q.trim() ? (cur.length ? (cur.length >= 60 ? "60+" : cur.length) + " תוצאות" : "אין תוצאות. החיפוש מוצא מילים בדיוק כמו שהן כתובות באתר — נסה את המונח בשפה השנייה (עברית או אנגלית), כתיב אחר, או רק חלק מהמילה.") : "";
    res.innerHTML = cur.map(function (e, i) {
      return '<li class="' + (i === 0 ? "on" : "") + '"><a href="' + href(e) + '"><span class="mta-srch-where">' + esc(e.pt) + (e.t && e.t !== e.pt ? " › " + mark(e.t, e.nt, T) : "") + '</span><span class="mta-srch-snip">' + snippet(e, q) + "</span></a></li>";
    }).join("");
  }
  function move(d) { var L = res.querySelectorAll("li"); if (!L.length) return; L[sel].classList.remove("on"); sel = (sel + d + L.length) % L.length; L[sel].classList.add("on"); L[sel].scrollIntoView({ block: "nearest" }); }
  inp.addEventListener("input", function () { clearTimeout(tmr); tmr = setTimeout(run, 120); });
  inp.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); } else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Enter") { var a = res.querySelectorAll("li a")[sel]; if (a) { e.preventDefault(); a.click(); } }
    else if (e.key === "Escape") close();
  });
  fab.addEventListener("click", open);
  ov.addEventListener("click", function (e) { if (e.target === ov || e.target.closest(".mta-srch-x")) close(); });
  res.addEventListener("click", function (e) {
    var a = e.target.closest("a"); if (!a) return;
    var u = new URL(a.href, location.href);
    if (u.pathname === location.pathname) { e.preventDefault(); close(); history.replaceState(null, "", u.search + u.hash); highlight(u.searchParams.get("q"), decodeURIComponent(u.hash.slice(1))); }
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (ov.hidden) open(); else close(); }
    else if (e.key === "/" && ov.hidden && !/input|textarea|select/i.test((document.activeElement || {}).tagName || "") && !(document.activeElement || {}).isContentEditable) { e.preventDefault(); open(); }
  });
  document.addEventListener("click", function (e) { if (e.target.closest(".mta-menu-search, .mta-open-search")) open(); });
  /* ---- on arrival: mark the words in the target part and scroll to it ---- */
  function highlight(q, id) {
    if (!q) return;
    document.querySelectorAll("mark.mta-srch-hit").forEach(function (m) { m.replaceWith(document.createTextNode(m.textContent)); });
    var tgt = id && document.getElementById(id);
    var root = (tgt && (/^H[1-4]$/.test(tgt.tagName) ? (tgt.closest("section,article") || tgt.parentElement) : tgt)) || document.querySelector("main") || document.body;
    var T = terms(q), ph = norm(q.trim()); if (T.length > 1 && norm(root.textContent).indexOf(ph) >= 0) T = [ph];
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (x) { return x.parentElement.closest("script,style,textarea,svg," + DROP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
    var nodes = [], n = 0; while (tw.nextNode()) nodes.push(tw.currentNode);
    nodes.forEach(function (nd) {
      if (n > 400) return; var x = nd.nodeValue, nx = norm(x);
      if (!T.some(function (t) { return nx.indexOf(t) >= 0; })) return;
      var span = document.createElement("span"); span.innerHTML = mark(x, nx, T, "mta-srch-hit");
      nd.replaceWith.apply(nd, Array.prototype.slice.call(span.childNodes)); n++;
    });
    var first = root.querySelector("mark.mta-srch-hit"), go = first || tgt;
    if (go) { var d = go.closest("details"); if (d) d.open = true; go.scrollIntoView({ block: "center" }); }
  }
  var q0 = new URLSearchParams(location.search).get("q");
  if (q0) setTimeout(function () { highlight(q0, decodeURIComponent(location.hash.slice(1))); }, 1200);
  window.MTASearch = { open: open, search: function (q) { return load().then(function () { return search(q); }); } };
})();
