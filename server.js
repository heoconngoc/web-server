import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import entriesRouter from './routes/entries.js';
import aboutRouter from './routes/about.js';
import morgan from 'morgan';
import mongoose from 'mongoose';

await mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://dev:devpassword@mongo:27017/devdb?authSource=admin'
);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = 'entries.json';

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/about', aboutRouter);
app.use('/entries', entriesRouter);

app.use((req, res) => {
  res.status(404).send('Page not found.');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Something went wrong.');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
// work in progress
// step one
// step two
// step three
// checkpoint 1
// checkpoint 2
// checkpoint 3
// BUG: off-by-one introduced here
// checkpoint 4
// checkpoint 5
