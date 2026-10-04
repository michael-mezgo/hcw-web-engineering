import { useState, type JSX } from 'react';
import Article from './features/article/Article';
import Footer from './features/layout/Footer';
import Header from './features/layout/Header';
import Nav from './features/layout/Nav';
import Sidebar from './features/layout/Sidebar';
import { SearchQueryContext } from './features/search/SearchContext';

export default function App(): JSX.Element {
  const [query, setQuery] = useState('');

  return (
    <>
      <Header />
      <Nav onSearch={setQuery} />
      <main>
        <SearchQueryContext value={query}>
          <Article />
        </SearchQueryContext>
        <Sidebar />
      </main>
      <Footer />
    </>
  );
}
