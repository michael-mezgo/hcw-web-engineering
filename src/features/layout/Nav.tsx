import type { JSX } from 'react';
import SearchBar from '../search/SearchBar';

interface NavProps {
  onSearch: (query: string) => void;
}

export default function Nav({ onSearch }: NavProps): JSX.Element {
  return (
    <div className="nav">
      <ul>
        <li>
          <a href="#">Home</a>
        </li>
        <li>
          <a href="#">Our team</a>
        </li>
        <li>
          <a href="#">Projects</a>
        </li>
        <li>
          <a href="#">Blog</a>
        </li>
      </ul>

      <SearchBar onSearch={onSearch} />
    </div>
  );
}
