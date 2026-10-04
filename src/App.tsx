import type { JSX } from 'react';
import { Route, Routes } from 'react-router-dom';
import { BearsProvider } from './features/bears/BearsContext';
import AppLayout from './features/layout/AppLayout';
import BearDetailPage from './pages/BearDetailPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App(): JSX.Element {
  return (
    <BearsProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="bears/:id" element={<BearDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BearsProvider>
  );
}
