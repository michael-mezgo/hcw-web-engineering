import type { JSX } from 'react';
import BearCard from './BearCard';
import type { Bear } from './types';

interface BearListProps {
  bears: Bear[];
}

export default function BearList({ bears }: BearListProps): JSX.Element {
  return (
    <>
      {bears.map((bear) => (
        <BearCard key={bear.binomial} bear={bear} />
      ))}
    </>
  );
}
