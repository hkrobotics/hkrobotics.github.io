import React from 'react';
import { contact, formatPhone } from '../lib/contact.js';

// Renders a "show email" button; the real address is decoded and turned into
// a mailto/tel link only after a click, so bots that don't interact never see it.
export default function RevealContact({ kind = 'email', style, buttonStyle, label }) {
  const [value, setValue] = React.useState(null);

  if (!value) {
    return (
      <button
        type="button"
        onClick={() => setValue(contact[kind]())}
        style={{
          background: 'none', border: 'none', padding: 0, margin: 0,
          font: 'inherit', color: 'inherit', cursor: 'pointer',
          textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: 3,
          ...style, ...buttonStyle,
        }}
      >
        {label || (kind === 'email' ? 'click to reveal email' : 'click to reveal phone')}
      </button>
    );
  }

  const href = kind === 'email' ? `mailto:${value}` : `tel:${value}`;
  return <a href={href} style={style}>{kind === 'phone' ? formatPhone(value) : value}</a>;
}
