# Same-day sell — what is real

You can take $500 today for a live brochure with a door, a menu, a call button, and a hosted URL. You cannot take $1000 today for OpenTable + Twilio + a shared book unless those accounts exist before you walk in.

## Can be live this afternoon (do these, in order)

1. Buy the domain they want, or use a Netlify subdomain. Same day.
2. Drag this folder onto https://app.netlify.com/drop. You get HTTPS in minutes. Without this step the site is a file on your laptop. Do not demo off `file://` to an owner.
3. Confirm name, address, phone against the sign. Already in the photo.
4. Put real hours on the About line. They are blank on purpose.
5. Add a Google Maps pin (link is in About). Confirm it drops on 1560 Bath Ave.
6. Print or PDF the paper menu vs the screen. Prices must match the sheet they signed.
7. Change the staff password in `js/store.js` and README. The demo password is public.
8. Click-to-call on a real phone. If 315-231-5541 is wrong, you look like a thief.
9. One sentence on what you do with a guest phone/email. Collecting numbers with no policy is how you get yelled at, not sued first — still do it.
10. Walk the site on a phone in one hand and a laptop in the other. Door crop changes per screen.

That list is the industry floor for a small restaurant marketing site: NAP, hours, menu, call, map, HTTPS. Square/Toast sites ship with exactly this plus order buttons.

## Cannot be sold as “works the same day” unless the owner already has accounts

- Shared reservation book on two phones — needs Supabase/Firebase or OpenTable. localStorage is one browser.
- SMS + email confirmations — needs Twilio + Resend/Postmark and a paid from-number. This zip will not text you.
- Card deposits — Stripe or Square, business bank, tax ID.
- Delivery — Uber Eats / DoorDash merchant pages. Link out. Do not rebuild them.
- POS sales in the desk — CSV from Square/Toast or their API. Manual ticket log is a stand-in.
- Real interior photos — they said they will reshoot. AI plates are a demo, not a listing.

## Missing pieces ranked by “you will get caught”

1. Hours
2. Hosted HTTPS URL
3. Password change
4. Menu price audit
5. Privacy one-liner + how to delete a booking
6. Real room photo
7. Backend book (only if you promised “the hostess phone updates live”)
8. Twilio (only if you promised “the guest gets a text”)

## What this next file actually added

- Door leaf sized to the marked frame, hinge on the tree side, handle is the real handle in the photo.
- Maps link, hours stub, footer note on data.
- Same reservation form: phone, email, or both — stored on this device.

If the pitch is “walk through the door, read the menu, request a table,” sell today after items 1–10. If the pitch is “this replaces the book and texts the guest,” do not walk in until a host and Twilio exist.
