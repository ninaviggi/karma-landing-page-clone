export interface SuggestionCategory {
  id: string;
  title: string;
  subtitle: string;
  items: string[];
}

// Static category data for v0.1. Later versions will compute these from
// time of day, season, session history, and vocab-gap analysis.
export const HOME_CATEGORIES: SuggestionCategory[] = [
  {
    id: 'for-right-now',
    title: 'For right now',
    subtitle: 'Tuesday afternoon · 3:14 pm',
    items: [
      'Snack time, side by side',
      'Draw the view from the window',
      'Build with magnetic tiles',
    ],
  },
  {
    id: 'your-favorites',
    title: 'Your favorites',
    subtitle: 'The ones you keep coming back to',
    items: [
      'Bake chocolate chip cookies',
      'Drawing dragons',
      'Build a pillow fort',
      'Nature walk in the park',
    ],
  },
  {
    id: 'in-season',
    title: 'In season',
    subtitle: "It's December · short days, long evenings",
    items: [
      'Bake holiday cookies together',
      'Make a paper snowflake',
      'Wrap a small gift',
    ],
  },
  {
    id: 'crafts',
    title: 'Crafts',
    subtitle: 'Make something with your hands',
    items: [
      'Paint pasta jewelry',
      'Cut and glue a collage',
      'Build with playdough',
      'Make a paper airplane',
    ],
  },
  {
    id: 'chores',
    title: 'Chores',
    subtitle: 'Routines that teach',
    items: [
      'Set the table',
      'Sort the laundry by color',
      'Water the houseplants',
      'Load the dishwasher together',
    ],
  },
  {
    id: 'diversify',
    title: 'Diversify your vocab',
    subtitle: "You've done a lot with food and animals · try movement",
    items: [
      'Dance party in the kitchen',
      'Tiny yoga together',
      'Build an obstacle course',
    ],
  },
];

// Legacy flat list — still referenced by anything that wants a quick
// suggestion grab-bag (e.g. empty-state).
export const DEFAULT_SUGGESTIONS: string[] = HOME_CATEGORIES.flatMap(
  (c) => c.items
);
