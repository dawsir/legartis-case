import { BookCollection } from '../../shared/models/book-collection.model';

export const MOCK_COLLECTIONS: BookCollection[] = [
  {
    id: 'coll-001',
    name: 'Science Fiction',
    description: 'Speculative stories exploring technology, space, society, and possible futures.',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
  },
  {
    id: 'coll-002',
    name: 'Classic Literature',
    description: 'Influential literary works that shaped modern fiction and culture.',
    createdAt: '2026-01-02T10:00:00.000Z',
    updatedAt: '2026-01-02T10:00:00.000Z',
  },
  {
    id: 'coll-003',
    name: 'Programming',
    description:
      'Books about software engineering, programming languages, and clean code practices.',
    createdAt: '2026-01-03T10:00:00.000Z',
    updatedAt: '2026-01-03T10:00:00.000Z',
  },
  {
    id: 'coll-004',
    name: 'Philosophy',
    description: 'Works focused on ethics, knowledge, meaning, society, and human nature.',
    createdAt: '2026-01-04T10:00:00.000Z',
    updatedAt: '2026-01-04T10:00:00.000Z',
  },
  {
    id: 'coll-005',
    name: 'History',
    description: 'Books covering historical events, civilizations, conflicts, and biographies.',
    createdAt: '2026-01-05T10:00:00.000Z',
    updatedAt: '2026-01-05T10:00:00.000Z',
  },
  {
    id: 'coll-006',
    name: 'Personal Development',
    description:
      'Practical books about habits, decision-making, productivity, and self-improvement.',
    createdAt: '2026-01-06T10:00:00.000Z',
    updatedAt: '2026-01-06T10:00:00.000Z',
  },
  {
    id: 'coll-007',
    name: 'Business & Technology',
    description: 'Books about startups, product thinking, innovation, and technology trends.',
    createdAt: '2026-01-07T10:00:00.000Z',
    updatedAt: '2026-01-07T10:00:00.000Z',
  },
  {
    id: 'coll-008',
    name: 'To Read Later',
    description: 'An empty collection used to save books for future reading.',
    createdAt: '2026-01-08T10:00:00.000Z',
    updatedAt: '2026-01-08T10:00:00.000Z',
  },
];
