(function () {
  const TIMES = ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];
  const front = document.getElementById("front");
  const reserveModal = document.getElementById("reserve-modal");
  const menuModal = document.getElementById("menu-modal");
  const slotsEl = document.getElementById("slots");
  const msg = document.getElementById("book-msg");
  let pickedTime = "19:00";

  function enter() {
    if (front.classList.contains("opening")) return;
    front.classList.add("opening");
    setTimeout(function () {
      document.body.classList.add("in");
      front.classList.add("gone");
    }, 1180);
  }

  document.getElementById("doors").addEventListener("click", enter);
  const enterBtn = document.getElementById("enter-door");
  if (enterBtn) enterBtn.addEventListener("click", enter);

  function todayISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  function renderSlots() {
    const date = document.getElementById("r-date").value || todayISO();
    slotsEl.innerHTML = "";
    TIMES.forEach(function (t) {
      const used = Gjuras.slotCount(date, t);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "slot" + (used >= Gjuras.SLOT_CAP ? " full" : "") + (t === pickedTime ? " on" : "");
      b.textContent = used >= Gjuras.SLOT_CAP ? t + " full" : t;
      if (used < Gjuras.SLOT_CAP) {
        b.addEventListener("click", function () {
          pickedTime = t;
          renderSlots();
        });
      }
      slotsEl.appendChild(b);
    });
  }

  function openReserve() {
    document.getElementById("r-date").value = todayISO();
    document.getElementById("r-date").min = todayISO();
    msg.textContent = "";
    renderSlots();
    reserveModal.classList.add("show");
  }

  function openMenu() { menuModal.classList.add("show"); }

  document.getElementById("r-date").addEventListener("change", renderSlots);
  document.getElementById("nav-reserve").addEventListener("click", openReserve);
  document.getElementById("nav-menu").addEventListener("click", openMenu);
  document.getElementById("table-hit").addEventListener("click", openReserve);
  document.getElementById("bar-hit").addEventListener("click", openMenu);

  document.querySelectorAll("[data-close]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      reserveModal.classList.remove("show");
      menuModal.classList.remove("show");
    });
  });
  [reserveModal, menuModal].forEach(function (el) {
    el.addEventListener("click", function (e) {
      if (e.target === el) el.classList.remove("show");
    });
  });

  document.getElementById("book").addEventListener("click", function () {
    const result = Gjuras.addBooking({
      name: document.getElementById("r-name").value.trim(),
      phone: document.getElementById("r-phone").value.trim(),
      email: document.getElementById("r-email").value.trim(),
      date: document.getElementById("r-date").value,
      time: pickedTime,
      party: document.getElementById("r-party").value,
      notes: document.getElementById("r-notes").value.trim()
    });
    if (!result.ok) {
      msg.className = "msg err";
      msg.textContent = result.error;
      return;
    }
    msg.className = "msg ok";
    const b = result.booking;
    const bits = [];
    if (b.phone) bits.push("text to " + b.phone);
    if (b.email) bits.push("email to " + b.email);
    msg.textContent = "Booked " + b.id + " · " + b.date + " " + b.time + " · " + bits.join(" and ") + ". Open Staff to see it.";
    renderSlots();
  });
})();
