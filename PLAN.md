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
- Started the Shtetl world with **The Runaway Wagon**: an original wagon drawing, HEAVY and SLIPPERY physics, a moving catch switch, a flour delivery, and a documented solution. Replaced inherited sci-fi scenery with timber cottages and a cobbled lane.
- Added **Chicken Soup Catastrophe**: a blocked kitchen, ordered TINY and HEAVY changes, a spill zone that resets carried supplies, and a safe route to Basya's pot.
- Added **The Tiny Shtetl**: a miniature passage too narrow for a full sized hero, a model mechanism, Tova's request, and a documented two sticker solution.
- Added **The Floating Bridge**: a deep stream, FLOATING raft and hero stages, and a supply delivery across the water to Reizel.
- Completed the Shtetl world with **The Great Wagon Rescue**: a muddy wagon route, FLOATING and SLIPPERY wagon stages, a HEAVY tow anchor, Shmuel’s parcel delivery, and a rescue badge reward.
- Started the Yom Tov world with **Dreidel Disaster**: an original toy dreidel drawing, BOUNCY and SLIPPERY stages, a game table destination, and Chaya’s Chanukah decoration task.
- Added **The Missing Menorah Pieces**: a narrow workshop opening, TINY and MAGNETIC stages, three safely stored decorative pieces, and a distinct one-piece-at-a-time assembly action.
- Added **Purim Delivery Dash**: a FAST and SLIPPERY courier route, two mishloach manos packages, and separate gift delivery to Esti and Yehuda.
- Added **Matzah Mountain**: a BIG supply box, TINY passage clearance, and delivery of clean table coverings to Rachel’s Pesach preparation room.
- Completed the Yom Tov world with **The Great Sukkah Scramble**: three ordered sticker transfers, supply collection, and a visible walls-then-roof construction sequence.
- Started the worldwide shlichus world with **The Desert Delivery**: a FLOATING crossing over a dry wadi, a HEAVY far-bank anchor, and community supplies for Ezra’s welcome tent.
- Added **Snowy Shlichus**: a SLIPPERY sled crossing, MAGNETIC recovery of three winter supply packs, and a community home delivery.
- Added **Jungle Mitzvah Mission**: BIG, BOUNCY, and HEAVY path stages, jungle scenery, and separate assistance for Avi and Maya.
- Generalized mission inventory and station handling for both tzedakah deposits and supply deliveries; completing level 2 unlocks an outfit and achievement.
- Made unreleased worlds visible as previews rather than showing the original StickerChaos levels under new names.

## Next milestones

1. **Reusable action system:** Extend item delivery and neighbor assistance into richer cooperation, preparation sequences, and story event triggers. Keep inventory independent from stickers.
2. **Worlds 3–4:** Implement two more original solvable levels, distinct scenery, and progression. Validate each documented solution and its physical route.
3. **Art, audio, and rewards:** Expand original environment and character animation, create suitably licensed or original Chassidic-inspired music and effects, achievements, and cosmetic unlocks.
4. **Release QA:** Run all automated gates, mobile screenshots, offline PWA checks, actual iPhone/iPod Safari performance checks, and religious content review. Prepare a separate deployment.

## Known issues and limits

- Only levels 1–18 are playable. The original engine includes code for unreleased features and worlds that will be adapted during later milestones.
- Mission actions support coin collection, item delivery, staged neighbor assistance, and simple display assembly, and separate gifts for multiple recipients. Preparation sequences and richer cooperation remain to be built.
- Current music comes from the inherited procedural audio system and needs a new music direction.
- Community review of dialogue and cultural detail is pending.
