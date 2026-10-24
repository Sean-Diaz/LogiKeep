import * as profiles from '../services/profileService.js';
import { httpError } from '../utils/httpError.js';

export function me(req, res) {
  res.json(req.user.profile);
}

export async function updateMe(req, res) {
  const updated = await profiles.updateProfile(req.user.id, req.valid.body);
  res.json(updated);
}

export async function list(req, res) {
  res.json(await profiles.listProfiles(req.valid.query));
}

export async function getById(req, res) {
  res.json(await profiles.getProfile(req.valid.params.id));
}

export async function adminUpdate(req, res) {
  const body = req.valid.body;

  // Stop an admin from locking themselves out.
  if (req.valid.params.id === req.user.id && (body.is_active === false || body.role === 'student')) {
    throw httpError(400, 'You cannot deactivate or demote your own account.');
  }

  res.json(await profiles.updateProfile(req.valid.params.id, body));
}