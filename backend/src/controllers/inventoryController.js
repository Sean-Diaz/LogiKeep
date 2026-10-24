import * as inventory from '../services/inventoryService.js';

// Builds a set of handlers for 'equipment' or 'facilities'.
export function makeInventoryController(table) {
  return {
    async list(req, res) {
      const q = req.valid.query;
      const result = await inventory.listItems(table, {
        search: q.search,
        categoryId: q.category_id,
        availableOnly: q.available_only === 'true',
        // Only admins may see deactivated items.
        includeInactive: req.user.role === 'admin' && q.include_inactive === 'true',
        page: q.page,
        limit: q.limit,
      });
      res.json(result);
    },

    async get(req, res) {
      const item = await inventory.getItem(table, req.valid.params.id, req.user.role === 'admin');
      res.json(item);
    },

    async create(req, res) {
      const item = await inventory.createItem(table, req.valid.body);
      res.status(201).json(item);
    },

    async update(req, res) {
      const item = await inventory.updateItem(table, req.valid.params.id, req.valid.body);
      res.json(item);
    },

    async remove(req, res) {
      const item = await inventory.deactivateItem(table, req.valid.params.id);
      res.json({ message: 'Deactivated.', item });
    },
  };
}