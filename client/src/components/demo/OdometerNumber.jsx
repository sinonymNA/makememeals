import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

// Smoothly rolls a number from its previous value to the next — used for the
// live grocery-bill counter and the savings roll-downs. Works both directions.
export default function OdometerNumber({
  value,
  prefix = '$',
  decimals = 2,
  duration = 0.8,
  style,
  className,
}) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const controls = animate(prev.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, duration]);

  return (
    <span className={className} style={{ fontVariantNumeric: 'tabular-nums', ...style }}>
      {prefix}
      {display.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}
