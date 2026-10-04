import { Router } from 'express';
import { readFile, writeFile } from 'fs/promises';
import { Ok, Err, Some, None } from '../result.js';

const router = Router();
const DATA_FILE = 'entries.json';

// Express does not await an async route handler, so a rejected promise
// (including one from a thrown error) never reaches next() on its own.
// This wrapper catches that rejection and forwards it, so the error-handling
// middleware in server.js actually gets a chance to run.
const asyncHandler = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

const validateEntry = ({ title, body }) => {
  if (!title || !body) return Err('title and body are required');
  return Ok({ title, body });
};

const findEntryById = (entries, id) => {
  const entry = entries[id];
  return entry ? Some(entry) : None;
};

router.get('/', asyncHandler(async (req, res) => {
  const data = await readFile(DATA_FILE, 'utf-8');
  const entries = JSON.parse(data);
  res.set('X-Total-Count', entries.length);
  res.status(200).render('entries', { title: 'My Notes', entries });
}));

router.post('/', asyncHandler(async (req, res) => {
  const result = validateEntry(req.body);
  if (!result.ok) {
    res.status(400).json({ error: result.error });
    return;
  }

  const data = await readFile(DATA_FILE, 'utf-8');
  const entries = JSON.parse(data);
  entries.push(result.value);
  await writeFile(DATA_FILE, JSON.stringify(entries, null, 2));

  res.status(201).json(result.value);
}));

router.post('/classic', asyncHandler(async (req, res) => {
  const result = validateEntry(req.body);
  if (!result.ok) {
    res.status(400).send(result.error);
    return;
  }

  const data = await readFile(DATA_FILE, 'utf-8');
  const entries = JSON.parse(data);
  entries.push(result.value);
  await writeFile(DATA_FILE, JSON.stringify(entries, null, 2));

  res.redirect('/entries');
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const data = await readFile(DATA_FILE, 'utf-8');
  const entries = JSON.parse(data);

  const found = findEntryById(entries, id);
  if (!found.some) {
    res.status(404).json({ error: 'Entry not found' });
    return;
  }

  const result = validateEntry(req.body);
  if (!result.ok) {
    res.status(400).json({ error: result.error });
    return;
  }

  entries[id] = result.value;
  await writeFile(DATA_FILE, JSON.stringify(entries, null, 2));
  res.status(200).json(result.value);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const data = await readFile(DATA_FILE, 'utf-8');
  const entries = JSON.parse(data);

  const found = findEntryById(entries, id);
  if (!found.some) {
    res.status(404).json({ error: 'Entry not found' });
    return;
  }

  entries.splice(id, 1);
  await writeFile(DATA_FILE, JSON.stringify(entries, null, 2));
  res.status(204).send();
}));

export default router;
