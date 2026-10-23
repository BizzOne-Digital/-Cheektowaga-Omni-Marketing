// The only site copy editable at /admin/content. Everything else stays in code.
// Defaults are today's copy, so pages render the same when the settings record is missing.
// No imports here: scripts/seed.mjs loads this file directly with Node.

export type Content = {
  heroEyebrow: string // home hero, small label above the headline
  taglineLead: string // home hero, "More connectivity."
  taglineAccent: string // home hero, violet half, "More freedom."
  heroChips: string[] // home hero feature chips
  pillars: string[] // home hero footer row (exactly 3)
  marqueeWords: string[] // home scrolling words band
}

export const contentDefaults: Content = {
  heroEyebrow: 'VL16 Pro · Affordable smart watch',
  taglineLead: 'More connectivity.',
  taglineAccent: 'More freedom.',
  heroChips: ['Heart rate monitoring', 'Fitness tracking', 'Smart notifications', 'Long battery life'],
  pillars: ['Stay connected.', 'Live healthier.', 'Do more.'],
  marqueeWords: ['Peace of mind', 'Stay connected', 'Live healthier', 'Do more', 'Affordable'],
}

/** Saved values over the defaults; unknown keys (e.g. _id, updatedAt) are dropped. */
export const mergeContent = (saved?: Partial<Content> | null): Content => ({
  ...contentDefaults,
  ...Object.fromEntries(Object.entries(saved ?? {}).filter(([k, v]) => k in contentDefaults && v != null)),
})

type TextRule = { kind: 'text'; label: string; help: string; max: number }
type ListRule = { kind: 'list'; label: string; help: string; min: number; max: number; itemMax: number }
export const contentRules: Record<keyof Content, TextRule | ListRule> = {
  heroEyebrow: { kind: 'text', label: 'Hero label', help: 'Small line above the home page headline.', max: 60 },
  taglineLead: { kind: 'text', label: 'Tagline', help: 'First half of the line under the headline.', max: 40 },
  taglineAccent: { kind: 'text', label: 'Tagline accent', help: 'Second half, shown in violet.', max: 40 },
  heroChips: { kind: 'list', label: 'Feature chips', help: 'Short labels under the tagline.', min: 1, max: 6, itemMax: 32 },
  pillars: { kind: 'list', label: 'Hero pillars', help: 'Three short phrases along the bottom of the hero.', min: 3, max: 3, itemMax: 32 },
  marqueeWords: { kind: 'list', label: 'Scrolling words', help: 'Words in the large scrolling band below the banner.', min: 2, max: 8, itemMax: 24 },
}
