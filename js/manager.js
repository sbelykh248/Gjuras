(function () {
  const loginScreen = document.getElementById("login-screen");
  const desk = document.getElementById("desk");
  const err = document.getElementById("login-err");

  function money(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function showDesk() {
    const s = Gjuras.currentSession();
    if (!s) return;
    loginScreen.style.display = "none";
    desk.classList.add("on");
    document.getElementById("who").textContent = s.email;
    render();
  }

  function render() {
    const t = Gjuras.weekTotals();
    const day = Gjuras.dayTotals();
    const bookings = Gjuras.getBookings();
    const pending = bookings.filter(b => b.status === "pending").length;
    document.getElementById("kpis").innerHTML =
      kpi("Today", money(day.total), day.count + " tickets · cash " + money(day.cash) + " · card " + money(day.card)) +
      kpi("Week sales", money(t.revenue), t.covers + " covers") +
      kpi("After costs", money(t.contribution), "rent / food / labor targets") +
      kpi("Open requests", String(pending), Gjuras.TABLES + " tables");

    const cats = day.byCat;
    const maxCat = Math.max(cats.grill, cats.kitchen, cats.bar, cats.other, 1);
    document.getElementById("cat-bars").innerHTML =
      bar("$ Grill", (cats.grill / maxCat) * 100, money(cats.grill)) +
      bar("$ Kitchen", (cats.kitchen / maxCat) * 100, money(cats.kitchen)) +
      bar("$ Bar", (cats.bar / maxCat) * 100, money(cats.bar)) +
      bar("$ Other", (cats.other / maxCat) * 100, money(cats.other));

    const rows = document.getElementById("book-rows");
    rows.innerHTML = bookings.map(function (b) {
      return "<tr>" +
        "<td>" + escapeHtml(b.id) + "</td>" +
        "<td>" + escapeHtml(b.date) + "<br>" + escapeHtml(b.time) + "</td>" +
        "<td>" + escapeHtml(b.name) + "<br>" + escapeHtml(b.phone) + "</td>" +
        "<td>" + b.party + "</td>" +
        "<td class='st " + b.status + "'>" + b.status + "</td>" +
        "<td class='actions'>" + actions(b) + "</td>" +
        "</tr>";
    }).join("") || "<tr><td colspan='6'>No bookings yet.</td></tr>";

    const foodPct = t.revenue ? (t.food / t.revenue) * 100 : 0;
    const laborPct = t.revenue ? (t.labor / t.revenue) * 100 : 0;
    document.getElementById("bars").innerHTML =
      bar("Food cost (target)", foodPct) +
      bar("Labor (target)", laborPct) +
      bar("Fixed (rent + utilities) as % of sales", t.revenue ? (t.fixed / t.revenue) * 100 : 0);

    const b = Gjuras.getBudget();
    document.getElementById("b-rent").value = b.weeklyRent || 0;
    document.getElementById("b-util").value = b.weeklyUtilities || 0;
    document.getElementById("b-food").value = b.weeklyFoodTargetPct || 0;
    document.getElementById("b-labor").value = b.weeklyLaborTargetPct || 0;

    document.getElementById("stock-rows").innerHTML = Gjuras.getStock().map(function (s) {
      const low = s.qty < s.par ? " class='pending'" : "";
      return "<tr>" +
        "<td>" + escapeHtml(s.name) + "</td>" +
        "<td" + low + ">" + s.qty + " " + escapeHtml(s.unit) + "</td>" +
        "<td>" + s.par + "</td>" +
        "<td class='actions'>" +
          "<button type='button' data-stock='" + s.id + "' data-delta='-1'>−</button>" +
          "<button type='button' data-stock='" + s.id + "' data-delta='1'>+</button>" +
        "</td></tr>";
    }).join("");
  }

  function kpi(label, value, note, good) {
    const cls = good === false ? "down" : "";
    return "<div class='kpi'><span>" + label + "</span><strong>" + value + "</strong><em class='" + cls + "'>" + note + "</em></div>";
  }

  function bar(label, pct, extra) {
    const w = Math.max(0, Math.min(100, pct));
    const cls = w <= 35 ? "ok" : "";
    const right = extra || (w.toFixed(0) + "%");
    return "<div class='bar-row'><b><span>" + label + "</span><span>" + right + "</span></b><div class='track'><div class='fill " + cls + "' style='width:" + w + "%'></div></div></div>";
  }

  function actions(b) {
    if (b.status === "cancelled" || b.status === "completed") return "";
    const bits = [];
    if (b.status === "pending") bits.push(btn(b.id, "confirmed", "Confirm"));
    if (b.status === "confirmed") bits.push(btn(b.id, "seated", "Seat"));
    if (b.status === "seated") bits.push(btn(b.id, "completed", "Paid"));
    bits.push(btn(b.id, "cancelled", "Cancel"));
    return bits.join("");
  }

  function btn(id, status, label) {
    return "<button type='button' data-id='" + id + "' data-status='" + status + "'>" + label + "</button>";
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    err.textContent = "";
    Gjuras.login(
      document.getElementById("email").value,
      document.getElementById("password").value
    ).then(function (res) {
      if (!res.ok) { err.textContent = res.error; return; }
      showDesk();
    });
  });

  document.getElementById("logout").addEventListener("click", function () {
    Gjuras.logout();
    location.reload();
  });

  document.getElementById("book-rows").addEventListener("click", function (e) {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;
    Gjuras.updateBooking(btn.dataset.id, { status: btn.dataset.status });
    render();
  });

  document.getElementById("stock-rows").addEventListener("click", function (e) {
    const btn = e.target.closest("button[data-stock]");
    if (!btn) return;
    const item = Gjuras.getStock().find(s => s.id === btn.dataset.stock);
    if (!item) return;
    Gjuras.setStockQty(item.id, item.qty + Number(btn.dataset.delta));
    render();
  });

  document.getElementById("log-ticket").addEventListener("click", function () {
    const res = Gjuras.addTicket({
      amount: document.getElementById("t-amount").value,
      tender: document.getElementById("t-tender").value,
      category: document.getElementById("t-cat").value,
      note: document.getElementById("t-note").value
    });
    const el = document.getElementById("ticket-msg");
    if (!res.ok) { el.textContent = res.error; return; }
    el.textContent = "";
    document.getElementById("t-amount").value = "";
    document.getElementById("t-note").value = "";
    render();
  });

  document.getElementById("save-budget").addEventListener("click", function () {
    Gjuras.setBudget({
      weeklyRent: Number(document.getElementById("b-rent").value) || 0,
      weeklyUtilities: Number(document.getElementById("b-util").value) || 0,
      weeklyFoodTargetPct: Number(document.getElementById("b-food").value) || 0,
      weeklyLaborTargetPct: Number(document.getElementById("b-labor").value) || 0
    });
    render();
  });

  if (Gjuras.currentSession()) showDesk();
})();
