# Anti-UX Implementation Checklist

Every mechanic in [ANTI-UX-IDEAS.md](ANTI-UX-IDEAS.md), with status.

- `[x]` built and tested
- `[ ]` not built yet
- `[—]` deliberately excluded — reason given

**Ground rule for all of it** (from the top of the ideas doc): the feature must
still *work*. Frustration is the feature; dead ends are not.

---

## Cursor & Pointer Chaos

- [ ] Nav bar repels the cursor, catchable against a screen edge
- [ ] Target shatters into jigsaw pieces on contact — *partly done: built as
      `ShatterOnClick`, currently only on the search bar, not the nav*
- [ ] Decoy cursors moving in sync-but-offset patterns
- [ ] Cursor inverts inside certain zones
- [ ] Cursor teleports a few px off on click
- [ ] Click-through decoy: real hotspot offset from the rendered cursor
- [ ] Cursor leaves a trail of lingering fake cursors
- [ ] Right-click / long-press required for left-click-looking actions
- [ ] Cursor grows/shrinks approaching an important button

> **Conflict:** decoy cursors + inverted cursor + repelling targets + offset
> hotspots all at once means no click can be aimed at all. Pick at most two per
> page, or the site stops being finishable.

## Navigation & Wayfinding

- [x] Nav bar physically relocates between pages — `useNavPlacement`
- [x] Logo goes to a random page instead of home — `useTreacherousHistory`
- [x] "Back" navigates to a random previous page — `useTreacherousHistory`
- [x] Search bar teleports after every search — `SiteHeader` slots
- [ ] Nav items shuffle order every N seconds
- [ ] Breadcrumbs describing a path you never took
- [ ] Hidden "real" nav revealed by scrolling in an unnatural direction
- [ ] Sitemap/menu requiring a mini-maze drag to unlock

## Buttons & Controls

- [x] Button font shrinks as the cursor approaches — `ShrinkingButton`
- [x] Background colour shifts on any button click — `ColorShiftButton`
- [ ] Buttons labelled the opposite of what they do
- [ ] Primary CTA dodges the cursor for a few attempts
- [ ] Tiny hitbox for confirm, giant for cancel
- [ ] Buttons requiring a specific hold duration, unadvertised
- [ ] Double-negative confirmations
- [ ] Slider needing an exact, unmarked position
- [ ] Button relabels itself on every hover
- [ ] Drag-to-confirm slider that snaps back below a minimum speed
- [ ] Keyboard-only button that ignores mouse clicks

> **Note:** the ideas doc itself says "tiny hitbox for confirm, giant for cancel
> (or vice versa depending on mood)" — pick one direction and keep it consistent,
> or it reads as a bug rather than a bit.

## Feedback & Timing

- [ ] Fake progress bar freezing at 99% / running backwards
- [ ] Success toast immediately contradicted by a failure toast
- [ ] Multi-second spinner on trivial actions
- [ ] Loading skeleton that loops forever, resolves on refresh
- [ ] Notification badge count that never matches reality
- [ ] Autosave stuck on "Saving…" while saving fine

## Popups & Modals

- [x] Unskippable pre-roll interstitial — `FakeAdInterstitial`
- [x] Fake "Skip in 5s" countdown that resets before letting you skip
- [x] Close button non-functional until mandatory watch time elapses
- [ ] Cookie/newsletter popup that reopens N times after closing
- [ ] Modal X that sometimes opens another modal
- [ ] Modal closable only by dragging it off-screen
- [ ] Confirmation chains 3–4 levels deep
- [ ] Popup where only "Cancel" is visible, "Confirm" scrolled out of view
- [ ] Modal that shrinks each time you try to read it

## Forms & Input

- [x] Validation errors that never say what is wrong — `VAGUE_ERROR`
- [x] Password strength meter that is always wrong — `displayedStrength`
- [x] "Remember me" that unchecks itself right before submit
- [ ] Dropdown options in a deliberately illogical order
- [ ] Text input previewing your text reversed, submitting it correctly
- [ ] Autocomplete suggestions that are all wrong on purpose
- [ ] Form that resets a random field when you fix another
- [ ] Date picker navigating one month at a time, backwards

## Content & Layout

- [x] Body text rendered mirrored — `MirroredText`
- [x] Images with wavy underwater distortion — `UnderwaterDistortion`
- [x] Random language switching — `RandomLanguageSwitch`
- [ ] Infinite scroll that periodically snaps back to the top
- [ ] Important text in low-contrast / tiny font until selected
- [ ] Carousel auto-advancing faster than anyone can read
- [ ] Page zooming slightly on scroll
- [ ] Content reflowing on every 1px resize
- [ ] "Read more" expanding the wrong section
- [ ] Sticky header growing taller as you scroll
- [ ] Thick drifting watermark over images

> **Conflict:** low-contrast tiny text *underneath* the flashlight fog is
> unreadable, not annoying. If both ship, the fog has to lift for selected text.

## Visibility / Reveal

- [x] Flashlight mode as the site's base state — `SpotlightProvider`
- [x] `--spotlight-radius` editable from devtools (the sanctioned cheat)
- [x] Console API as a second escape hatch — `spotlight.radius`
- [—] Spotlight radius shrinking over time — **removed on request**; the fog now
      holds a fixed size
- [ ] Spotlight jumping to a random offset — *built and enabled, but currently
      position-only and quite subtle*

## Puzzle / Mini-Game Gags

- [x] AI-only maths CAPTCHA for a mundane action — `MathCaptchaGate`
- [x] Jigsaw reassembly blocking a control — `ShatterOnClick`
- [ ] Simon-says colour sequence to confirm an action
- [ ] 15-puzzle slider blocking a primary action
- [ ] Whack-a-mole submit button among decoys

## Media-Flow (Player / Library)

- [x] Every "Play" opens the rickroll pre-roll first
- [x] Randomised triggers — unrelated actions sometimes fire the pre-roll
- [ ] Shuffle repeating the same 3 items before actually shuffling
- [ ] Inverted volume slider
- [ ] "Continue Watching" that never remembers the timestamp
- [ ] Play/Pause icon always showing the wrong state
- [ ] Seek bar that only skips backward
- [ ] "Next" playing a random unrelated item
- [ ] Like/heart requiring a long-press

> **Scope note:** there is no real video player — the only playback is the
> rickroll pre-roll. Volume/seek/shuffle/continue-watching need a player UI
> built first, or they have nothing to attach to.

## Account / Auth

- [x] Caps Lock silently changes which field you type into
- [x] Mislabelled confirmation — "add?" when it removes
- [ ] "Forgot password" that works but is buried 4 menus deep
- [ ] Logout asking "Are you sure you want to log in?"
- [ ] Profile save button enabled only after touching every field

> **Accounts are real now.** Firebase Email/Password, with the localStorage
> session kept as a fallback so the site still works while the console switch is
> off, offline, and in tests.

## Shop-Flow (Cart / Checkout)

- [—] Cart convenience fee that changes each time you look
- [—] Quantity stepper where +/− sometimes invert
- [—] Checkout progress bar with reordering steps
- [—] "Apply Coupon" applying a random different discount
- [—] Remove-from-cart that duplicates the item first
- [—] Address fields with swapped labels

> **Excluded:** IMDb has no cart or checkout. The watchlist is the nearest
> equivalent and already carries the mislabelled-confirmation gag. Bolting a
> fake shop onto a movie database would break the "convincing clone" premise.

## Sound / Motion

- [ ] Mildly annoying sound sting on hover of key elements
- [ ] Persistent subtle jitter that stops on hover/focus
- [ ] Background element that very slowly drifts

> **Caveat:** browsers block autoplaying audio until the user interacts with the
> page, so hover stings will silently fail on first load. Needs a click-to-enable
> step, which somewhat gives the game away.

---

## Summary

| | Count |
| --- | --- |
| Built | 24 |
| Remaining | 58 |
| Excluded | 7 |

## Suggested order

1. **Cheap and self-contained** — opposite labels, relabel-on-hover, dodging CTA,
   illogical dropdown order, reversed-text preview, wrong autocomplete
2. **Needs a host component** — confirmation chains, cookie popup, modal gags
3. **Needs new surfaces** — carousel, infinite scroll, a player UI for the
   media-flow gags, a profile page for the auth gags
4. **Pick-two-only** — the cursor chaos section, per the conflict note above
