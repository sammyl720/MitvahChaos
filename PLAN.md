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
- Added **The Worldwide Mitzvah Machine**: three linked sticker puzzles, a canal crossing, and a visible three-part assembly display.
- Completed the worldwide shlichus world with **The Grand Mitzvah Celebration**: FAST, BOUNCY, and HEAVY stages, two welcome-kit deliveries, a golden outfit reward, dancing, confetti, and an original synthesized finale melody.
- Generalized mission inventory and station handling for both tzedakah deposits and supply deliveries; completing level 2 unlocks an outfit and achievement.
- Made unreleased worlds visible as previews rather than showing the original StickerChaos levels under new names.
- Passed 92 browser playthrough and layout checks across desktop Chromium, mobile Chromium, mobile WebKit, and compact WebKit, plus four focused glossary checks on the same profiles. Verified a production build reloads offline and can open the glossary and Level 1. Checked compact mobile screenshots, including the finale.
- Kept the mission hint above the playfield and made long hint text scrollable; removed the mobile browser zoom restriction.
- Added a full-width, pannable playfield option for short screens, with fixed mission and sticker controls. Verified touch sticker transfers and returning to the fitted view in desktop Chromium and three mobile browser profiles.
- Replaced the short inherited world music loops with four original four-bar themes, each with its own melody, tempo, bass, and harmony. Pause, volume, and theme switching have automated coverage.
- Added a mission/status switch in the fixed hint strip so players can reread the goal after interaction feedback, including on compact screens.
- Removed the Netlify badge from the hosted game after it blocked a sticker button on compact screens. Added a browser page-error check for level startup and resizing, and prepared a physical iPhone Safari checklist.
- Added an offline glossary of Hebrew and Yiddish adventure words in the Sticker Book; short definitions were checked against Chabad.org articles before community review.
- Added each neighbor's existing thank-you line to the victory screen, with a compact layout that keeps both result actions visible on a short phone display.
- Connected Leah's and Moshe's tasks on Kingston Avenue: clearing Leah's path prepares a supply bundle, which the player carries to Moshe after steadying his cart.
- Made Chaya's game table preparation a two-step task: each paper decoration is hung separately and appears on the table.
- Made the adventurer face the direction of travel and leave alternating, fading footsteps. Reduced-motion mode removes sway and footsteps, while low-graphics mode simplifies the shadow animation and uses fewer footsteps.
- Gave each world theme a quiet response phrase with its own notes and timbre, adding variation to the original synthesized soundtrack while preserving music volume and pause controls.
- Made Basya's soup preparation a two-step station task: bring both supplies around the spill, then add the ingredients separately and see each one appear in the pot.
- Added a miniature cart that runs through Tova's village model when its mechanism activates. Pause stops the cart; reduced-motion and low-graphics modes show a still active cart.
- Made Miriam's table and Dovi's bakery table start bare, then show their cloth or napkins when the player delivers them.

## Next milestones

1. **Mission polish:** Extend delivery and neighbor assistance into richer cooperation, preparation sequences, and story events. Keep inventory independent from stickers.
2. **Art and audio:** Expand original environment and character animation, and develop a broader original music direction for all four worlds.
3. **Release QA:** Test on an actual iPhone or iPod touch, including tap targets on compact screens, and obtain community review of religious content.

## Known issues and limits

- Mission actions support coin collection, item delivery, staged neighbor assistance, a neighbor-to-neighbor supply handoff, simple display assembly, and separate gifts for multiple recipients. More preparation sequences and cooperation remain to be built.
- Music is synthesized locally with original themes for all four worlds and the finale; the sound palette remains deliberately simple.
- The fitted 390×620 playfield is about 174 px wide on a 320×568 viewport; the optional full-width view is 320 px wide and can be panned. Tap-target usability still needs actual-device review.
- Isolated Level 1 tap-route browser reruns intermittently timed out after the full suite passed; the same runs passed on retry. Recheck the route on a physical device.
- Community review of dialogue and cultural detail is pending.
