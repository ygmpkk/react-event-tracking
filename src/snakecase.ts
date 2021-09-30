export const snakeCase = (text: string) => {
  return text
    .match(/([A-Z])/g)!
    .reduce((str, c) => str.replace(new RegExp(c), "_" + c.toLowerCase()), e)
    .substring(text.slice(0, 1).match(/([A-Z])/g) ? 1 : 0);
};
