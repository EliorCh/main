# main — home page + shared design for all study sites

- `index.html` — the student home page that links every summary and practice site.
- `site-theme.css` / `site-theme.js` — the shared design language. Every site loads them from here
  (`../main/site-theme.css`), so a change here updates all sites at once:
  course colors (section 1), reading themes light/sepia/dark (2), footer + theme switcher (3),
  and the hooks that map the course color into each site family (4).
- `site-feedback.js` — "report a problem" / "ask the lecturer" buttons for the quiz-style practice sites.

Each site declares only which course it is, e.g.
`<script src="../main/site-theme.js" data-course="os" data-fam="os" data-footer="main"></script>`.
To change a course color, edit its line in section 1 of `site-theme.css`.
