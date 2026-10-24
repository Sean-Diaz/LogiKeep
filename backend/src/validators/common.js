import { z } from 'zod';

export const idParam = z.object({ id: z.string().uuid('Invalid id.') });

export const optText = (max) => z.string().trim().max(max).nullable().optional();

export const listQuery = z.object({
  search: z.string().trim().max(100).optional(),
  category_id: z.string().uuid().optional(),
  available_only: z.enum(['true', 'false']).optional(),
  include_inactive: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});