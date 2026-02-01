import md5 from "crypto-js/md5";

const getGravatarUrl = (email: string, size: number) => {
  const trimmedEmail = email.trim();
  const hash = md5(email).toString();
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=monsterid`;
};

export default getGravatarUrl;
