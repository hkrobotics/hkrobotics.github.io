import React from 'react';
import { cx } from '../lib/cx.js';
import { contact, formatPhone } from '../lib/contact.js';
import './RevealContact.css';

// Renders a "click to reveal" button; the real address is decoded and turned into
// a mailto/tel link only after a click, so bots that don't interact never see it.
// `className` styles both the button and the resulting link.
export default function RevealContact({ kind = 'email', className }) {
  const [value, setValue] = React.useState(null);

  if (!value) {
    return (
      <button type="button" className={cx('reveal', className)} onClick={() => setValue(contact[kind]())}>
        {kind === 'email' ? 'click to reveal email' : 'click to reveal phone'}
      </button>
    );
  }

  const href = kind === 'email' ? `mailto:${value}` : `tel:${value}`;
  return <a href={href} className={className}>{kind === 'phone' ? formatPhone(value) : value}</a>;
}
