import express from "express";
import pagesRouter from './routes/pages.js';
import apiRouter from './routes/api.js';
import {join} from 'path';

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', 'views');

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

const events = [

];

app.get('/events', (req, res) => {
  res.render('events', { events });
});

app.get('/', (req, res) => {
  res.sendFile(join(import.meta.dirname, 'public', 'index.html'));
});

app.use(express.static('public'));

app.get('/entries', (req, res) => {
  const entries = [
    { title: 'First note'},
    { title: 'Second note'},
    { title: 'Third note'},
  ];
  const inner = '<ul>' + entries.map(e => `<li>${e.title}</li>`).join('') + '</ul>';
  res.render('layout', { title: 'Entries', body: inner, entries});
  // the render func above do: 1) Find layout.ejs file, find var title, body, entries and subtitute => send html to browser
});

app.get("/ab", (req, res) => {
  res.send("This is a web programming course.");
});

app.get("/status", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
  });
});

const greetHandler = (req, res) => {
  res.send('Hello!');
};

app.get('/greet', greetHandler);

app.get('/hello/:name', (req, res) => {
  const name = req.params.name;
  res.send(`Hello, ${name}!`);
});

app.get('/users/:userId/posts/:postId', (req, res) => {
  const { userId,  postId } = req.params;
  res.send(`User ${userId}, post ${postId}`);
})

app.get('/search', (req, res) => {
  const term = req.query.term || 'nothing';
  const limit = req.query.limit || 5;
  res.send(`Searching for ${term}, showing ${limit} results.`)
});

app.get('/api/user/:id', (req, res) => {
  if(req.params.id === '1'){
    res.status(404).send('User not found.');
    return;
  }
  res.json({id: '121', name: 'Alice'});
});

app.get('/hello/:name', (req, res) => {
  const name = req.params.name;
  res.send(`Hello, ${name}!`);
});

app.get('/repeat/:word', (req, res) => {
  const word = req.params.word;
  res.send(`${word} ${word} ${word}`);
});

app.get('/count', (req, res) => {
  const from = req.query.from || 1;
  const to = req.query.to || 10;
  res.send(`Counting from ${from} to ${to}.`);
});


app.get('/api/info', (req, res) => {
  res.json({name: "Dat", birthday:"13/11/2006"});
});

app.get('/api/error', (req, res) => {
  res.status(400).send("Bad request.");
});

app.use('/', pagesRouter);
app.use('/api', apiRouter);

// Use for everything else that is not get. So put it below get function
app.use((req, res) => {
  res.status(404).send("Page not found.");
});

// Always happen at the end
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
