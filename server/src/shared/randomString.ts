export const randomString = (length: number = 15) => {
  return [...Array(length)]
    .map(i => (~~(Math.random() * 36)).toString(36))
    .join('')
    .toUpperCase();
};
