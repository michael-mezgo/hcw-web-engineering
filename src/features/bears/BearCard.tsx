import type { JSX } from 'react';
import type { Bear } from './types';

interface BearCardProps {
  bear: Bear;
}

export default function BearCard({ bear }: BearCardProps): JSX.Element {
  const imageStyle = { width: '200px', height: 'auto' };

  return (
    <div className="bear">
      {bear.image !== null && bear.image !== '' ? (
        <img
          src={bear.image}
          alt={`Image of ${bear.name}`}
          style={imageStyle}
        />
      ) : (
        <picture>
          <source srcSet="/placeholder.avif" type="image/avif" />
          <img
            src="/placeholder.jpg"
            alt={`No image available for ${bear.name}`}
            style={imageStyle}
          />
        </picture>
      )}
      <p>
        <b>{bear.name}</b> ({bear.binomial})
      </p>
      <p>Range: {bear.range}</p>
    </div>
  );
}
