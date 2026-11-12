/* "Report a problem" and "Ask the lecturer" for the quiz-style practice sites.
   Adds two small buttons under every practice/browse question card and builds the
   message from what the student actually sees (question, options, solution).
   Usage (after site-theme.js):
     <script src="../main/site-feedback.js" data-repo="comque" data-course="מבוא לתקשורת מחשבים"></script> */
(function () {
  "use strict";
  var me = document.currentScript || document.querySelector('script[src*="site-feedback.js"]');
  var REPO = (me && me.dataset.repo) || "";
  var COURSE = (me && me.dataset.course) || document.title;
  var ISSUES = "https://github.com/EliorCh/" + REPO + "/issues/new";
  var CARD = ".practice-question";
  var SKIP = "#view-exam, #view-results";

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* visible text of an element; rendered math is replaced by its LaTeX source */
  function txt(el) {
    if (!el) return "";
    var c = el.cloneNode(true);
    c.querySelectorAll(".katex").forEach(function (k) {
      var a = k.querySelector('annotation[encoding="application/x-tex"]');
      k.replaceWith(document.createTextNode(a ? " " + a.textContent + " " : k.textContent));
    });
    c.querySelectorAll(".mta-fb-bar, .mta-fb, button, textarea, [data-nocopy]").forEach(function (b) { b.remove(); });
    c.querySelectorAll("br").forEach(function (b) { b.replaceWith("\n"); });
    c.querySelectorAll("p,div,li,tr,pre,h1,h2,h3,h4,h5,h6,table,.exp-label").forEach(function (b) { b.append("\n"); });
    c.querySelectorAll("td,th").forEach(function (b) { b.append(" | "); });
    return c.textContent.split("\n").map(function (l) { return l.replace(/[ \t\u00a0]+/g, " ").trim(); })
      .join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  function idOf(card) { return card.getAttribute("data-qid") || card.getAttribute("data-oid") || "?"; }
  function kindOf(card) { return card.hasAttribute("data-oid") ? "שאלה פתוחה" : "שאלה"; }

  function parts(card) {
    var meta = txt(card.querySelector(".practice-q-meta, .question-meta, .browse-summary-source"));
    var q = txt(card.querySelector(".question-text, .browse-summary-text"));
    var opts = [];
    card.querySelectorAll(".option-item").forEach(function (o) { opts.push(txt(o).replace(/\s*\n\s*/g, " ")); });
    var sol = [];
    card.querySelectorAll(".explanation").forEach(function (x) { var s = txt(x); if (s) sol.push(s); });
    sol = sol.join("\n\n");
    return { meta: meta, q: q, opts: opts, sol: sol };
  }
  /* a card may carry a readable name, e.g. data-label="מבחן 2024/25 מועד א · שאלה 2" */
  function name(card) { return card.getAttribute("data-label") || (kindOf(card) + " " + idOf(card)); }
  function head(card) { return name(card) + " · " + COURSE; }
  function qText(p) {
    var out = [];
    if (p.meta) out.push(p.meta);
    if (p.q) out.push(p.q);
    if (p.opts.length) out.push(p.opts.join("\n"));
    return out.join("\n\n");
  }

  function panel(kind) {
    if (kind === "report")
      return '<div class="mta-fb" data-k="report"><h4>דיווח על בעיה בשאלה</h4>' +
        '<label>מה לא בסדר? (טעות בפתרון, נתון חסר, ניסוח לא ברור...)<textarea rows="3" class="mta-fbt"></textarea></label>' +
        '<div class="mta-fb-row"><a class="mta-fb-btn" data-fb="gh" target="_blank" rel="noopener" href="#">שליחה דרך GitHub</a>' +
        '<button type="button" class="mta-fb-btn ghost" data-fb="copy">העתקת הדיווח</button>' +
        '<button type="button" class="mta-fb-btn ghost" data-fb="close">סגירה</button></div>' +
        '<p class="mta-fb-hint">השליחה פותחת דיווח חדש (issue) ב־GitHub, עם פרטי השאלה כבר בפנים, ואני מקבל עליו התראה. צריך חשבון GitHub. אין חשבון? אפשר להעתיק ולשלוח בכל דרך אחרת.</p>' +
        '<div class="mta-fb-msg"></div></div>';
    var name = ""; try { name = localStorage.getItem("mta-name") || ""; } catch (e) {}
    return '<div class="mta-fb" data-k="ask"><h4>הודעה למרצה על השאלה</h4>' +
      '<label>מה תרצה לשאול?<textarea rows="3" class="mta-fbt" placeholder="למשל: לא הבנתי למה התשובה היא ב׳ ולא ג׳"></textarea></label>' +
      '<label>השם שלך (לחתימה)<input class="mta-fbname" value="' + esc(name) + '"></label>' +
      '<label class="mta-cb"><input type="checkbox" class="mta-fbsol"> לצרף את הפתרון שמופיע באתר</label>' +
      '<div class="mta-fb-prev" dir="rtl"></div>' +
      '<div class="mta-fb-row"><button type="button" class="mta-fb-btn" data-fb="copy">העתקת ההודעה</button>' +
      '<a class="mta-fb-btn ghost" data-fb="mail" href="#">פתיחה בתוכנת המייל</a>' +
      '<button type="button" class="mta-fb-btn ghost" data-fb="close">סגירה</button></div>' +
      '<p class="mta-fb-hint">ההודעה מוכנה עם נוסח השאלה. מעתיקים ושולחים למרצה במייל או בפורום הקורס.</p>' +
      '<div class="mta-fb-msg"></div></div>';
  }

  function message(card) {
    var box = card.querySelector(".mta-fb"), k = box.getAttribute("data-k");
    var t = box.querySelector(".mta-fbt").value.trim(), p = parts(card);
    if (k === "report")
      return "דיווח על " + head(card) + "\n\nהבעיה:\n" + (t || "(לא נכתב תיאור)") + "\n\nקישור: " + location.href.split("#")[0] + (card.id ? "#" + card.id : "") +
        "\n\nהשאלה:\n" + qText(p);
    var sol = box.querySelector(".mta-fbsol").checked, name = box.querySelector(".mta-fbname").value.trim();
    var L = ["שלום,", "", "בהכנה למבחן בקורס " + COURSE + " עברתי על " + name(card) + ", ויש לי שאלה לגביה.", "",
      t || "(כאן תכתוב את השאלה שלך)", "", "לנוחותך, זה נוסח השאלה:", "──────────", qText(p), "──────────", ""];
    if (sol && p.sol) L.push("הפתרון שמופיע באתר:", p.sol, "");
    L.push("תודה רבה,", name);
    return L.join("\n").trim();
  }

  function preview(card) {
    var pv = card.querySelector(".mta-fb-prev"); if (!pv) return;
    pv.innerHTML = message(card).split("\n").map(function (l) { return l.trim() ? '<div dir="auto">' + esc(l) + "</div>" : "<div>&nbsp;</div>"; }).join("");
  }

  function copy(text, msg) {
    function done(ok) {
      msg.innerHTML = ok ? "הועתק ✓" : 'ההעתקה האוטומטית נחסמה. אפשר לסמן ולהעתיק מכאן:<textarea rows="6" readonly></textarea>';
      if (!ok) { var ta = msg.querySelector("textarea"); ta.value = text; ta.select(); }
    }
    function legacy() {
      try { var ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select(); var ok = document.execCommand("copy"); ta.remove(); done(ok); } catch (e) { done(false); }
    }
    try { navigator.clipboard.writeText(text).then(function () { done(true); }, legacy); } catch (e) { legacy(); }
  }

  function decorate(card) {
    if (card.querySelector(":scope > .mta-fb-bar, :scope .mta-fb-bar") || card.closest(SKIP)) return;
    var bar = document.createElement("div");
    bar.className = "mta-fb-bar";
    bar.innerHTML = '<button type="button" data-fbopen="report" title="דיווח על טעות או בעיה בשאלה">⚑ דיווח על השאלה</button>' +
      '<button type="button" data-fbopen="ask" title="הכנת הודעה למרצה עם נוסח השאלה">✉ שאלה למרצה</button><div class="mta-fb-slot"></div>';
    var host = card.querySelector(".browse-details") || card;
    host.appendChild(bar);
  }
  function scan() { document.querySelectorAll(CARD).forEach(decorate); }

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-fbopen],[data-fb]");
    if (!b) return;
    var card = b.closest(CARD); if (!card) return;
    var slot = card.querySelector(".mta-fb-slot");
    if (b.hasAttribute("data-fbopen")) {
      e.preventDefault(); e.stopPropagation();
      var k = b.getAttribute("data-fbopen"), cur = slot.querySelector(".mta-fb");
      if (cur && cur.getAttribute("data-k") === k) { slot.innerHTML = ""; return; }
      slot.innerHTML = panel(k);
      if (k === "ask") preview(card);
      slot.querySelector(".mta-fbt").focus();
      return;
    }
    var act = b.getAttribute("data-fb");
    if (act === "close") { e.preventDefault(); slot.innerHTML = ""; return; }
    if (act === "copy") { e.preventDefault(); copy(message(card), card.querySelector(".mta-fb-msg")); return; }
    if (act === "gh") {
      var t = card.querySelector(".mta-fbt").value.trim(), body = message(card), full = body;
      while (encodeURIComponent(body).length > 6500) body = body.slice(0, Math.floor(body.length * 0.85));
      if (body !== full) body += "\n…(קוצר)";
      b.href = ISSUES + "?title=" + encodeURIComponent("[" + idOf(card) + "] " + (t.split("\n")[0].slice(0, 70) || "בעיה בשאלה")) + "&body=" + encodeURIComponent(body);
      return; /* let the link open */
    }
    if (act === "mail") {
      b.href = "mailto:?subject=" + encodeURIComponent("שאלה לגבי " + head(card)) + "&body=" + encodeURIComponent(message(card));
    }
  }, true);
  /* keep clicks inside the panel from toggling a <details> card or answering the question */
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".mta-fb-bar") && e.target.closest("summary")) e.preventDefault();
  });
  document.addEventListener("input", function (e) {
    var card = e.target.closest && e.target.closest(CARD);
    if (!card || !e.target.closest(".mta-fb[data-k='ask']")) return;
    if (e.target.classList.contains("mta-fbname")) { try { localStorage.setItem("mta-name", e.target.value); } catch (_) {} }
    preview(card);
  });
  document.addEventListener("change", function (e) {
    var card = e.target.closest && e.target.closest(CARD);
    if (card && e.target.closest(".mta-fb[data-k='ask']")) preview(card);
  });

  function boot() { scan(); new MutationObserver(function () { scan(); }).observe(document.body, { childList: true, subtree: true }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
