import type { JSX } from 'react';

export default function SearchBar(): JSX.Element {
  return (
    <form className="search">
      <input type="search" name="q" placeholder="Search query" />
      <input type="submit" value="Go!" />
    </form>
  );
}
