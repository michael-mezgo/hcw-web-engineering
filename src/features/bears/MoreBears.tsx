import type { JSX } from 'react';
import Highlight from '../search/Highlight';
import BearList from './BearList';
import type { Bear } from './types';

// Temporary test data until the bears are loaded from the Wikipedia API.
const testBears: Bear[] = [
  {
    name: 'Brown bear',
    binomial: 'Ursus arctos',
    image: '/wild-bear.jpg',
    range: 'Europe, Asia and North America',
  },
  {
    name: 'Sun bear',
    binomial: 'Helarctos malayanus',
    image: null,
    range: 'Southeast Asia',
  },
];

export default function MoreBears(): JSX.Element {
  return (
    <section className="more_bears">
      <h3>
        <Highlight text="More Bears" />
      </h3>
      <BearList bears={testBears} />
    </section>
  );
}
