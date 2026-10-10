import './WindowControls.css';

const BUTTONS = ['close', 'minimize', 'zoom'];

// The three title-bar dots. Rendered without a wrapper so each view controls spacing.
export default function WindowControls() {
  return BUTTONS.map(b => <div key={b} className={`window-dot is-${b}`} />);
}
