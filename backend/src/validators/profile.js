import { z } from 'zod';
import { optText } from './common.js';

const nothingToUpdate = (o) => Object.keys(o).length > 0;

// What a STUDENT may change about themselves.
export const profileSelfUpdate = z
  .object({
    full_name: z.string().trim().min(1).max(120),
    username: z.string().trim().min(1).max(50),
    program: optText(50),
    year_section: optText(20),
    phone: optText(30),
  })
  .partial()
  .refine(nothingToUpdate, 'Nothing to update.');

// What an ADMIN may change about any user.
export const profileAdminUpdate = z
  .object({
    full_name: z.string().trim().min(1).max(120),
    username: z.string().trim().min(1).max(50),
    student_id: z.string().trim().min(1).max(30).nullable(),
    program: optText(50),
    year_section: optText(20),
    position: z.string().trim().min(1).max(50),
    phone: optText(30),
    role: z.enum(['student', 'admin']),
    is_active: z.boolean(),
  })
  .partial()
  .refine(nothingToUpdate, 'Nothing to update.');

export const profileListQuery = z.object({
  search: z.string().trim().max(100).optional(),
  role: z.enum(['student', 'admin']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});