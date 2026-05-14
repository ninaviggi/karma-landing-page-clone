export interface SuggestionItem {
  title: string;
  meta?: string;
  featured?: boolean;
}

export interface SuggestionCategory {
  id: string;
  title: string;
  subtitle: string;
  items: SuggestionItem[];
}

// Static category data for v0.1. Later versions will compute these from
// time of day, season, session history, and vocab-gap analysis.
export const HOME_CATEGORIES: SuggestionCategory[] = [
  {
    id: 'for-right-now',
    title: 'For right now',
    subtitle: 'Tuesday afternoon · 3:14 pm',
    items: [
      { title: 'Snack time, side by side', meta: 'Food vocab', featured: true },
      { title: 'Draw the view from the window', meta: 'Quiet · 20 min' },
      { title: 'Build with magnetic tiles', meta: 'Shapes & colors' },
    ],
  },
  {
    id: 'your-favorites',
    title: 'Your favorites',
    subtitle: 'The ones you keep coming back to',
    items: [
      { title: 'Bake chocolate chip cookies', meta: 'Done 3×' },
      { title: 'Drawing dragons', meta: 'Done 2×' },
      { title: 'Build a pillow fort', meta: 'Done 2×' },
      { title: 'Nature walk in the park', meta: 'Done 1×' },
    ],
  },
  {
    id: 'in-season',
    title: 'In season',
    subtitle: "It's December · short days, long evenings",
    items: [
      { title: 'Bake holiday cookies together', meta: 'Cozy · 45 min' },
      { title: 'Make a paper snowflake', meta: 'Quiet · 15 min' },
      { title: 'Wrap a small gift', meta: 'Fine motor' },
    ],
  },
  {
    id: 'crafts-and-chores',
    title: 'Crafts & chores',
    subtitle: 'Hands-on, vocab-rich',
    items: [
      { title: 'Set the table', meta: 'Routine · 10 min' },
      { title: 'Sort the laundry by color', meta: 'Colors · 15 min' },
      { title: 'Paint pasta jewelry', meta: 'Crafts · 30 min' },
      { title: 'Water the houseplants', meta: 'Nature · 10 min' },
    ],
  },
  {
    id: 'diversify',
    title: 'Diversify your vocab',
    subtitle: "You've done a lot with food and animals · try movement",
    items: [
      {
        title: 'Dance party in the kitchen',
        meta: '+ verbs of motion',
        featured: true,
      },
      { title: 'Tiny yoga together', meta: '+ body parts' },
      { title: 'Build an obstacle course', meta: '+ prepositions' },
    ],
  },
];

// Legacy flat list — still referenced by anything that wants a quick
// suggestion grab-bag (e.g. empty-state).
export const DEFAULT_SUGGESTIONS: string[] = HOME_CATEGORIES.flatMap((c) =>
  c.items.map((i) => i.title)
);
