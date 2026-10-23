# Mitzvah Chaos

**One little mitzvah can change the whole world!** A mobile-first Chabad-inspired sticker puzzle adventure for children. This is a separate project derived from [StickerChaos](https://github.com/sammyl720/StickerChaos). The GitHub repository is spelled `MitvahChaos`; the in-game title uses the usual spelling, Mitzvah Chaos.

## Playable now

The five original Crown Heights missions, all five Shtetl missions, all five Yom Tov missions, and all five worldwide shlichus missions are playable. In **The Runaway Pushka**, transfer MAGNETIC from the bot to your hero, collect three runaway coins, and place them in Rivky's pushka. In **Challahzilla!**, move BIG from a giant challah to the bridge crate, then carry a tablecloth to Miriam's Shabbos table. In **The Speedy Shliach**, borrow FAST from a delivery bot and carry a package through a street maze to Yanky. In **Kingston Avenue Mix-Up**, use TINY and HEAVY to clear the street, then help Leah and Moshe. In **The Great Challah Avalanche**, tame rolling loaves through three ordered sticker changes and help Dovi prepare a community table. In **The Runaway Wagon**, make a wagon HEAVY and SLIPPERY, slide it onto a catch switch, and bring flour to Golda's kitchen. In **Chicken Soup Catastrophe**, clear a blocked kitchen, steady its shelf, and carry soup supplies around a spill to Basya's pot. In **The Tiny Shtetl**, shrink through a miniature passage and help Tova restart a moving village model. In **The Floating Bridge**, float a supply raft and carry parcels over the stream to Reizel. In **The Great Wagon Rescue**, float a stuck wagon, weight its tow anchor, and slide it out of the mud before delivering parcels to Shmuel. In **Dreidel Disaster**, combine BOUNCY and SLIPPERY on a giant toy dreidel, then carry paper decorations to Chaya’s Chanukah game table. In **The Missing Menorah Pieces**, shrink through a workshop opening, use MAGNETIC to recover decorative pieces, and assemble the Chanukah display one piece at a time. In **Purim Delivery Dash**, combine FAST and SLIPPERY, collect two mishloach manos packages, and bring one to each neighbor. In **Matzah Mountain**, move BIG from a supply box to a packing cart, shrink the box with TINY, and bring clean coverings to Rachel’s Pesach preparation table. In **The Great Sukkah Scramble**, load a supply cart, clear the building area, steady the support, then gather bundles to build the walls and roof in stages. In **The Desert Delivery**, float a cargo glider and your adventurer across a dry wadi, steady a far-bank anchor, and deliver supplies to Ezra’s welcome tent. In **Snowy Shlichus**, slide the supply sled through an icy lane, use MAGNETIC to recover three winter supply packs, and bring them to Rivka. In **Jungle Mitzvah Mission**, grow a bridge crate, bounce a vine ball across the path, steady a counterweight, and help Avi and Maya reach a gathering. In **The Worldwide Mitzvah Machine**, clear a narrow passage, float across a canal, steady a machine base, and assemble three parts to light a celebration display. In **The Grand Mitzvah Celebration**, run through three sticker stages, bring welcome kits to two friends, and finish with original music, dancing, and confetti. Every mission includes a present, an exit, and a distinct mitzvah task. Choose a boy or girl adventurer. The eight-property sticker engine, undo, restart, touch controls, tap movement, local progress, sound settings, and offline PWA foundation are retained. Completing the finale unlocks a golden outfit and the final achievements.

All 20 original levels described in [SPEC.md](SPEC.md) are playable. [PLAN.md](PLAN.md) tracks polish and release verification work.

## Run locally

Use Node.js 22.13+ or 24+ and npm 10+.

```sh
npm ci
npm run dev
```

For validation:

```sh
npm run typecheck
npm run lint
npm run test
npm run build
npx playwright install chromium webkit
npm run test:e2e
npm run test:offline
```

The app saves under `mitvah-chaos-progress` in localStorage and IndexedDB. It does not read or overwrite StickerChaos progress. The PWA has its own name, icon, theme color, and manifest ID. It has no accounts, ads, purchases, or backend.

## Source and rights

The underlying engine, controls, and infrastructure come from [StickerChaos](https://github.com/sammyl720/StickerChaos) at commit `9db59e498e0f4692f41b162d65fdcf1a3e01153c`. The original project has no repository license file; confirm ownership and permission before sharing this derivative beyond the repository owner's use. Third-party dependencies retain their respective licenses in `package-lock.json`. All new game illustrations are project-native SVG and canvas drawings. No third-party Chabad logo or person's likeness is used.

## Current limitations

All 20 levels have distinct layouts, mitzvah interactions, and documented solutions. Mission actions still use a limited set of collection, delivery, assembly, and neighbor interactions. World music uses procedural audio, with an original synthesized finale melody. Browser emulation does not replace testing on an actual iPhone or iPod touch before public release. Religious wording and ritual detail should receive community review before release.
