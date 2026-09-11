import express from "express";
import pagesRouter from './routes/pages.js';
import apiRouter from './routes/api.js';

const app = express();
const PORT = 3000;



app.get("/", (req, res) => {
  res.send("Hello, web!");
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
