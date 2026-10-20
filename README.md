# Mitzvah Chaos

**One little mitzvah can change the whole world!** A mobile-first Chabad-inspired sticker puzzle adventure for children. This is a separate project derived from [StickerChaos](https://github.com/sammyl720/StickerChaos). The GitHub repository is spelled `MitvahChaos`; the in-game title uses the usual spelling, Mitzvah Chaos.

## Playable now

Three original Crown Heights missions are playable. In **The Runaway Pushka**, transfer MAGNETIC from the bot to your hero, collect three runaway coins, and place them in Rivky's pushka. In **Challahzilla!**, move BIG from a giant challah to the bridge crate, then carry a tablecloth to Miriam's Shabbos table. In **The Speedy Shliach**, borrow FAST from a delivery bot and carry a package through a street maze to Yanky. Every mission includes a present, an exit, and a distinct mitzvah task. Choose a boy or girl adventurer. The eight-property sticker engine, undo, restart, touch controls, tap movement, local progress, sound settings, and offline PWA foundation are retained. Three future worlds appear as previews; their levels are not yet playable.

This is an early playable milestone, not the full 20-level game described in [SPEC.md](SPEC.md). [PLAN.md](PLAN.md) tracks the remaining implementation and verification work.

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
```

The app saves under `mitvah-chaos-progress` in localStorage and IndexedDB. It does not read or overwrite StickerChaos progress. The PWA has its own name, icon, theme color, and manifest ID. It has no accounts, ads, purchases, or backend.

## Source and rights

The underlying engine, controls, and infrastructure come from [StickerChaos](https://github.com/sammyl720/StickerChaos) at commit `9db59e498e0f4692f41b162d65fdcf1a3e01153c`. The original project has no repository license file; confirm ownership and permission before sharing this derivative beyond the repository owner's use. Third-party dependencies retain their respective licenses in `package-lock.json`. All new game illustrations in this milestone are project-native SVG and canvas drawings. No third-party Chabad logo or person's likeness is used.

## Current limitations

Only levels 1–3 have new layouts, mitzvah interactions, and documented solutions. Remaining worlds, richer NPC behavior, broader mission actions, Chassidic-inspired audio, more cosmetic rewards, and device testing are future work. Browser emulation does not replace testing on an actual iPhone or iPod touch before public release. Religious wording and ritual detail should receive community review before release.
