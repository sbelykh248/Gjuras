(function (global) {
  const cfg = global.GJURAS_FB || {};
  const ready = !!(cfg.projectId && cfg.apiKey && global.firebase);
  async function start() {
    if (!ready) {
      global.GjurasSync = { ready: false, pushBooking: function () {}, pushTicket: function () {} };
      return;
    }
    firebase.initializeApp(cfg);
    await firebase.auth().signInAnonymously();
    const db = firebase.firestore();
    const books = db.collection("gjuras_bookings");
    const tickets = db.collection("gjuras_tickets");
    books.onSnapshot(function (snap) {
      const list = [];
      snap.forEach(function (doc) { list.push(doc.data()); });
      list.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
      localStorage.setItem("gjuras.bookings.v1", JSON.stringify(list));
      global.dispatchEvent(new Event("gjuras-sync"));
    });
    tickets.onSnapshot(function (snap) {
      const list = [];
      snap.forEach(function (doc) { list.push(doc.data()); });
      localStorage.setItem("gjuras.tickets.v1", JSON.stringify(list));
      global.dispatchEvent(new Event("gjuras-sync"));
    });
    global.GjurasSync = {
      ready: true,
      pushBooking: function (b) { if (b && b.id) books.doc(b.id).set(b); },
      pushTicket: function (t) { if (t && t.id) tickets.doc(t.id).set(t); }
    };
  }
  start().catch(function (e) { console.warn("Gjuras sync off", e); });
})(window);
