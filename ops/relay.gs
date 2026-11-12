/**
 * Report relay for the study sites (Google Apps Script web app).
 * Students' "report a problem" forms POST here; this files each report as a JSON file
 * in the PRIVATE repo EliorCh/ops-inbox (reports/<id>.json), where the ops page and Claude read it.
 *
 * Setup (once): see README in this folder.
 * Script properties: GITHUB_TOKEN (fine-grained, Contents: read & write on ops-inbox only)
 *                    NOTIFY_EMAIL (optional: get an email for every new report)
 */
var OWNER = 'EliorCh', REPO = 'ops-inbox';

function doPost(e) {
  try {
    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.action === 'stats') return out(stats(d));
    var lock = LockService.getScriptLock(); lock.tryLock(5000);
    var cache = CacheService.getScriptCache(), n = +(cache.get('n') || 0);
    if (n > 40) return out({ ok: false, error: 'busy' });          // simple flood guard: 40 reports / 10 minutes
    cache.put('n', String(n + 1), 600);

    var clip = function (s, k) { return String(s == null ? '' : s).slice(0, k); };
    if (!d.problem || !d.site) return out({ ok: false, error: 'missing fields' });

    var now = new Date();
    var id = Utilities.formatDate(now, 'Asia/Jerusalem', 'yyyyMMdd-HHmmss') + '-' + Math.random().toString(36).slice(2, 6);
    var rep = {
      id: id, created: now.toISOString(), status: 'new',
      site: clip(d.site, 40), course: clip(d.course, 80), qid: clip(d.qid, 60), qlabel: clip(d.qlabel, 200), kind: clip(d.kind, 40),
      url: clip(d.url, 400), problem: clip(d.problem, 4000), question: clip(d.question, 12000), solution: clip(d.solution, 12000),
      reporter: { name: clip(d.name, 100), email: clip(d.email, 150), year: clip(d.year, 40) },
      notes: []
    };
    var token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
    var res = UrlFetchApp.fetch('https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/reports/' + id + '.json', {
      method: 'put', contentType: 'application/json', muteHttpExceptions: true,
      headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' },
      payload: JSON.stringify({ message: 'report ' + id + ' · ' + rep.site + ' ' + rep.qid,
        content: Utilities.base64Encode(JSON.stringify(rep, null, 1), Utilities.Charset.UTF_8) })
    });
    if (res.getResponseCode() >= 300) return out({ ok: false, error: 'store ' + res.getResponseCode() });

    var to = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
    if (to) MailApp.sendEmail(to, 'דיווח חדש: ' + rep.qlabel + ' · ' + rep.course,
      rep.problem + '\n\n' + rep.url + '\n\nלדף התפעול: https://eliorch.github.io/main/ops.html');
    return out({ ok: true, id: id });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}
/* Usage numbers for the ops page: the page sends its own GoatCounter key, the relay asks GoatCounter
   server-side (no browser blocking), one call at a time to stay under GoatCounter's 4-per-second limit. */
function stats(d) {
  var paths = (d.paths || []).slice(0, 8), res = [];
  for (var i = 0; i < paths.length; i++) {
    var p = String(paths[i]);
    if (!/^(me|stats\/(total|hits))(\?|$)/.test(p)) { res.push({ status: 400, body: '{"error":"path not allowed"}' }); continue; }
    if (i) Utilities.sleep(350);
    var r = UrlFetchApp.fetch('https://eliorch.goatcounter.com/api/v0/' + p, {
      muteHttpExceptions: true, headers: { Authorization: 'Bearer ' + d.gc, 'Content-Type': 'application/json' } });
    res.push({ status: r.getResponseCode(), body: r.getContentText() });
  }
  return { ok: true, results: res, version: 2 };
}
function doGet() { return out({ ok: true, service: 'study-sites report relay', version: 2 }); }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
