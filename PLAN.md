# Mitzvah Chaos implementation plan

## Done in this milestone

- Copied StickerChaos into the separate `MitvahChaos` repository while leaving its original checkout and remote untouched.
- Preserved the eight-property sticker engine, Phaser physics, React shell, mobile controls, save framework, and automated test tooling.
- Gave the app its own title, manifest ID, PWA icons, color, progress storage key, and source attribution.
- Added original boy and girl adventurer drawings and a saved character choice with identical gameplay.
- Replaced the opening puzzle with **The Runaway Pushka**, a Crown Heights layout with a MAGNETIC sticker puzzle, collectible coin inventory, pushka deposit, Rivky interaction, exit gate, and documented solution.
- Made unreleased worlds visible as previews rather than showing the original StickerChaos levels under new names.

## Next milestones

1. **Crown Heights:** Build and playtest levels 2–5 with original layouts, NPC interactions, staged objectives, hints, and solution checks.
2. **Reusable action system:** Generalize the pushka mission into item delivery, cooperation, preparation sequences, story event triggers, and NPC assistance. Keep inventory independent from stickers.
3. **Worlds 2–4:** Implement fifteen original solvable levels, distinct scenery, and progression. Validate each documented solution and its physical route.
4. **Art, audio, and rewards:** Expand original environment and character animation, create suitably licensed or original Chassidic-inspired music and effects, achievements, and cosmetic unlocks.
5. **Release QA:** Run all automated gates, mobile screenshots, offline PWA checks, actual iPhone/iPod Safari performance checks, and religious content review. Prepare a separate deployment.

## Known issues and limits

- Only level 1 is playable. The original engine includes code for unreleased features and worlds that will be adapted during later milestones.
- The mission inventory currently supports only coins and a single pushka interaction.
- Current music comes from the inherited procedural audio system and needs a new music direction.
- Community review of dialogue and cultural detail is pending.
