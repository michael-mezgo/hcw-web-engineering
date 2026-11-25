import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../search/SearchBar';

interface NavProps {
  query: string;
  onSearch: (query: string) => void;
}

export default function Nav({ query, onSearch }: NavProps): JSX.Element {
  return (
    <div className="nav">
      <ul>
        <li>
          <Link to="/">Home</Link>
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
        <li>
          <Link to="/register">Register</Link>
        </li>
      </ul>

      {/* key resets the input when the query in the URL changes */}
      <SearchBar key={query} initialValue={query} onSearch={onSearch} />
    </div>
  );
}
