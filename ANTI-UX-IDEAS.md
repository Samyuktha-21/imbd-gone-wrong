# UI Gone Bad — Anti-UX Idea Bank

A running list of deliberately-terrible-but-fully-functional UI/UX mechanics.
Rule for all of these: the feature must still *work* — it just has to be
confusing, backwards, or annoying to get there.

---

## Cursor & Pointer Chaos

- Nav bar (or any target) **repels the cursor** — slides away as you approach, catchable if you corner it against a screen edge.
- Target **shatters into jigsaw pieces** on cursor contact; pieces scatter across the screen and must be dragged back into place **within a time limit** or it re-shatters.
- **Decoy cursors**: several fake cursors on screen move in sync-but-offset patterns with the real one; only one is "hot" (actually clicks).
- Cursor **inverts** (moves opposite to hand movement) inside certain zones.
- Cursor **randomly teleports** a few pixels off on click, so you miss by a hair the first time.
- Click-through decoy: cursor visually hovers a button but the real hotspot is offset several px away from the rendered cursor tip.
- Cursor leaves a **trail of fake cursors** that linger and can be mistaken for the real one.
- Right-click / long-press required for actions that look left-click-able.
- Cursor **grows or shrinks** the closer it gets to an important button, overshooting the target.

## Navigation & Wayfinding

- Nav items **shuffle order** every N seconds.
- Nav bar **physically relocates** (top → side → bottom) between pages.
- "Back" button navigates **random** previous page.
- Breadcrumbs that describe a path you never took.
- Search bar **teleports** to a new spot on the page after every search.
- A hidden "real" nav only revealed by scrolling in an unnatural direction (e.g. scroll up to go further into the site).
- Sitemap/menu that **requires solving a mini-maze** (drag a dot through a labyrinth) to unlock a submenu.
- Logo that normally goes home instead goes to a random page each click.

## Buttons & Controls

- Buttons **labeled the opposite** of what they do ("Add to Cart" removes an item, "Skip" restarts the track).
- Primary CTA **dodges the cursor** on hover for a few attempts before allowing a click.
- **Tiny hitbox** for confirm, **giant hitbox** for cancel (or vice versa depending on mood).
- Buttons that require a **specific hold duration** (long-press) with no visual affordance telling you so.
- Double-negative confirmations ("Uncheck to not skip not agreeing").
- A slider that must be dragged to an **exact, unmarked** position to register.
- Button that **relabels itself** on every hover ("Buy Now" → "Are you sure?" → "Really?" → "OK fine, Buy Now").
- Drag-to-confirm slider that **snaps back** unless dragged at a minimum speed.
- Keyboard-only button (mouse click does nothing, tooltip never says so).
- Button/label **font size shrinks** the closer the cursor gets to it, bottoming out at a barely-legible size right as you're about to click.

## Feedback & Timing

- Fake progress bar that hits **99% and freezes**, or **runs backwards** intermittently before completing.
- Success toast flashes for ~200ms, immediately followed by a contradicting "Actually, it failed" toast (action still succeeded).
- Deliberate multi-second spinner on trivial actions (toggling a checkbox, opening a dropdown).
- Loading skeleton that loops forever the first time, then instantly resolves on a page refresh.
- Notification badge count that **never matches** the actual number of notifications.
- Autosave indicator that says "Saving..." indefinitely while autosave actually works fine in the background.
- **Background color shifts** to a new (jarring or clashing) color every time any button is clicked anywhere on the site, forcing constant visual re-adjustment.

## Popups & Modals

- Cookie/newsletter popup **reopens** a few seconds after closing (capped at N times so it's annoying, not infinite).
- Modal's X (close) button **sometimes opens another modal** instead of closing.
- Modal that can only be closed by **dragging it off-screen**, not clicking X.
- "Are you sure?" confirmation chains — confirming a confirmation of a confirmation (3-4 levels deep) for a trivial action.
- Popup where the **only visible button is "Cancel"** and "Confirm" is scrolled off-screen inside the modal.
- Modal that **shrinks** every time you try to read it, forcing you to zoom in.

## Forms & Input

- Validation errors that say **"Something is wrong"** without ever saying what.
- Dropdown options in a **deliberately illogical order** (not alphabetical, not numerical) requiring full scroll-through.
- "Remember me" checkbox that **visibly unchecks itself** right before submit.
- Text input that **retypes your input in reverse** as a preview, then submits it correctly (pure jump-scare, no real harm).
- Password field with a **strength meter that's always wrong** (says "Weak" for a strong password and vice versa).
- Autocomplete suggestions that are **all wrong on purpose**, correct answer never appears in the list.
- Form that **resets a random field** every time you fix an error in another field.
- Date picker that only lets you navigate **one month at a time, backwards**.

## Content & Layout

- Infinite scroll that **periodically snaps back to the top** without warning.
- Important text rendered in **low-contrast / tiny font** unless highlighted/selected.
- Auto-advancing carousel that moves **faster than any human can read**, pausable only via an undiscoverable hotspot.
- Page **zooms in/out slightly** on scroll, requiring constant re-centering.
- Content that reflows/reorders itself every time the window is resized, even by 1px.
- "Read more" that expands the **wrong section**.
- Sticky header that grows taller the more you scroll, eventually covering half the viewport.
- Body text rendered **mirrored (flipped horizontally)**, readable only by holding it up to an actual mirror or via browser dev tools — toggles back to normal briefly on hover/selection as a mercy.
- Product/media images rendered with a **wavy underwater distortion** (rippling refraction effect) so you can't quite make out details until you hover to "surface" them.
- Images buried under a **thick, shifting watermark pattern** that drifts around the image, occasionally fully covering the focal point.
- Combine both: mirrored captions **under** watermarked/underwater images, so neither the picture nor its label is legible at a glance.
- **Random language switch**: the whole site's language randomly changes (English → Spanish → Japanese → ...) on page load or at intervals, forcing you to either know multiple languages or hunt for the language switcher (which is itself labeled in whatever random language is currently active).

## Visibility / Reveal

- **Flashlight mode — the site's base state, not a one-off gag.** Every page loads fully blank/blacked-out; a small circular "spotlight" follows the cursor and reveals only the patch of UI directly underneath it. This is the default condition of the *entire* site (nav, content, everything), not a single-page effect — all other gags in this list happen underneath/inside this fog.
- The spotlight radius is driven by a single **CSS custom property** (e.g. `--spotlight-radius`), editable live via **browser Inspect/devtools** — the one sanctioned "cheat": a curious/frustrated user who thinks to open devtools and crank the variable gets a bigger window, rewarding exploration outside the page itself.
- Spotlight radius **shrinks over time** the longer you stay on a page, forcing you to act fast, reload, or go widen `--spotlight-radius` yourself.
- Spotlight occasionally **jumps to a random offset** from the actual cursor position for a second, revealing the wrong area.

## Puzzle / Mini-Game Gags

- Jigsaw nav bar reassembly (see Cursor section) — timed drag-and-drop puzzle blocking navigation.
- A **CAPTCHA-style gate** for mundane actions ("prove you're human to view your cart") with a deliberately unsolvable-looking but actually-easy puzzle.
- **"Prove you're human" math CAPTCHA that only an AI can solve**: instead of a simple arithmetic check, the gate presents a genuinely hard problem (multi-step calculus, a olympiad-style proof-based question, or a gnarly word problem) that's effectively impossible to do in your head in a reasonable time — the joke being the "human verification" gate actually requires you to paste it into ChatGPT/an AI tool to get through. Answer-checking should accept any reasonably-formatted correct final value (numeric tolerance / basic normalization) so it doesn't become a real dead end.
- Simon-says color sequence required to "confirm" a purchase.
- A slider puzzle (15-puzzle style) that must be solved to reveal the checkout button.
- Whack-a-mole: the "submit" button hides among decoys that pop up and down; correct one is subtly marked.

## Shop-Flow Specific (Cart / Checkout)

- Cart total **recalculates with a "convenience fee"** that changes value every time you look at it.
- Quantity stepper where **"+" sometimes decreases** and "−" sometimes increases.
- Checkout progress bar with **steps that reorder** each time you advance.
- "Apply Coupon" field that accepts any code but always **applies a random, different discount** than expected (never negative for the user, just unpredictable).
- Remove-from-cart button that instead **duplicates** the item once before it starts removing it.
- Shipping address form fields that **swap labels** (City field labeled "ZIP," etc.) but validate correctly regardless.

## Media-Flow Specific (Player / Library)

- Shuffle mode that **repeats the same 3 items** in a loop before actually shuffling.
- Volume slider that's **inverted** (drag up to lower volume).
- "Continue Watching/Listening" that **never remembers the timestamp**, always restarts, but very convincingly shows a progress bar first.
- Play/Pause icon that's **always showing the wrong current state**.
- Seek bar that only lets you skip **backward**, never forward (must wait it out or restart).
- "Next" button in a queue that instead plays a **random unrelated item**.
- Like/heart button that requires a **long-press**; a single tap does something unrelated (e.g., adds to a random playlist).
- Every "Play" press opens the **rickroll pre-roll window** (see Interstitials / Fake Ads) before the real track/video starts — framed exactly like an unskippable ad.

## Interstitials / Fake Ads

- **Rickroll gate**: any "play" action opens a window that force-plays a segment of Rick Astley's "Never Gonna Give You Up" (unskippable for a set duration, like an unskippable pre-roll ad) before the actual content starts.
- A fake "Skip Ad in 5s" countdown appears on the rickroll window but the countdown **never reaches 0** — it resets to 5 once or twice before finally letting you skip.
- Randomize which action triggers it (not just "play" — sometimes "buy," "like," or "next" trigger a surprise rickroll window instead of their real function, then proceed after).
- Close button on the rickroll window is present but **non-functional** until the mandatory watch time elapses (must be clearly telegraphed once it becomes clickable, so it's a bit, not a trap).

## Account / Auth Specific

- Login form where **Caps Lock silently changes which field you're typing into**.
- "Forgot password" flow that **works perfectly** but is buried 4 menus deep under deliberately misleading labels.
- Logout button that asks **"Are you sure you want to log in?"** (mislabeled confirmation).
- Profile settings save button that only activates after you've **touched every field**, even ones you didn't mean to change.

## Sound / Motion (use sparingly — must stay stoppable)

- Short, mildly annoying sound sting on hover of key elements (never on every hover — that would ruin the joke fast).
- UI elements with a persistent **subtle jitter/shake** that stops only when actively focused/hovered.
- Background element that **very slowly drifts**, so the whole page feels "off" without an obvious single cause.

---

## Notes for later
- Keep every gag **fully functional and finishable** — frustration is the feature, dead ends are not.
- Most gags should be **capped/tunable** (max popup reopens, max jigsaw re-shatters) so the site is a fun torment, not literally unusable in a demo.
- **Flashlight mode is the base layer for the whole site**, not an item to pick alongside the others — every other gag (nav, buttons, popups, etc.) gets built to live inside the fog. Build/prototype this first since it changes how everything else is demoed/tested.
- Good candidates to prototype next (high novelty, unclaimed by any existing meme site): jigsaw nav bar, decoy cursors, button relabeling on hover, cart convenience fee, inverted volume slider.
