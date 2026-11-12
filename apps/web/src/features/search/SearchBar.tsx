import { useState, type FormEvent, type JSX } from 'react';

interface SearchBarProps {
  initialValue: string;
  onSearch: (query: string) => void;
}

export default function SearchBar({
  initialValue,
  onSearch,
}: SearchBarProps): JSX.Element {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form className="search" onSubmit={handleSubmit}>
      <input
        type="search"
        name="q"
        placeholder="Search query"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
        }}
      />
      <input type="submit" value="Go!" />
    </form>
  );
}
