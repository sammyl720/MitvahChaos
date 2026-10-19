# Mitzvah Chaos product specification

## Goal

Build a joyful, mobile-first Chabad-inspired cartoon physics puzzle adventure for roughly ages 7–13. The game is a separate spinoff of [StickerChaos](https://github.com/sammyl720/StickerChaos). Gameplay comes first: players transfer BIG, TINY, FAST, HEAVY, BOUNCY, FLOATING, MAGNETIC, and SLIPPERY between objects to solve environmental puzzles. Mitzvah actions are separate interactions, not renamed stickers.

## Gameplay requirements

- Provide a boy and girl adventurer with equal capabilities, saved selection, expressive original art, and optional cosmetic outfits.
- Provide a distinct objective in every level, such as tzedakah, helping an NPC, a delivery, a preparation sequence, or cooperation.
- Keep inventory items separate from transferable sticker properties. Support short NPC dialogue, hints, reactions, and level story events.
- Provide 20 original, solvable levels across Crown Heights Chaos, Shtetl Shenanigans, Yom Tov Mayhem, and Shlichus Around the World. Each needs a unique layout, a sticker puzzle, a Chabad-related interaction, treasure, hint, exit, undo, restart, and a documented solution.
- Preserve the physical effect of every sticker, stars, local saving, achievements, touch and tap controls, reduced motion, low graphics, offline PWA, and mobile safe areas.
- Do not include accounts, advertising, monetization, or a backend.

## Content and art

Use original cartoon art and music or appropriately licensed assets. Themes include kindness, shlichus, holidays, and Jewish community life. Physical comedy belongs to ordinary objects, machinery, and scenery. Sacred texts and ritual objects must be portrayed respectfully. No third-party Chabad marks or recognizable people's likenesses without permission. Optional Hebrew or Yiddish terms should have accessible explanations. Religious content needs review before public release.

## Acceptance

The full game is complete when all 20 new levels are playable with verified solutions; four worlds are visually distinct; mitzvah actions, NPCs, inventory, story events, achievements, cosmetics, music and sound, persistence, PWA install and offline play, and mobile accessibility work; type checking, lint, unit, build, and browser tests pass; and actual iPhone Safari testing is complete. The first milestone is The Runaway Pushka, described in README.md and tracked in PLAN.md.
