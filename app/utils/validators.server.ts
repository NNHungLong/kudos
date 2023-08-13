export const validateEmail = (email: string): string | undefined => {
  let validationRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!email.length || !validationRegex.test(email)) {
    return "Please enter a valid email address";
  }
  return undefined;
};

export const validatePassword = (password: string): string | undefined => {
  let validationRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
  if (!password.length || !validationRegex.test(password)) {
    return "Password must include at least 8 characters, one uppercase letter, one lowercase letter, and one number";
  }
  return undefined;
};

export const validateName = (name: string): string | undefined => {
  if (!name.length) return `Please enter a value`;
};
