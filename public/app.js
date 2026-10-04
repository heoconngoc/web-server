const form = document.querySelector('#entry-form');
const list = document.querySelector('#entries');

// Build an entry's <li> the same way the server-rendered page does.
// textContent, never innerHTML: a title typed into the form is text, and
// innerHTML would run it as markup if someone typed a <script> or <img> tag.
const buildItem = (entry) => {
  const item = document.createElement('li');
  item.dataset.id = list.children.length;

  const text = document.createElement('span');
  const title = document.createElement('strong');
  title.textContent = `${entry.title}:`;
  text.append(title, ` ${entry.body}`);

  const button = document.createElement('button');
  button.className = 'delete-btn';
  button.type = 'button';
  button.textContent = 'Delete';

  item.append(text, button);
  return item;
};

// An entry's id is its position in the server's array, so deleting one
// shifts every entry after it down by one. Renumber the page to match.
const renumber = () => {
  [...list.children].forEach((item, index) => {
    item.dataset.id = index;
  });
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const entry = Object.fromEntries(data);
  const button = form.querySelector('button');

  // One save at a time: a second click while this one is out does nothing.
  button.disabled = true;
  try {
    const response = await fetch('/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const { error } = await response.json();
      alert(error);
      return;
    }

    const saved = await response.json();
    list.append(buildItem(saved));
    form.reset();
  } catch {
    // No answer, no connection, or an error page that is not JSON. What
    // they typed is still in the form, so they can simply try again.
    alert('Your entry was not saved: the server did not answer properly. Please try again.');
  } finally {
    button.disabled = false;
  }
});

list.addEventListener('click', async (event) => {
  if (!event.target.matches('.delete-btn')) return;

  const button = event.target;
  const item = button.closest('li');
  const id = item.dataset.id;

  button.disabled = true;
  try {
    const response = await fetch(`/entries/${id}`, { method: 'DELETE', signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      const { error } = await response.json();
      alert(error);
      button.disabled = false;
      return;
    }
    item.remove();
    renumber();
  } catch {
    alert('That entry was not deleted: the server did not answer properly. Please try again.');
    button.disabled = false;
  }
});
