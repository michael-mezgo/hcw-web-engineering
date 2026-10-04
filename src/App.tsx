import type { JSX } from 'react';
import Article from './features/article/Article';
import Footer from './features/layout/Footer';
import Header from './features/layout/Header';
import Nav from './features/layout/Nav';
import Sidebar from './features/layout/Sidebar';

export default function App(): JSX.Element {
  return (
    <>
      <Header />
      <Nav />
      <main>
        <Article />
        <Sidebar />
      </main>
      <Footer />
    </>
  );
}
