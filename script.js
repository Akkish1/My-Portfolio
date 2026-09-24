(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  /* ---------- theme toggle ---------- */
  function currentTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.getElementById("themeToggle").addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    renderDashboard();
  });

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- proof count-up ---------- */
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var decimals = (el.dataset.count.split(".")[1] || "").length;
    var prefix = el.dataset.prefix || "";
    var suffix = el.dataset.suffix || "";
    var fmt = function (v) {
      return prefix + v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    };
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / 1000, 1);
      el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && !reduceMotion) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll(".proof-num[data-count]").forEach(function (el) { co.observe(el); });
  }

  /* ---------- nav scroll spy ---------- */
  var navLinks = document.querySelectorAll(".nav-links a");
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("section[id]").forEach(function (s) { spy.observe(s); });
  }

  /* ---------- copy email ---------- */
  var copyBtn = document.getElementById("copyEmail");
  var copyNote = document.getElementById("copyNote");
  copyBtn.addEventListener("click", function () {
    var email = "shourya.akkiraju@gmail.com";
    function done() {
      copyNote.textContent = "Copied";
      setTimeout(function () { copyNote.textContent = "Copy"; }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(done, function () { window.prompt("Copy this email address:", email); });
    } else {
      window.prompt("Copy this email address:", email);
    }
  });

  /* ================================================================
     Dashboard demo. All values below are made-up sample data.
     ================================================================ */
  var TYPES = ["Operational risk", "Remediation", "Production bug", "Security vulnerability"];

  // closed / closedOnTime per portfolio; open items are listed individually below.
  var PORTFOLIOS = {
    A: { closed: 27, onTime: 24, trend: [22, 20, 19, 16, 14, 12, 10, 8, 6, 5, 4, 3] },
    B: { closed: 24, onTime: 22, trend: [18, 17, 15, 14, 12, 10, 8, 7, 5, 4, 3, 2] },
    C: { closed: 21, onTime: 19, trend: [17, 16, 16, 13, 11, 10, 8, 7, 6, 4, 4, 3] },
    D: { closed: 20, onTime: 18, trend: [15, 14, 12, 11, 10, 8, 6, 5, 4, 3, 2, 2] },
    E: { closed: 20, onTime: 18, trend: [14, 13, 12, 10, 9, 8, 6, 5, 4, 3, 2, 2] }
  };

  // status: crit = overdue, warn = at risk, good = on track
  var ITEMS = [
    { id: "VUL-131", p: "A", type: 3, title: "Patch outdated base image on build agents", owner: "Build infra", due: "Sep 19", status: "crit", esc: true },
    { id: "REM-093", p: "C", type: 1, title: "Change records missing rollback plans", owner: "SRE change mgmt", due: "Sep 22", status: "crit", esc: true },
    { id: "RSK-226", p: "D", type: 0, title: "Vendor dependency blocking a capacity flex-down", owner: "Cloud cost", due: "Sep 24", status: "crit", esc: false },
    { id: "VUL-138", p: "C", type: 3, title: "Rotate expiring service certificates", owner: "Security eng", due: "Oct 1", status: "warn", esc: false },
    { id: "RSK-214", p: "A", type: 0, title: "Capacity guardrail missing in one region", owner: "Cloud platform", due: "Oct 2", status: "warn", esc: false },
    { id: "REM-097", p: "E", type: 1, title: "Problem review backlog for Q3 incidents", owner: "Problem mgmt", due: "Oct 3", status: "warn", esc: true },
    { id: "BUG-402", p: "B", type: 2, title: "Intermittent timeout in deployment pipeline", owner: "Delivery tooling", due: "Oct 6", status: "good", esc: false },
    { id: "VUL-145", p: "C", type: 3, title: "Enable access logging on public storage buckets", owner: "Security eng", due: "Oct 8", status: "good", esc: false },
    { id: "RSK-219", p: "A", type: 0, title: "Backup restore not tested this quarter", owner: "SRE", due: "Oct 9", status: "good", esc: false },
    { id: "BUG-421", p: "E", type: 2, title: "Cost report double-counts reserved capacity", owner: "FinOps", due: "Oct 10", status: "good", esc: false },
    { id: "VUL-142", p: "D", type: 3, title: "Tighten IAM roles on a legacy project", owner: "Cloud IAM", due: "Oct 12", status: "good", esc: false },
    { id: "RSK-221", p: "B", type: 0, title: "Single owner for a critical migration runbook", owner: "Migration", due: "Oct 14", status: "good", esc: false }
  ];

  var STATUS = {
    crit: { label: "Overdue", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/></svg>' },
    warn: { label: "At risk", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M12 4l9 16H3z"/></svg>' },
    good: { label: "On track", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>' }
  };

  var filter = "all";
  var SVGNS = "http://www.w3.org/2000/svg";

  function css(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }
  function el(tag, attrs, parent) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }

  function selected() {
    var keys = filter === "all" ? Object.keys(PORTFOLIOS) : [filter];
    var items = ITEMS.filter(function (i) { return keys.indexOf(i.p) !== -1; });
    var closed = 0, onTime = 0, trend = new Array(12).fill(0);
    keys.forEach(function (k) {
      closed += PORTFOLIOS[k].closed;
      onTime += PORTFOLIOS[k].onTime;
      PORTFOLIOS[k].trend.forEach(function (v, i) { trend[i] += v; });
    });
    return { items: items, closed: closed, onTime: onTime, trend: trend };
  }

  function renderFilters() {
    var wrap = document.getElementById("dashFilters");
    var opts = [["all", "All portfolios"]].concat(Object.keys(PORTFOLIOS).map(function (k) { return [k, "Portfolio " + k]; }));
    wrap.innerHTML = "";
    opts.forEach(function (o) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filter";
      b.textContent = o[1];
      b.setAttribute("aria-pressed", String(filter === o[0]));
      b.addEventListener("click", function () { filter = o[0]; renderDashboard(); });
      wrap.appendChild(b);
    });
  }

  function renderTiles(d) {
    var tracked = d.closed + d.items.length;
    var pct = Math.round((d.onTime / d.closed) * 100);
    var overdue = d.items.filter(function (i) { return i.status === "crit"; }).length;
    var esc = d.items.filter(function (i) { return i.esc; }).length;
    var tiles = [
      ["Tracked", tracked, "risks, fixes, bugs, vulns"],
      ["On-time closure", pct + "%", d.onTime + " of " + d.closed + " closed"],
      ["Open", d.items.length, "with a named owner"],
      ["Overdue", overdue, esc + " escalated"]
    ];
    document.getElementById("dashTiles").innerHTML = tiles.map(function (t) {
      return '<div class="tile"><div class="k">' + t[0] + '</div><div class="v">' + t[1] + '</div><div class="d">' + t[2] + "</div></div>";
    }).join("");
  }

  // Draw charts in real pixels so text stays the same size at any width.
  function chartWidth(svg) {
    return Math.max(240, Math.round(svg.parentNode.clientWidth - 24));
  }

  function showTip(tip, card, x, y, html) {
    var box = card.getBoundingClientRect();
    tip.innerHTML = html;
    tip.style.left = Math.max(60, Math.min(box.width - 60, x - box.left)) + "px";
    tip.style.top = (y - box.top) + "px";
    tip.classList.add("show");
  }
  function hideTip(tip) { tip.classList.remove("show"); }

  function renderBars(d) {
    var svg = document.getElementById("barChart");
    var tip = document.getElementById("barTip");
    var card = svg.parentNode;
    svg.innerHTML = "";
    var counts = TYPES.map(function (_, t) { return d.items.filter(function (i) { return i.type === t; }).length; });
    var max = Math.max(4, Math.max.apply(null, counts));
    var W = chartWidth(svg);
    var left = 142, right = 26, top = 6, rowH = 28, barH = 12;
    var w = W - left - right;
    var accent = css("--accent");
    counts.forEach(function (c, i) {
      var y = top + i * rowH;
      var t = el("text", { x: 0, y: y + barH / 2 + 4, class: "lbl" }, svg);
      t.textContent = TYPES[i];
      el("rect", { x: left, y: y, width: w, height: barH, rx: 4, fill: css("--grid") }, svg);
      var bw = c === 0 ? 0 : Math.max(6, (c / max) * w);
      if (bw > 0) el("rect", { x: left, y: y, width: bw, height: barH, rx: 4, fill: accent }, svg);
      var v = el("text", { x: left + bw + 6, y: y + barH / 2 + 4, class: "val" }, svg);
      v.textContent = c;
      var hit = el("rect", { x: 0, y: y - 8, width: W, height: rowH, fill: "transparent" }, svg);
      hit.style.cursor = "default";
      hit.addEventListener("mousemove", function (e) {
        showTip(tip, card, e.clientX, e.clientY, TYPES[i] + ": <b>" + c + "</b> open");
      });
      hit.addEventListener("mouseleave", function () { hideTip(tip); });
    });
    svg.setAttribute("viewBox", "0 0 " + W + " " + (top + counts.length * rowH - 10));
  }

  function renderLine(d) {
    var svg = document.getElementById("lineChart");
    var tip = document.getElementById("lineTip");
    var card = svg.parentNode;
    svg.innerHTML = "";
    var data = d.trend;
    var W = chartWidth(svg), H = 150, l = 26, r = 10, t = 10, b = 22;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var max = Math.ceil(Math.max.apply(null, data) / 10) * 10 || 10;
    var x = function (i) { return l + (i / (data.length - 1)) * (W - l - r); };
    var y = function (v) { return t + (1 - v / max) * (H - t - b); };
    var accent = css("--accent");

    [0, max / 2, max].forEach(function (g) {
      el("line", { x1: l, x2: W - r, y1: y(g), y2: y(g), stroke: css("--grid"), "stroke-width": 1 }, svg);
      var tx = el("text", { x: l - 6, y: y(g) + 3, "text-anchor": "end", class: "axis" }, svg);
      tx.textContent = g;
    });
    [0, 5, 11].forEach(function (i) {
      var tx = el("text", { x: x(i), y: H - 6, "text-anchor": i === 0 ? "start" : i === 11 ? "end" : "middle", class: "axis" }, svg);
      tx.textContent = "Wk " + (i + 1);
    });

    var pts = data.map(function (v, i) { return x(i) + "," + y(v); }).join(" ");
    el("polygon", { points: x(0) + "," + y(0) + " " + pts + " " + x(data.length - 1) + "," + y(0), fill: accent, "fill-opacity": 0.12 }, svg);
    el("polyline", { points: pts, fill: "none", stroke: accent, "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);

    var last = data.length - 1;
    el("circle", { cx: x(last), cy: y(data[last]), r: 4, fill: accent, stroke: css("--surface"), "stroke-width": 2 }, svg);

    var cross = el("line", { y1: t, y2: H - b, stroke: css("--ink-faint"), "stroke-width": 1, "stroke-dasharray": "3 3", opacity: 0 }, svg);
    var dot = el("circle", { r: 4, fill: accent, stroke: css("--surface"), "stroke-width": 2, opacity: 0 }, svg);
    var hit = el("rect", { x: l, y: t, width: W - l - r, height: H - t - b, fill: "transparent" }, svg);
    hit.addEventListener("mousemove", function (e) {
      var box = svg.getBoundingClientRect();
      var sx = ((e.clientX - box.left) / box.width) * W;
      var i = Math.max(0, Math.min(last, Math.round(((sx - l) / (W - l - r)) * last)));
      cross.setAttribute("x1", x(i)); cross.setAttribute("x2", x(i)); cross.setAttribute("opacity", 1);
      dot.setAttribute("cx", x(i)); dot.setAttribute("cy", y(data[i])); dot.setAttribute("opacity", 1);
      var px = box.left + (x(i) / W) * box.width;
      var py = box.top + (y(data[i]) / H) * box.height;
      showTip(tip, card, px, py, "Week " + (i + 1) + ": <b>" + data[i] + "</b> open");
    });
    hit.addEventListener("mouseleave", function () {
      cross.setAttribute("opacity", 0); dot.setAttribute("opacity", 0); hideTip(tip);
    });
  }

  function renderRows(d) {
    var rows = d.items.slice(0, 5);
    document.getElementById("dashRows").innerHTML = rows.map(function (i) {
      var s = STATUS[i.status];
      return "<tr><td><strong>" + i.id + "</strong> " + escapeHtml(i.title) +
        (i.esc ? ' <span class="pill warn" style="margin-left:4px">Escalated</span>' : "") +
        '</td><td class="hide-sm">' + escapeHtml(i.owner) + '</td><td class="due">' + i.due +
        '</td><td><span class="pill ' + i.status + '">' + s.icon + s.label + "</span></td></tr>";
    }).join("") || '<tr><td colspan="4">No open items.</td></tr>';
  }

  function renderDashboard() {
    var d = selected();
    renderFilters();
    renderTiles(d);
    renderBars(d);
    renderLine(d);
    renderRows(d);
  }

  renderDashboard();

  var lastWidth = window.innerWidth, resizeTimer;
  window.addEventListener("resize", function () {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { renderBars(selected()); renderLine(selected()); }, 120);
  });
})();
