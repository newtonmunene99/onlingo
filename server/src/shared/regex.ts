/**
 * Checks if string matches a person's name
 *
 * @example
 * ```
 * personNameRegex.test("Newton Munene"); // true
 * personNameRegex.test("Mr. Newton Munene"); // true
 * personNameRegex.test("Ne1wton Mu4nene"); // false
 * ```
 */
export const personNameRegex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;

/**
 * Checks if string only contains integers
 *
 * @example
 * ```
 * integersRegex.test("123456"); // true
 * ```
 */
export const integersRegex = /^\d+$/;

/**
 * Checks if string matches a valid gender
 *
 * @example
 * ```
 * genderRegex.test("M"); // true
 * ```
 */
export const genderRegex = /^(?:m|M|male|Male|f|F|female|Female)$/;

/**
 * Checks if string matches a valid gender
 *
 * @example
 * ```
 * maleRegex.test("M"); // true
 * ```
 */
export const maleRegex = /^(?:m|M|male|Male)$/;

/**
 * Checks if string matches a valid gender
 *
 * @example
 * ```
 * femaleRegex.test("F"); // true
 * ```
 */
export const femaleRegex = /^(?:f|F|female|Female)$/;

/**
 * Checks if string matches a valid email
 *
 * @example
 * ```
 * emailRegex.test(`johndoe@gmail.com`); // true
 * ```
 */
export const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

/**
 * Checks if a string is a valid phone number format
 *
 * @example
 * ```
 * phoneNumberRegex.test("+254792274634"); // true
 * ```
 */
export const phoneNumberRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;

/**
 * Checks if a string is a valid phone number format
 *
 * @example
 * ```
 * ke07PhoneNumber.test("0792274634"); // true
 * ```
 */
export const ke07PhoneNumber = /^0([1-9](?:(?:[0-9][0-9])|(?:0[0-8])|(4[0-1]))[0-9]{6})$/g;

/**
 * Checks if a string is a valid phone number format
 *
 * @example
 * ```
 * keplus254PhoneNumber.test("+254792274634"); // true
 * ```
 */
export const keplus254PhoneNumber = /^(?:\+254)?([1-9](?:(?:[0-9][0-9])|(?:0[0-8])|(4[0-1]))[0-9]{6})$/g;

/**
 * Checks if a string is a valid phone number format
 *
 * @example
 * ```
 * ke254PhoneNumber.test("254792274634"); // true
 * ```
 */
export const ke254PhoneNumber = /^(?:254)?([1-9](?:(?:[0-9][0-9])|(?:0[0-8])|(4[0-1]))[0-9]{6})$/g;
