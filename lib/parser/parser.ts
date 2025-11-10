import { createParser } from "nuqs";

export const parseAsInteger = createParser({
  parse: (value) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? null : parsed;
  },
  serialize: (value) => String(value),
});

export const parseAsString = createParser({
  parse: (value) => value || null,
  serialize: (value) => value,
});
