const form = document.querySelector('#entry-form');
const list = document.querySelector('#entries');

// Fill an entry's display: a bold title, then the body. textContent, never
// innerHTML: titles and bodies are user input, and innerHTML would run them as
// markup if someone typed a <script> or <img> tag.
const fillDisplay = (display, entry) => {
  const title = document.createElement('strong');
  title.textContent = `${entry.title}:`;
  display.replaceChildren(title, ` ${entry.body}`);
};

const makeButton = (className, label) => {
  const button = document.createElement('button');
  button.className = className;
  button.type = 'button';
  button.textContent = label;
  return button;
};

// Build an entry's <li> the same way the server-rendered page does.
const buildItem = (entry) => {
  const item = document.createElement('li');
  item.dataset.id = list.children.length;
  item.dataset.title = entry.title;
  item.dataset.body = entry.body;

  const display = document.createElement('span');
  display.className = 'entry-display';
  fillDisplay(display, entry);

  item.append(display, makeButton('edit-btn', 'Edit'), makeButton('delete-btn', 'Delete'));
  return item;
};

// An entry's id is its position in the server's array, so deleting one
// shifts every entry after it down by one. Renumber the page to match.
const renumber = () => {
  [...list.children].forEach((item, index) => {
    item.dataset.id = index;
  });
};

// Setting .value, not a value="..." attribute in a string, so a quote in the
// title cannot end the attribute early.
const makeInput = (name, value) => {
  const input = document.createElement('input');
  input.type = 'text';
  input.name = name;
  input.value = value;
  return input;
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

const startEdit = (item) => {
  const display = item.querySelector('.entry-display');
  const buttons = item.querySelectorAll('.edit-btn, .delete-btn');

  const editForm = document.createElement('form');
  editForm.className = 'edit-form';
  const save = document.createElement('button');
  save.type = 'submit';
  save.textContent = 'Save';
  editForm.append(
    makeInput('title', item.dataset.title),
    makeInput('body', item.dataset.body),
    save,
    makeButton('cancel-btn', 'Cancel'),
  );

  display.replaceWith(editForm);
  buttons.forEach((button) => { button.hidden = true; });

  editForm.querySelector('.cancel-btn').addEventListener('click', () => {
    editForm.replaceWith(display);
    buttons.forEach((button) => { button.hidden = false; });
  });

  editForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = new FormData(editForm);
    const entry = Object.fromEntries(data);

    // A failed save leaves the form open with the edits still in it.
    save.disabled = true;
    try {
      const response = await fetch(`/entries/${item.dataset.id}`, {
        method: 'PUT',
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
      item.dataset.title = saved.title;
      item.dataset.body = saved.body;
      fillDisplay(display, saved);
      editForm.replaceWith(display);
      buttons.forEach((button) => { button.hidden = false; });
    } catch {
      alert('Your changes were not saved: the server did not answer properly. Please try again.');
    } finally {
      save.disabled = false;
    }
  });
};

list.addEventListener('click', async (event) => {
  if (event.target.matches('.edit-btn')) {
    startEdit(event.target.closest('li'));
    return;
  }

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
