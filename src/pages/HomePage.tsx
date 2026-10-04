import type { JSX } from 'react';
import Article from '../features/article/Article';
import Sidebar from '../features/layout/Sidebar';

export default function HomePage(): JSX.Element {
  return (
    <main>
      <Article />
      <Sidebar />
    </main>
  );
}
