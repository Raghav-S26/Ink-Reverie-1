
export interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
}

export interface Poem {
  id: string;
  title: string;
  author: User;
  content: string;
  excerpt: string;
  category: string;
  submissionDate: string;
  votes: number;
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  deadline: string;
  prize: string;
}

export const users: User[] = [
  { id: 'user-1', name: 'Eleanor Vance', avatar: '/placeholder.svg', bio: 'Weaver of words and dreams.' },
  { id: 'user-2', name: 'Julian Hayes', avatar: '/placeholder.svg', bio: 'Chronicler of the quiet moments.' },
  { id: 'user-3', name: 'Seraphina Rose', avatar: '/placeholder.svg', bio: 'Painting pictures with prose.' },
];

export const poems: Poem[] = [
  {
    id: 'poem-1',
    title: 'The Last Ember',
    author: users[0],
    content: `In halls of twilight, where memories sleep,\nA lone ember glows, a promise to keep.\nIt speaks of summers, of sun-drenched lane,\nOf laughter's echo, and gentle rain.\n\nThrough silent winters, and autumn's cold sigh,\nIt held the warmth of a bygone sky.\nA tiny star in a world of gray,\nTo light the path to another day.`,
    excerpt: 'In halls of twilight, where memories sleep, a lone ember glows...',
    category: 'Sonnet',
    submissionDate: '2025-06-10',
    votes: 128,
  },
  {
    id: 'poem-2',
    title: 'Ocean\'s Breath',
    author: users[1],
    content: `The shore listens\nto the ocean's long, slow breath.\nWhite foam whispers secrets\nto the waiting sand.`,
    excerpt: 'The shore listens to the ocean\'s long, slow breath...',
    category: 'Haiku',
    submissionDate: '2025-06-12',
    votes: 95,
  },
    {
    id: 'poem-3',
    title: 'City of Glass',
    author: users[2],
    content: `Towers of crystal pierce the velvet night,\nReflecting dreams in neon-tinted light.\nA silent river of a million souls,\nEach with a story that the city holds.\n\nFrom steel-strung bridges to the alleys deep,\nWhere forgotten wishes softly weep.\nThe city breathes, a beast of wire and stone,\nA beautiful, tragic, vibrant home.`,
    excerpt: 'Towers of crystal pierce the velvet night, reflecting dreams...',
    category: 'Free Verse',
    submissionDate: '2025-06-14',
    votes: 210,
  },
  {
    id: 'poem-4',
    title: 'Whispers in the Wood',
    author: users[0],
    content: `The ancient oak, with branches gnarled and high,\nTold tales of ages to the passing sky.\nOf lovers' carvings, and of children's play,\nAnd silent watchers at the close of day.`,
    excerpt: 'The ancient oak, with branches gnarled and high...',
    category: 'Ballad',
    submissionDate: '2025-05-28',
    votes: 78,
  },
];

export const contests: Contest[] = [
  {
    id: 'contest-1',
    title: 'Summer Solstice Sonnets',
    description: 'Capture the essence of summer in a 14-line sonnet.',
    deadline: '2025-07-20',
    prize: '$500',
  },
  {
    id: 'contest-2',
    title: 'Urban Legends',
    description: 'Explore the myths and whispers of the modern city.',
    deadline: '2025-08-15',
    prize: 'Publication in "The Urban Quill"',
  },
];
