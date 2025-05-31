export const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  export const isValidPassword = (pwd: string) => pwd.length >= 6;
  