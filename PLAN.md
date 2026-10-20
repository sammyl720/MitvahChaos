# Mitzvah Chaos implementation plan

## Done in this milestone

- Copied StickerChaos into the separate `MitvahChaos` repository while leaving its original checkout and remote untouched.
- Preserved the eight-property sticker engine, Phaser physics, React shell, mobile controls, save framework, and automated test tooling.
- Gave the app its own title, manifest ID, PWA icons, color, progress storage key, and source attribution.
- Added original boy and girl adventurer drawings and a saved character choice with identical gameplay.
- Replaced the opening puzzle with **The Runaway Pushka**, a Crown Heights layout with a MAGNETIC sticker puzzle, collectible coin inventory, pushka deposit, Rivky interaction, exit gate, and documented solution.
- Added **Challahzilla!**, with a BIG transfer, an original challah character, a tablecloth pickup and delivery, Miriam interaction, a distinct layout, and a documented solution.
- Added **The Speedy Shliach**, with a FAST transfer, a zigzag street maze, a package delivery and drop-off, Yanky interaction, and a documented solution.
- Added **Kingston Avenue Mix-Up**, with staged TINY and HEAVY transfers, two opening gates, two separate neighbor interactions, and a documented solution.
- Added **The Great Challah Avalanche**, with three ordered sticker stages, a rolling loaf, two opening gates, bakery preparation, boss reactions, and a documented solution.
- Generalized mission inventory and station handling for both tzedakah deposits and supply deliveries; completing level 2 unlocks an outfit and achievement.
- Made unreleased worlds visible as previews rather than showing the original StickerChaos levels under new names.

## Next milestones

1. **Reusable action system:** Extend item delivery and neighbor assistance into richer cooperation, preparation sequences, and story event triggers. Keep inventory independent from stickers.
2. **Worlds 2–4:** Implement fifteen original solvable levels, distinct scenery, and progression. Validate each documented solution and its physical route.
3. **Art, audio, and rewards:** Expand original environment and character animation, create suitably licensed or original Chassidic-inspired music and effects, achievements, and cosmetic unlocks.
4. **Release QA:** Run all automated gates, mobile screenshots, offline PWA checks, actual iPhone/iPod Safari performance checks, and religious content review. Prepare a separate deployment.

## Known issues and limits

- Only levels 1–5 are playable. The original engine includes code for unreleased features and worlds that will be adapted during later milestones.
- Mission actions support coin collection, item delivery, and staged neighbor assistance. Preparation sequences and richer cooperation remain to be built.
- Current music comes from the inherited procedural audio system and needs a new music direction.
- Community review of dialogue and cultural detail is pending.
