import React from 'react';
import { VIEWS } from '../data/views.js';

// Which interactive view is showing, and how to switch. Provided by App.jsx.
export const ViewContext = React.createContext({ active: VIEWS[0].id, switchTo: () => {} });

export const useView = () => React.useContext(ViewContext);
