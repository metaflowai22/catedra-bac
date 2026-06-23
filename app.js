/* Catedra · BAC Română — SPA fără build, fără backend. */
(function () {
  "use strict";
  var WORKS = window.WORKS || [];
  var SCHITE = window.SCHITE || {};
  WORKS.forEach(function (w) { if (SCHITE[w.id]) w.schita = SCHITE[w.id]; });
  var app = document.getElementById("app");

  /* ---------- utils ---------- */
  function el(html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function byId(id) { return WORKS.find(function (w) { return w.id === id; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var GENRE_LABELS = { poezie: "Poezie", roman: "Roman", nuvela: "Nuvelă", "nuvelă": "Nuvelă", dramaturgie: "Dramaturgie", basm: "Basm" };

  /* ---------- mini markdown ---------- */
  function inline(s) {
    s = esc(s);
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return s;
  }
  function markdown(src) {
    var blocks = src.split(/\n\n+/);
    var out = "";
    blocks.forEach(function (b) {
      b = b.trim();
      if (!b) return;
      if (b === "---") { out += '<div class="rule"></div>'; return; }
      if (b.indexOf("### ") === 0) { out += "<h3>" + inline(b.slice(4)) + "</h3>"; return; }
      if (b.indexOf("> ") === 0) {
        var q = b.split("\n").map(function (l) { return l.replace(/^>\s?/, ""); }).join(" ");
        out += "<blockquote>" + inline(q) + "</blockquote>"; return;
      }
      out += "<p>" + inline(b.replace(/\n/g, " ")) + "</p>";
    });
    return out;
  }

  /* ---------- chrome (header/footer) ---------- */
  function header(active) {
    var h = el(
      '<header class="site-header"><div class="wrap">' +
      '<div class="brand" data-go="#/"><div class="brand-mark">C</div>' +
      '<div><div class="brand-name">Catedra</div><div class="brand-sub">BAC · Limba română</div></div></div>' +
      '<nav class="nav">' +
      '<button data-go="#/" class="' + (active === "home" ? "active" : "") + '">Bibliotecă</button>' +
      '<button data-go="#/examen" class="nav-cta">Mod examen</button>' +
      '</nav></div></header>'
    );
    return h;
  }
  function footer() {
    return el(
      '<footer class="site-footer"><div class="wrap">' +
      '<div class="muted">Catedra <span class="dot">·</span> 15 opere obligatorii pentru Bacalaureat, profil real</div>' +
      '<div class="muted">Comentarii <span class="dot">·</span> Caracterizări <span class="dot">·</span> Quiz-uri</div>' +
      '</div></footer>'
    );
  }

  /* ---------- views ---------- */
  function viewHome() {
    var sorted = WORKS.slice().sort(function (a, b) { return parseInt(a.year) - parseInt(b.year); });
    var genres = ["toate"].concat(Object.keys(sorted.reduce(function (acc, w) { acc[w.genre] = 1; return acc; }, {})));

    var root = el('<div></div>');
    root.appendChild(header("home"));

    // hero
    var hero = el(
      '<section class="hero"><div class="wrap">' +
      '<span class="eyebrow">Profil real · 15 opere</span>' +
      '<h1>Pregătire de <em>Bacalaureat</em> la română, fără bătăi de cap.</h1>' +
      '<p class="lead">Comentarii și caracterizări complete, scrise ca la examen, plus quiz-uri pe fiecare operă. Totul ordonat <strong>cronologic</strong>, de la Creangă la Sorescu.</p>' +
      '<div class="hero-actions">' +
      '<a class="btn" data-go="#/opera/' + sorted[0].id + '">Începe cu prima operă →</a>' +
      '<a class="btn btn-ghost" data-go="#/examen">Dă un examen-test</a>' +
      '</div>' +
      '<div class="hero-stats">' +
      '<div class="stat"><div class="n">15</div><div class="l">opere obligatorii</div></div>' +
      '<div class="stat"><div class="n">' + WORKS.reduce(function (s, w) { return s + (w.characters ? w.characters.length : 0); }, 0) + '</div><div class="l">caracterizări</div></div>' +
      '<div class="stat"><div class="n">' + WORKS.reduce(function (s, w) { return s + (w.quiz ? w.quiz.length : 0); }, 0) + '+</div><div class="l">întrebări de quiz</div></div>' +
      '</div></div></section>'
    );
    root.appendChild(hero);

    // library
    var lib = el('<section class="section"><div class="wrap"></div></section>');
    var w = lib.querySelector(".wrap");
    w.appendChild(el(
      '<div class="section-head"><div><h2>Biblioteca operelor</h2><p>Ordonate cronologic, după anul apariției. Apasă pe o operă pentru eseu, caracterizări și quiz.</p></div></div>'
    ));
    var filters = el('<div class="filters"></div>');
    genres.forEach(function (g) {
      var b = el('<button class="chip ' + (g === "toate" ? "active" : "") + '" data-genre="' + g + '">' + (g === "toate" ? "Toate" : (GENRE_LABELS[g] || g)) + '</button>');
      filters.appendChild(b);
    });
    w.appendChild(filters);

    var grid = el('<div class="grid"></div>');
    function renderCards(genre) {
      grid.innerHTML = "";
      sorted.filter(function (x) { return genre === "toate" || x.genre === genre; }).forEach(function (x) {
        var nChars = x.characters ? x.characters.length : 0;
        var card = el(
          '<a class="card fade" data-go="#/opera/' + x.id + '">' +
          '<span class="yr">' + esc(x.year) + '</span>' +
          '<span class="genre">' + esc(GENRE_LABELS[x.genre] || x.genre) + '</span>' +
          '<h3>' + esc(x.title) + '</h3>' +
          '<div class="author">' + esc(x.author) + '</div>' +
          '<div class="type">' + esc(x.type) + '</div>' +
          '<div class="card-foot"><span class="open">Deschide opera →</span>' +
          '<span class="chars">' + (nChars ? nChars + " personaje" : "comentariu") + '</span></div>' +
          '</a>'
        );
        grid.appendChild(card);
      });
    }
    renderCards("toate");
    w.appendChild(grid);

    filters.addEventListener("click", function (e) {
      var b = e.target.closest("[data-genre]"); if (!b) return;
      filters.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("active"); });
      b.classList.add("active");
      renderCards(b.getAttribute("data-genre"));
    });

    // features
    var feat = el('<section class="section" style="padding-top:0"><div class="wrap"></div></section>');
    var fw = feat.querySelector(".wrap");
    fw.appendChild(el('<div class="section-head"><div><h2>Cum funcționează</h2><p>Trei instrumente, totul offline și gratuit.</p></div></div>'));
    var fr = el('<div class="features"></div>');
    [
      ["¶", "Eseu / comentariu", "Comentariu literar structurat (încadrare, temă, construcție, semnificații, concluzie) pentru fiecare operă."],
      ["☺", "Caracterizare", "Portrete de personaj gata de redactat la examen, cu trăsături și citate-cheie. Le poți descărca în PDF."],
      ["✓", "Quiz literar", "Întrebări grilă cu explicații pe fiecare operă, plus un mod examen cu întrebări amestecate."]
    ].forEach(function (f) {
      fr.appendChild(el('<div class="feature"><div class="ic">' + f[0] + '</div><h3>' + f[1] + '</h3><p>' + f[2] + '</p></div>'));
    });
    fw.appendChild(fr);

    root.appendChild(lib);
    root.appendChild(feat);
    root.appendChild(footer());
    return root;
  }

  function viewWork(id) {
    var work = byId(id);
    if (!work) return viewHome();
    var root = el('<div></div>');
    root.appendChild(header(""));

    var sec = el('<section class="detail-top"><div class="wrap"></div></section>');
    var w = sec.querySelector(".wrap");
    w.appendChild(el('<a class="back" data-go="#/">← Înapoi la bibliotecă</a>'));
    w.appendChild(el('<div class="detail-head"><h1>' + esc(work.title) + '</h1></div>'));
    w.appendChild(el(
      '<div class="detail-meta">' +
      '<span class="tag accent">' + esc(work.author) + '</span>' +
      '<span class="tag">' + esc(work.year) + '</span>' +
      '<span class="tag">' + esc(GENRE_LABELS[work.genre] || work.genre) + '</span>' +
      '<span class="tag">' + esc(work.type) + '</span>' +
      '</div>'
    ));
    var hasChars = work.characters && work.characters.length;
    var hasSchita = !!work.schita;
    var tabs = el(
      '<div class="tabs">' +
      '<button data-tab="schita" class="active">Schiță</button>' +
      '<button data-tab="eseu">Eseu &amp; comentariu</button>' +
      (hasChars ? '<button data-tab="caract">Caracterizare</button>' : '') +
      '<button data-tab="quiz">Quiz</button>' +
      '</div>'
    );
    w.appendChild(tabs);
    root.appendChild(sec);

    var panel = el('<section class="panel"><div class="wrap"></div></section>');
    var pw = panel.querySelector(".wrap");
    root.appendChild(panel);
    root.appendChild(footer());

    function setTab(tab) {
      tabs.querySelectorAll("button").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-tab") === tab); });
      pw.innerHTML = "";
      if (tab === "schita") pw.appendChild(panelSchita(work));
      else if (tab === "eseu") pw.appendChild(panelEssay(work));
      else if (tab === "caract") pw.appendChild(panelChars(work));
      else pw.appendChild(panelQuiz(work.quiz, "Quiz · " + work.title));
    }
    tabs.addEventListener("click", function (e) { var b = e.target.closest("[data-tab]"); if (b) setTab(b.getAttribute("data-tab")); });
    setTab(work.schita ? "schita" : "eseu");
    return root;
  }

  /* ----- schiță de învățare (fișă vizuală) ----- */
  function panelSchita(work) {
    var s = work.schita;
    var wrap = el('<div class="schita"></div>');

    // hero
    wrap.appendChild(el(
      '<div class="sc-hero">' +
      '<div class="sc-hero-badge">' + esc(s.curent || GENRE_LABELS[work.genre] || work.genre) + '</div>' +
      '<h2>' + esc(work.title) + '</h2>' +
      '<div class="sc-hero-meta">' + esc(work.author) + ' <span>·</span> ' + esc(work.year) + ' <span>·</span> ' + esc(work.type) + '</div>' +
      '<div class="sc-tema"><span class="sc-tema-k">Temă</span><p>' + inline(s.tema) + '</p></div>' +
      '</div>'
    ));

    var grid = el('<div class="sc-grid"></div>');

    // idei principale — hartă numerotată
    var ideas = el('<div class="sc-card sc-ideas"><div class="sc-card-h"><span class="sc-ic">◆</span><h3>Ideile principale</h3></div><div class="sc-steps"></div></div>');
    var steps = ideas.querySelector(".sc-steps");
    s.idei.forEach(function (it, i) {
      steps.appendChild(el('<div class="sc-step"><span class="sc-num">' + (i + 1) + '</span><p>' + inline(it) + '</p></div>'));
    });
    grid.appendChild(ideas);

    // coloana din dreapta
    var side = el('<div class="sc-side"></div>');

    // personaje (dacă există)
    if (work.characters && work.characters.length) {
      var pc = el('<div class="sc-card sc-chars"><div class="sc-card-h"><span class="sc-ic">☺</span><h3>Personaje-cheie</h3></div><div class="sc-chars-list"></div></div>');
      var pl = pc.querySelector(".sc-chars-list");
      work.characters.forEach(function (c) {
        pl.appendChild(el('<div class="sc-chip-char"><b>' + esc(c.name) + '</b><span>' + esc(c.role) + '</span></div>'));
      });
      side.appendChild(pc);
    }

    // citate
    if (s.citate && s.citate.length) {
      var qc = el('<div class="sc-card sc-quotes"><div class="sc-card-h"><span class="sc-ic">❝</span><h3>Citate esențiale</h3></div><div class="sc-q-list"></div></div>');
      var ql = qc.querySelector(".sc-q-list");
      s.citate.forEach(function (q) { ql.appendChild(el('<blockquote>' + inline(q) + '</blockquote>')); });
      side.appendChild(qc);
    }
    grid.appendChild(side);

    // de reținut (full width)
    if (s.retine && s.retine.length) {
      var rc = el('<div class="sc-card sc-retine"><div class="sc-card-h"><span class="sc-ic">✓</span><h3>De reținut la examen</h3></div><div class="sc-retine-list"></div></div>');
      var rl = rc.querySelector(".sc-retine-list");
      s.retine.forEach(function (r) { rl.appendChild(el('<div class="sc-tick"><span>✓</span><p>' + inline(r) + '</p></div>')); });
      grid.appendChild(rc);
    }

    wrap.appendChild(grid);

    var foot = el('<div class="essay-foot"><span class="meta">Fișă de învățare · ' + esc(work.title) + '</span>' +
      '<button class="btn btn-sm" data-act="pdf">Descarcă PDF</button></div>');
    wrap.appendChild(foot);
    foot.querySelector("button").addEventListener("click", function () { printSchita(work); });

    return wrap;
  }

  /* ----- essay panel (with fake "generate") ----- */
  function panelEssay(work) {
    var wrap = el('<div></div>');
    var bar = el(
      '<div class="gen-bar">' +
      '<span class="lbl">Comentariu literar pentru <strong>' + esc(work.title) + '</strong></span>' +
      '<div class="spacer"></div>' +
      '<button class="btn btn-sm" data-act="gen">Generează eseul</button>' +
      '</div>'
    );
    var slot = el('<div></div>');
    wrap.appendChild(bar);
    wrap.appendChild(slot);

    function showEssay() {
      slot.innerHTML = "";
      var box = el('<div class="prose-wrap fade"></div>');
      box.appendChild(el(
        '<div class="prose">' +
        '<div class="essay-title">' + esc(work.title) + '</div>' +
        '<div class="essay-sub">' + esc(work.author) + ' · ' + esc(work.year) + ' · comentariu literar</div>' +
        markdown(work.essay) +
        '</div>'
      ));
      var foot = el(
        '<div class="essay-foot">' +
        '<span class="meta">Eseu structurat pentru proba scrisă · profil real</span>' +
        '<span><button class="btn btn-ghost btn-sm" data-act="regen">Generează din nou</button> ' +
        '<button class="btn btn-sm" data-act="pdf">Descarcă PDF</button></span>' +
        '</div>'
      );
      box.appendChild(foot);
      slot.appendChild(box);
      foot.querySelector('[data-act="pdf"]').addEventListener("click", function () { printNode(box, work.title + " — " + work.author); });
      foot.querySelector('[data-act="regen"]').addEventListener("click", runGen);
      bar.querySelector('[data-act="gen"]').textContent = "Regenerează";
    }
    function runGen() {
      slot.innerHTML = "";
      var loader = el('<div class="loader"><div class="spin"></div><p>Se redactează comentariul…</p></div>');
      slot.appendChild(loader);
      setTimeout(showEssay, 480);
    }
    bar.querySelector('[data-act="gen"]').addEventListener("click", runGen);
    return wrap;
  }

  /* ----- characters panel ----- */
  function panelChars(work) {
    var wrap = el('<div></div>');
    var grid = el('<div class="char-grid"></div>');
    work.characters.forEach(function (c, i) {
      grid.appendChild(el(
        '<div class="char-card" data-i="' + i + '"><h3>' + esc(c.name) + '</h3>' +
        '<div class="role">' + esc(c.role) + '</div>' +
        '<div class="hint">Apasă pentru caracterizarea completă →</div></div>'
      ));
    });
    var slot = el('<div style="margin-top:24px"></div>');
    wrap.appendChild(el('<div class="gen-bar"><span class="lbl">Alege personajul din <strong>' + esc(work.title) + '</strong></span></div>'));
    wrap.appendChild(grid);
    wrap.appendChild(slot);

    grid.addEventListener("click", function (e) {
      var card = e.target.closest("[data-i]"); if (!card) return;
      grid.querySelectorAll(".char-card").forEach(function (x) { x.style.borderColor = ""; });
      card.style.borderColor = "var(--accent)";
      var c = work.characters[+card.getAttribute("data-i")];
      slot.innerHTML = "";
      var loader = el('<div class="loader"><div class="spin"></div><p>Se redactează caracterizarea…</p></div>');
      slot.appendChild(loader);
      setTimeout(function () {
        slot.innerHTML = "";
        var box = el('<div class="prose-wrap fade"></div>');
        box.appendChild(el(
          '<div class="prose"><div class="essay-title">' + esc(c.name) + '</div>' +
          '<div class="essay-sub">' + esc(work.title) + ' · ' + esc(c.role) + '</div>' +
          markdown(c.essay) + '</div>'
        ));
        var foot = el('<div class="essay-foot"><span class="meta">Caracterizare de personaj</span>' +
          '<button class="btn btn-sm" data-act="pdf">Descarcă PDF</button></div>');
        box.appendChild(foot);
        slot.appendChild(box);
        foot.querySelector("button").addEventListener("click", function () { printNode(box, c.name + " — " + work.title); });
        box.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 420);
    });
    return wrap;
  }

  /* ----- quiz panel (reusable) ----- */
  function panelQuiz(questions, sourceLabel, isExam) {
    var wrap = el('<div></div>');
    var qs = isExam ? questions : questions;
    var idx = 0, score = 0, answered = false;

    var card = el('<div class="quiz-card"></div>');
    wrap.appendChild(card);

    function render() {
      answered = false;
      if (idx >= qs.length) { return renderResult(); }
      var q = qs[idx];
      card.innerHTML = "";
      card.classList.add("fade");
      card.appendChild(el(
        '<div class="quiz-progress"><span class="step">Întrebarea ' + (idx + 1) + ' / ' + qs.length + '</span>' +
        '<span class="score">Scor: ' + score + '</span></div>'
      ));
      card.appendChild(el('<div class="qbar"><i style="width:' + (idx / qs.length * 100) + '%"></i></div>'));
      if (q._src) card.appendChild(el('<div class="q-src">' + esc(q._src) + '</div>'));
      card.appendChild(el('<div class="q-text">' + inline(q.q) + '</div>'));
      var opts = el('<div class="opts"></div>');
      var keys = ["A", "B", "C", "D", "E"];
      // amestecăm ordinea variantelor la fiecare afișare, ca poziția răspunsului
      // corect să fie aleatorie; data-i păstrează indexul original (q.correct).
      var order = shuffle(q.opts.map(function (_, i) { return i; }));
      order.forEach(function (origIdx, pos) {
        var b = el('<button class="opt" data-i="' + origIdx + '"><span class="key">' + keys[pos] + '</span><span>' + inline(q.opts[origIdx]) + '</span></button>');
        opts.appendChild(b);
      });
      card.appendChild(opts);
      var foot = el('<div class="quiz-foot"></div>');
      card.appendChild(foot);

      opts.addEventListener("click", function (e) {
        if (answered) return;
        var b = e.target.closest(".opt"); if (!b) return;
        answered = true;
        var chosen = +b.getAttribute("data-i");
        opts.querySelectorAll(".opt").forEach(function (x) {
          x.disabled = true;
          var oi = +x.getAttribute("data-i");
          if (oi === q.correct) x.classList.add("correct");
          else if (oi === chosen) x.classList.add("wrong");
        });
        if (chosen === q.correct) score++;
        card.querySelector(".score").textContent = "Scor: " + score;
        card.appendChild(el('<div class="explain fade"><b>' + (chosen === q.correct ? "Corect. " : "Greșit. ") + '</b>' + inline(q.explain) + '</div>'));
        var next = el('<button class="btn btn-sm">' + (idx + 1 < qs.length ? "Următoarea →" : "Vezi rezultatul") + '</button>');
        foot.appendChild(next);
        next.addEventListener("click", function () { idx++; render(); });
      });
    }

    function renderResult() {
      var pct = Math.round(score / qs.length * 100);
      var grade = Math.max(1, Math.round((score / qs.length) * 9 + 1)); // ~1..10
      var msg = pct >= 80 ? "Excelent — ești pregătit de examen!" : pct >= 50 ? "Bine, dar mai recitește comentariile." : "Mai exersează — reia eseurile și încearcă din nou.";
      card.innerHTML = "";
      var r = el(
        '<div class="result fade"><div class="big">' + score + '/' + qs.length + '</div>' +
        '<div class="grade">' + pct + '% corecte · nota ~' + grade + '</div>' +
        '<p>' + msg + '</p>' +
        '<div class="actions">' +
        '<button class="btn btn-sm" data-act="again">Încearcă din nou</button>' +
        '<a class="btn btn-ghost btn-sm" data-go="#/">Înapoi la bibliotecă</a>' +
        '</div></div>'
      );
      card.appendChild(r);
      r.querySelector('[data-act="again"]').addEventListener("click", function () {
        idx = 0; score = 0; if (isExam) qs = buildExam(); render();
      });
    }

    render();
    return wrap;
  }

  function buildExam() {
    var pool = [];
    WORKS.forEach(function (w) {
      (w.quiz || []).forEach(function (q) {
        var c = Object.assign({}, q); c._src = w.title + " · " + w.author; pool.push(c);
      });
    });
    return shuffle(pool).slice(0, 12);
  }

  function viewExam() {
    var root = el('<div></div>');
    root.appendChild(header(""));
    var sec = el('<section class="detail-top"><div class="wrap"></div></section>');
    var w = sec.querySelector(".wrap");
    w.appendChild(el('<a class="back" data-go="#/">← Înapoi la bibliotecă</a>'));
    w.appendChild(el('<div class="detail-head"><h1>Mod examen</h1></div>'));
    w.appendChild(el('<div class="detail-meta"><span class="tag accent">12 întrebări</span><span class="tag">amestecate din toate operele</span></div>'));
    root.appendChild(sec);
    var panel = el('<section class="panel"><div class="wrap"></div></section>');
    panel.querySelector(".wrap").appendChild(panelQuiz(buildExam(), "Examen", true));
    root.appendChild(panel);
    root.appendChild(footer());
    return root;
  }

  /* ---------- print / PDF ---------- */
  function printNode(node, title) {
    var win = window.open("", "_blank");
    if (!win) { window.print(); return; }
    var css = '<style>' +
      '@import url("https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap");' +
      'body{font-family:"Source Serif 4",Georgia,serif;color:#1f1a15;max-width:720px;margin:40px auto;padding:0 28px;line-height:1.7;font-size:13pt}' +
      '.essay-title{font-size:22pt;font-weight:600;margin:0 0 2px}.essay-sub{font-family:Arial,sans-serif;font-size:9pt;letter-spacing:.04em;text-transform:uppercase;color:#5c564d;margin-bottom:20px}' +
      'h3{font-size:14pt;margin:18px 0 6px;color:#0f0c09}p{margin:0 0 12px}blockquote{border-left:3px solid #b9892f;margin:14px 0;padding-left:16px;font-style:italic;color:#5c564d}' +
      'strong{font-weight:600}.rule{height:1px;background:#ddd5c5;margin:18px auto;max-width:80px}.essay-foot,.btn{display:none!important}' +
      'header,.tabs{display:none}@page{margin:18mm}' +
      '</style>';
    win.document.write('<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>' + esc(title) + '</title>' + css + '</head><body>' + node.querySelector(".prose").outerHTML + '</body></html>');
    win.document.close();
    setTimeout(function () { win.focus(); win.print(); }, 500);
  }

  function printSchita(work) {
    var s = work.schita;
    function list(arr, cls) { return '<ul class="' + cls + '">' + arr.map(function (x) { return '<li>' + inline(x) + '</li>'; }).join("") + '</ul>'; }
    var chars = (work.characters && work.characters.length)
      ? '<h3>Personaje-cheie</h3><ul class="pl">' + work.characters.map(function (c) { return '<li><b>' + esc(c.name) + '</b> — ' + esc(c.role) + '</li>'; }).join("") + '</ul>' : "";
    var quotes = (s.citate && s.citate.length)
      ? '<h3>Citate esențiale</h3>' + s.citate.map(function (q) { return '<blockquote>' + inline(q) + '</blockquote>'; }).join("") : "";
    var html =
      '<div class="head"><div class="badge">' + esc(s.curent) + '</div>' +
      '<h1>' + esc(work.title) + '</h1>' +
      '<div class="meta">' + esc(work.author) + ' · ' + esc(work.year) + ' · ' + esc(work.type) + '</div></div>' +
      '<div class="tema"><b>Temă:</b> ' + inline(s.tema) + '</div>' +
      '<h3>Ideile principale</h3>' + '<ol class="ol">' + s.idei.map(function (x) { return '<li>' + inline(x) + '</li>'; }).join("") + '</ol>' +
      chars + quotes +
      '<h3>De reținut la examen</h3>' + list(s.retine, "pl");
    var win = window.open("", "_blank");
    if (!win) { window.print(); return; }
    var css = '<style>' +
      '@import url("https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=Inter:wght@400;600&display=swap");' +
      'body{font-family:"Source Serif 4",Georgia,serif;color:#1f1a15;max-width:740px;margin:36px auto;padding:0 28px;line-height:1.55;font-size:12pt}' +
      '.head{border-bottom:2px solid #8a2e2e;padding-bottom:12px;margin-bottom:16px}' +
      '.badge{font-family:Inter,sans-serif;font-size:8.5pt;letter-spacing:.12em;text-transform:uppercase;color:#8a2e2e;font-weight:600}' +
      'h1{font-size:23pt;margin:6px 0 2px}.meta{font-family:Inter,sans-serif;font-size:9.5pt;color:#5c564d}' +
      '.tema{background:#efe9da;border-left:3px solid #b9892f;padding:10px 14px;margin:0 0 18px;font-size:11.5pt}' +
      'h3{font-family:Inter,sans-serif;font-size:11pt;text-transform:uppercase;letter-spacing:.04em;color:#8a2e2e;margin:18px 0 6px}' +
      'ol.ol{padding-left:22px;margin:0}ol.ol li{margin:0 0 7px}ul.pl{padding-left:18px;margin:0;list-style:none}ul.pl li{position:relative;margin:0 0 6px;padding-left:16px}ul.pl li:before{content:"✓";position:absolute;left:0;color:#3f6b43;font-weight:700}' +
      'blockquote{border-left:3px solid #b9892f;margin:8px 0;padding-left:14px;font-style:italic;color:#5c564d}b{font-weight:600}@page{margin:16mm}' +
      '</style>';
    win.document.write('<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>Schiță — ' + esc(work.title) + '</title>' + css + '</head><body>' + html + '</body></html>');
    win.document.close();
    setTimeout(function () { win.focus(); win.print(); }, 500);
  }

  /* ---------- router ---------- */
  function route() {
    var h = location.hash || "#/";
    var node;
    if (h.indexOf("#/opera/") === 0) node = viewWork(h.slice(8));
    else if (h === "#/examen") node = viewExam();
    else node = viewHome();
    app.innerHTML = "";
    app.appendChild(node);
    window.scrollTo(0, 0);
  }

  document.addEventListener("click", function (e) {
    var go = e.target.closest("[data-go]");
    if (go) { e.preventDefault(); var t = go.getAttribute("data-go"); if (location.hash === t) route(); else location.hash = t; }
  });
  window.addEventListener("hashchange", route);
  route();
})();
