# Gjuras

1560 Bath Ave · 315-231-5541  
food, coffee and good times

## Open in VS Code

1. Unzip so the folder contains `index.html`, `manager.html`, `js/`, `images/`.
2. File → Open Folder on that folder.
3. Install the **Live Server** extension.
4. Right-click `index.html` → Open with Live Server.

Click the right-hand door with the handle. That leaf swings. You are in the room.

- Click the dining room or **Reserve a table** → booking form. You get a confirmation code.
- Click the bar → menu.
- **Staff** in the header → manager desk.

## Demo staff login

```
manager@gjuras.local
BathAve1560!
```

Change this before anyone real uses it. The password is hashed in the browser and the session lives in `sessionStorage` for 8 hours. That is a **prototype**, not bank-grade auth.

## Do not lie to a owner about this file

This zip is a floor demo plus a staff notebook that lives in one browser. It is not Toast. It is not OpenTable. It is not PCI. Two phones do not share one book. A teenager with DevTools can read the hashed demo password flow. If you tell an owner it is "bank secure" you are selling fiction.

What it is good for: walk through the door, show the paper menu on a screen, take a sample reservation, log a cash/card ticket, tap stock up and down. That is the pitch. The $500–$1000 job is hosting this on HTTPS and wiring the notebook to a real database.

## What is real vs placeholder

Real from the photo: name, phone, address, storefront.

Placeholder until you shoot the room: interior photo, bar photo, dish photos, menu prices.

Working on this machine:

- Reservation requests write to `localStorage` and show up on the staff desk.
- Staff can Confirm → Seat → Paid / Cancel.
- Seating a party adds covers and dollars to the week so the budget bars move.
- Login lockout after five bad tries (one minute).

Not real yet (needs a host + a backend):

- HTTPS in production (Netlify / Cloudflare Pages turn it on for free).
- A server that stores bookings if two managers use two phones.
- Card payments, Uber Eats, DoorDash.
- POS sales pulled from Toast / Square instead of the seed numbers.

## Put it on HTTPS

Drag the folder onto https://app.netlify.com/drop  
or Cloudflare Pages. `netlify.toml` already sets frame-deny, nosniff, HSTS, CSP.

## Production next step (when they pay)

Swap `js/store.js` for Supabase or Firebase:

- Email/password or magic link for managers
- `bookings` table with row-level security
- Optional Stripe or Square for deposits
- Toast / Square sales CSV or API into the week view

Until then this is the floor + the desk, running in the browser.
