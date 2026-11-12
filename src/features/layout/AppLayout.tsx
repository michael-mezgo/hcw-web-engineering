import type { JSX } from 'react';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { SearchQueryContext } from '../search/SearchContext';
import Footer from './Footer';
import Header from './Header';
import Nav from './Nav';

export default function AppLayout(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // The search query lives in the URL (?q=...), so it can be shared and works
  // with the browser's back button.
  const query = searchParams.get('q') ?? '';

  const handleSearch = (value: string): void => {
    void navigate({
      pathname: '/',
      search: value === '' ? '' : new URLSearchParams({ q: value }).toString(),
    });
  };

  return (
    <>
      <Header />
      <Nav query={query} onSearch={handleSearch} />
      <SearchQueryContext value={query}>
        <Outlet />
      </SearchQueryContext>
      <Footer />
    </>
  );
}
