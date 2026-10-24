import { z } from 'zod';
import { optText } from './common.js';

const nothingToUpdate = (o) => Object.keys(o).length > 0;

export const equipmentCreate = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  description: optText(1000),
  category_id: z.string().uuid().nullable().optional(),
  image_url: z.string().url().max(500).nullable().optional(),
  total_quantity: z.number().int().min(0).optional(),
});

export const equipmentUpdate = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: optText(1000),
    category_id: z.string().uuid().nullable(),
    image_url: z.string().url().max(500).nullable(),
    total_quantity: z.number().int().min(0),
    is_active: z.boolean(),
  })
  .partial()
  .refine(nothingToUpdate, 'Nothing to update.');

export const facilityCreate = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  description: optText(1000),
  location: optText(200),
  image_url: z.string().url().max(500).nullable().optional(),
  total_quantity: z.number().int().min(0).optional(),
});

export const facilityUpdate = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: optText(1000),
    location: optText(200),
    image_url: z.string().url().max(500).nullable(),
    total_quantity: z.number().int().min(0),
    is_active: z.boolean(),
  })
  .partial()
  .refine(nothingToUpdate, 'Nothing to update.');

export const categoryCreate = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(80),
  description: optText(500),
});

export const categoryUpdate = z
  .object({
    name: z.string().trim().min(1).max(80),
    description: optText(500),
    is_active: z.boolean(),
  })
  .partial()
  .refine(nothingToUpdate, 'Nothing to update.');