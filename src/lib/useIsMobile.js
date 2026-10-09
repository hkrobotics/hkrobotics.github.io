import React from 'react';

export function useIsMobile(breakpoint = 700) {
  const get = () => typeof window !== 'undefined' && window.innerWidth < breakpoint;
  const [isMobile, setIsMobile] = React.useState(get);
  React.useEffect(() => {
    const onResize = () => setIsMobile(get());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
}
