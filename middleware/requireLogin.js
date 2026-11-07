const message = 'You must be logged in to do that.';

export const requireLogin = (req, res, next) => {
  if (!req.user) {
    // htmx shows an error answer in the page's status line, so an htmx
    // request gets plain text, the same as the entries controller's
    // sendError; anything else gets JSON.
    if (req.get('HX-Request') === 'true') {
      res.status(401).send(message);
      return;
    }
    res.status(401).json({ error: message });
    return;
  }
  next();
};
