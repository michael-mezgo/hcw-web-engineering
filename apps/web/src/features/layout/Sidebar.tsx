import type { JSX } from 'react';

export default function Sidebar(): JSX.Element {
  return (
    <div className="secondary">
      <h2>Related</h2>
      <ul>
        <li>
          <a href="#">The trouble with Bees</a>
        </li>
        <li>
          <a href="#">The trouble with Otters</a>
        </li>
        <li>
          <a href="#">The trouble with Penguins</a>
        </li>
        <li>
          <a href="#">The trouble with Octopi</a>
        </li>
        <li>
          <a href="#">The trouble with Lemurs</a>
        </li>
      </ul>
    </div>
  );
}
