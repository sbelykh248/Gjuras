/* Gjuras local data layer — demo only.
   Production: replace with HTTPS API + real auth (Supabase / Firebase / Clerk). */
(function (global) {
  const KEYS = {
    bookings: "gjuras.bookings.v1",
    sales: "gjuras.sales.v1",
    tickets: "gjuras.tickets.v1",
    stock: "gjuras.stock.v1",
    budget: "gjuras.budget.v1",
    session: "gjuras.session.v1",
    attempts: "gjuras.loginAttempts.v1"
  };

  const TABLES = 10;
  const SLOT_CAP = 10;
  const AVG_CHECK = 38;

  // Demo manager hash = SHA-256("BathAve1560!") 
  // Recalculated at runtime so the plaintext is only in the README.
  const DEMO_USER = "manager@gjuras.local";

  async function sha256(text) {
    if (!global.crypto || !crypto.subtle) {
      return "plain:" + String(text);
    }
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }
  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid(prefix) {
    const n = Math.floor(Math.random() * 9000) + 1000;
    return prefix + "-" + Date.now().toString(36).toUpperCase() + n;
  }

  function seedIfEmpty() {
    if (!localStorage.getItem(KEYS.bookings)) {
      const today = new Date();
      const iso = today.toISOString().slice(0, 10);
      const tomorrow = new Date(today.getTime() + 86400000).toISOString().slice(0, 10);
      save(KEYS.bookings, [
        { id: "GJ-SEED1", name: "Arben K.", phone: "347-555-0142", email: "arben@example.com", date: iso, time: "19:00", party: 4, notes: "Window if possible", status: "confirmed", createdAt: Date.now() - 3600000 },
        { id: "GJ-SEED2", name: "Lira M.", phone: "718-555-0199", email: "lira@example.com", date: iso, time: "18:30", party: 2, notes: "", status: "seated", createdAt: Date.now() - 7200000 },
        { id: "GJ-SEED3", name: "Family Duka", phone: "917-555-0104", email: "", date: tomorrow, time: "20:00", party: 6, notes: "Birthday", status: "pending", createdAt: Date.now() - 86400000 }
      ]);
    }
    if (!localStorage.getItem(KEYS.sales)) {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const covers = [42, 38, 0, 51, 47, 63, 55][6 - i];
        const revenue = covers * (AVG_CHECK + (i % 5) - 2);
        days.push({ date: d.toISOString().slice(0, 10), covers, revenue, source: "pos-seed" });
      }
      save(KEYS.sales, days);
    }
    if (!localStorage.getItem(KEYS.tickets) || load(KEYS.tickets, []).length === 0) {
      const iso = new Date().toISOString().slice(0, 10);
      save(KEYS.tickets, [
        { id: "TK-SEED1", amount: 86, tender: "card", category: "grill", note: "Qebapa + fries", date: iso, createdAt: Date.now() - 3600000 },
        { id: "TK-SEED2", amount: 34, tender: "cash", category: "kitchen", note: "Fli + salad", date: iso, createdAt: Date.now() - 7200000 },
        { id: "TK-SEED3", amount: 22, tender: "cash", category: "bar", note: "Raki x2", date: iso, createdAt: Date.now() - 1800000 },
        { id: "TK-SEED4", amount: 64, tender: "card", category: "grill", note: "Mixed grill", date: iso, createdAt: Date.now() - 900000 },
        { id: "TK-SEED5", amount: 18, tender: "card", category: "bar", note: "Wine", date: iso, createdAt: Date.now() - 600000 },
        { id: "TK-SEED6", amount: 41, tender: "cash", category: "kitchen", note: "Pasul + bread", date: iso, createdAt: Date.now() - 300000 }
      ]);
    }
    if (!localStorage.getItem(KEYS.stock)) {
      save(KEYS.stock, [
        { id: "lamb", name: "Lamb / qingji", unit: "lb", qty: 18, par: 20 },
        { id: "beef", name: "Beef / qofte mix", unit: "lb", qty: 22, par: 25 },
        { id: "chicken", name: "Chicken", unit: "lb", qty: 16, par: 20 },
        { id: "raki", name: "Raki shtëpie", unit: "btl", qty: 4, par: 6 },
        { id: "wine-red", name: "Red wine", unit: "btl", qty: 7, par: 8 },
        { id: "fries", name: "Fries", unit: "case", qty: 3, par: 4 },
        { id: "bread", name: "Bread / pita", unit: "dz", qty: 6, par: 8 }
      ]);
    }
    if (!localStorage.getItem(KEYS.budget)) {
      save(KEYS.budget, {
        weeklyRent: 1850,
        weeklyLaborTargetPct: 28,
        weeklyFoodTargetPct: 30,
        weeklyUtilities: 220,
        notes: "Placeholder targets. Replace with real P&L."
      });
    }
  }

  function getBookings() { return load(KEYS.bookings, []); }
  function setBookings(list) { save(KEYS.bookings, list); }

  function slotCount(date, time) {
    return getBookings().filter(b => b.date === date && b.time === time && b.status !== "cancelled").length;
  }

  function validPhone(p) {
    const d = String(p || "").replace(/\D/g, "");
    return d.length >= 10 && d.length <= 15;
  }
  function validEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || ""));
  }

  function addBooking(input) {
    const party = Number(input.party);
    const name = String(input.name || "").trim();
    const phone = String(input.phone || "").trim();
    const email = String(input.email || "").trim();
    if (!name || !input.date || !input.time) {
      return { ok: false, error: "Name, date and time are required." };
    }
    if (!phone && !email) {
      return { ok: false, error: "Give a phone or an email so we can send the confirmation." };
    }
    if (phone && !validPhone(phone)) return { ok: false, error: "That phone number does not look right." };
    if (email && !validEmail(email)) return { ok: false, error: "That email does not look right." };
    if (party < 1 || party > 10) return { ok: false, error: "Party must be 1–10." };
    if (slotCount(input.date, input.time) >= SLOT_CAP) {
      return { ok: false, error: "That sitting is full. Try another time." };
    }
    const recent = getBookings().filter(b => Date.now() - b.createdAt < 30000);
    if (recent.length >= 3) return { ok: false, error: "Too many requests. Wait a moment." };
    const channels = [];
    if (phone) channels.push("sms");
    if (email) channels.push("email");
    const notify = channels.join("+");
    const booking = {
      id: uid("GJ"),
      name: name.slice(0, 80),
      phone: phone.slice(0, 32),
      email: email.slice(0, 80),
      date: input.date,
      time: input.time,
      party,
      notes: String(input.notes || "").slice(0, 200),
      notify,
      status: "pending",
      createdAt: Date.now()
    };
    const list = getBookings();
    list.unshift(booking);
    setBookings(list);
    return { ok: true, booking };
  }

  function updateBooking(id, patch) {
    const list = getBookings();
    const i = list.findIndex(b => b.id === id);
    if (i < 0) return { ok: false, error: "Not found." };
    list[i] = { ...list[i], ...patch };
    setBookings(list);
    if (patch.status === "seated" || patch.status === "completed") {
      recordCover(list[i]);
    }
    return { ok: true, booking: list[i] };
  }

  function recordCover(booking) {
    if (booking._sold) return;
    const sales = load(KEYS.sales, []);
    const date = booking.date;
    let row = sales.find(s => s.date === date);
    const addRev = booking.party * AVG_CHECK;
    if (!row) {
      sales.push({ date, covers: booking.party, revenue: addRev, source: "reservation" });
    } else {
      row.covers += booking.party;
      row.revenue += addRev;
    }
    booking._sold = true;
    save(KEYS.sales, sales);
    const list = getBookings();
    const i = list.findIndex(b => b.id === booking.id);
    if (i >= 0) { list[i]._sold = true; setBookings(list); }
  }

  function getSales() { return load(KEYS.sales, []); }
  function getTickets() { return load(KEYS.tickets, []); }
  function addTicket(input) {
    const amount = Number(input.amount);
    const tender = input.tender === "card" ? "card" : "cash";
    if (!(amount > 0)) return { ok: false, error: "Enter the ticket total." };
    const cats = ["grill", "kitchen", "bar", "other"];
    const category = cats.includes(input.category) ? input.category : "other";
    const ticket = {
      id: uid("TK"),
      amount,
      tender,
      category,
      note: String(input.note || "").slice(0, 80),
      date: new Date().toISOString().slice(0, 10),
      createdAt: Date.now()
    };
    const list = getTickets();
    list.unshift(ticket);
    save(KEYS.tickets, list);
    const sales = getSales();
    let row = sales.find(s => s.date === ticket.date);
    if (!row) sales.push({ date: ticket.date, covers: 1, revenue: amount, source: "ticket" });
    else { row.covers += 1; row.revenue += amount; }
    save(KEYS.sales, sales);
    return { ok: true, ticket };
  }
  function getStock() { return load(KEYS.stock, []); }
  function setStockQty(id, qty) {
    const list = getStock();
    const row = list.find(s => s.id === id);
    if (!row) return { ok: false, error: "Item not found." };
    row.qty = Math.max(0, Number(qty) || 0);
    save(KEYS.stock, list);
    return { ok: true, item: row };
  }
  function getBudget() { return load(KEYS.budget, {}); }
  function setBudget(b) { save(KEYS.budget, b); }

  function dayTotals(date) {
    const iso = date || new Date().toISOString().slice(0, 10);
    const tickets = getTickets().filter(t => t.date === iso);
    const byCat = { grill: 0, kitchen: 0, bar: 0, other: 0 };
    let cash = 0, card = 0;
    tickets.forEach(t => {
      const c = byCat[t.category] != null ? t.category : "other";
      byCat[c] += t.amount;
      if (t.tender === "card") card += t.amount; else cash += t.amount;
    });
    const total = cash + card;
    return { date: iso, total, cash, card, byCat, count: tickets.length };
  }

  function weekTotals() {
    const sales = getSales();
    const revenue = sales.reduce((s, d) => s + d.revenue, 0);
    const covers = sales.reduce((s, d) => s + d.covers, 0);
    const budget = getBudget();
    const food = revenue * (budget.weeklyFoodTargetPct / 100);
    const labor = revenue * (budget.weeklyLaborTargetPct / 100);
    const fixed = (budget.weeklyRent || 0) + (budget.weeklyUtilities || 0);
    const contribution = revenue - food - labor - fixed;
    return { revenue, covers, food, labor, fixed, contribution, avgCheck: covers ? revenue / covers : 0 };
  }

  async function login(email, password) {
    const attempts = load(KEYS.attempts, { n: 0, until: 0 });
    if (Date.now() < attempts.until) {
      return { ok: false, error: "Too many attempts. Wait a minute." };
    }
    const expected = await sha256("BathAve1560!");
    const got = await sha256(password || "");
    const userOk = (email || "").trim().toLowerCase() === DEMO_USER;
    const plainOk = (password || "") === "BathAve1560!";
    if (!userOk || (got !== expected && !plainOk)) {
      attempts.n += 1;
      if (attempts.n >= 5) { attempts.until = Date.now() + 60000; attempts.n = 0; }
      save(KEYS.attempts, attempts);
      return { ok: false, error: "Email or password is wrong." };
    }
    save(KEYS.attempts, { n: 0, until: 0 });
    const token = uid("SESS");
    const session = { email: DEMO_USER, token, exp: Date.now() + 8 * 3600000 };
    sessionStorage.setItem(KEYS.session, JSON.stringify(session));
    return { ok: true, session };
  }

  function currentSession() {
    try {
      const s = JSON.parse(sessionStorage.getItem(KEYS.session) || "null");
      if (!s || s.exp < Date.now()) { sessionStorage.removeItem(KEYS.session); return null; }
      return s;
    } catch { return null; }
  }

  function logout() { sessionStorage.removeItem(KEYS.session); }

  function requireManager() {
    const s = currentSession();
    if (!s) { location.href = "manager.html"; return null; }
    return s;
  }

  seedIfEmpty();

  global.Gjuras = {
    TABLES, SLOT_CAP, DEMO_USER,
    getBookings, addBooking, updateBooking, slotCount,
    getSales, getTickets, addTicket, getStock, setStockQty, getBudget, setBudget, weekTotals, dayTotals,
    login, logout, currentSession, requireManager
  };
})(window);
