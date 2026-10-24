import { httpError } from '../utils/httpError.js';

// validate(schema, 'body' | 'query' | 'params')
// Clean, checked data is placed on req.valid[source].
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    throw httpError(400, 'Please check your input.', details);
  }

  req.valid = req.valid || {};
  req.valid[source] = result.data;
  next();
};