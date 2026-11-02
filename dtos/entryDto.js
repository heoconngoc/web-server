export const toEntryDto = (entry) => ({
  id: entry._id.toString(),
  title: entry.title,
  body: entry.body,
});

export const toUserDto = (user) => ({
  id: user._id.toString(),
  email: user.email,
});
