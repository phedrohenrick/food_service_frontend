import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { useStorefront } from '../../shared/generalContext.jsx';
import useTableSession from './src/hooks/useTableSession';
import TableLayout from './src/components/TableLayout';
import Identify from './src/pages/Identify';
import Menu from './src/pages/Menu';
import Product from './src/pages/Product';
import Comanda from './src/pages/Comanda';
import Conta from './src/pages/Conta';

const CustomerTableApp = () => {
  const { slug, tableId } = useParams();
  const { tenant } = useStorefront();
  const session = useTableSession(slug, tableId);

  useEffect(() => {
    if (slug) {
      try { localStorage.setItem('tenantSlug', slug); } catch (_) {}
    }
  }, [slug]);

  if (!session.session) {
    return (
      <Identify
        slug={slug}
        tableId={tableId}
        tenant={tenant}
        session={session}
      />
    );
  }

  return (
    <TableLayout slug={slug} tableId={tableId} session={session}>
      <Routes>
        <Route index element={<Menu slug={slug} tableId={tableId} />} />
        <Route
          path="produto/:productId"
          element={<Product slug={slug} tableId={tableId} session={session} />}
        />
        <Route
          path="comanda"
          element={<Comanda slug={slug} tableId={tableId} session={session} />}
        />
        <Route
          path="conta"
          element={<Conta slug={slug} tableId={tableId} session={session} />}
        />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </TableLayout>
  );
};

export default CustomerTableApp;
