import type { JSX } from 'react';
import type { Bear } from './types';

interface BearImageProps {
  bear: Bear;
  width?: number;
}

// Shows the bear's image, or the placeholder if there is none.
export default function BearImage({
  bear,
  width = 200,
}: BearImageProps): JSX.Element {
  const style = { width: `${width}px`, height: 'auto' };

  if (bear.image !== null && bear.image !== '') {
    return <img src={bear.image} alt={`Image of ${bear.name}`} style={style} />;
  }

  return (
    <picture>
      <source srcSet="/placeholder.avif" type="image/avif" />
      <img
        src="/placeholder.jpg"
        alt={`No image available for ${bear.name}`}
        style={style}
      />
    </picture>
  );
}
