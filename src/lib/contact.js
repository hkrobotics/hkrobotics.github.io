import { profile } from '../data/profile.js';

// Values in profile.contact are reversed + base64 so scrapers grepping the
// HTML or bundle for "x@y.z" / phone patterns find nothing. Only decode in
// response to a user action (click, typed command).
const decode = (encoded) => [...atob(encoded)].reverse().join('');

export const contact = {
  email: () => decode(profile.contact.email),
  phone: () => decode(profile.contact.phone),
};

export const formatPhone = (raw) => raw.replace(/^(\+\d{2})(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3 $4');
