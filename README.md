# Gjuras

**1560 Bath Avenue**  
315-231-5541  
Food, coffee and good times

Public site: https://sbelykh248.github.io/Gjuras/

This folder is the guest site and the staff desk for Gjuras. Guests see the storefront, the menu, and a table request. Managers see reservations, daily tickets by station, and a simple stock list.

---

## Staff desk

Address: `manager.html` on the same site  
https://sbelykh248.github.io/Gjuras/manager.html

| | |
|---|---|
| Email | `manager@gjuras.local` |
| Password | `BathAve1560!` |

Change this password before any live use. The current login is for demonstration only.

---

## How to open it

**Preferred:** the GitHub Pages link above (HTTPS). Use this on the laptop and the phone.

**Local preview:** unzip so `index.html` sits next to `js/` and `images/`. In that folder run Live Server, or:

```text
python -m http.server 5500
```

Then open `http://127.0.0.1:5500/`  
Do not double-click the HTML file for a client meeting.

---

## What guests can do

- Enter from the storefront
- Read the menu
- Request a table (name plus phone or email)
- Call the house

## What staff can do

- Sign in to the desk
- See and update reservation status
- Log a cash or card ticket by station (grill, kitchen, bar)
- Adjust walk-in stock against par

---

## Scope

This build is a working front and a working desk for approval. Reservations on the public link stay on each browser until a shared database is connected. Guest texts and card deposits are not included.

Next paid step: host plus a shared book (Firebase or Supabase) and, if required, email or SMS confirmation.

---

## Contact for this project

Replace hours and the About paragraph with copy from the family before calling the site final.
