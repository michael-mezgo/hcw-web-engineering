import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import Highlight from '../search/Highlight';
import BearImage from './BearImage';
import type { Bear } from './types';

interface BearCardProps {
  bear: Bear;
}

export default function BearCard({ bear }: BearCardProps): JSX.Element {
  return (
    <div className="bear">
      <BearImage bear={bear} />
      <p>
        <b>
          <Link to={`/bears/${bear.id}`}>
            <Highlight text={bear.name} />
          </Link>
        </b>{' '}
        (<Highlight text={bear.binomial} />)
      </p>
      <p>
        <Highlight text={`Range: ${bear.range}`} />
      </p>
    </div>
  );
}
