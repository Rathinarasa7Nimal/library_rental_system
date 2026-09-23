/**
 * Shared password policy - one place both authController and (indirectly,
 * via the message below) the frontend copy stay in sync with.
 *
 * Rules: minimum 8 characters, at least one uppercase letter, one
 * lowercase letter, one number, and one special character.
 */
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const PASSWORD_RULES_MESSAGE =
  "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.";

function isValidPassword(password) {
  return typeof password === "string" && PASSWORD_REGEX.test(password);
}

module.exports = { PASSWORD_MIN_LENGTH, PASSWORD_REGEX, PASSWORD_RULES_MESSAGE, isValidPassword };