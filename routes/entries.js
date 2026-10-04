import { Router } from 'express';
import { readFile, writeFile } from 'fs/promises';
import { Ok, Err, Some, None } from '../result.js';

const router = Router();
const DATA_FILE = 'entries.json';

const validateEntry = ({ title, body }) => {
  if (!title || !body) return Err('title and body are required');
  return Ok({ title, body });
};

const findEntryById = (entries, id) => {
  const entry = entries[id];
  return entry ? Some(entry) : None;
};

router.get('/', async (req, res) => {
  const data = await readFile(DATA_FILE, 'utf-8');
  const entries = JSON.parse(data);
  res.set('X-Total-Count', entries.length);
  res.status(200).render('entries', { title: 'My Notes', entries });
});

router.post('/', async (req, res) => {
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
});

router.post('/classic', async (req, res) => {
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
});

router.delete('/:id', async (req, res) => {
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
});

export default router;
