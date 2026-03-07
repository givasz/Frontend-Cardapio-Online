import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ScheduleProvider } from './contexts/ScheduleContext';
import App from './App.jsx';
import AdmPage from './pages/AdmPage.jsx';
import PedidosStatus from './pages/pedidoStatus.jsx';
import PizzaCustomization from './pages/PizzaCustomization.jsx';
import Checkout from './pages/Checkout.jsx';
import ItemForm from './pages/ItemForm.jsx';
import './index.css';

const Root = () => (
  <>
    <ScrollRestoration />
    <Outlet />
  </>
);

// Define as rotas da aplicação
const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/customize-pizza",
        element: <PizzaCustomization />,
      },
      {
        path: "/checkout",
        element: <Checkout />,
      },
      {
        path: "/adm",
        element: <AdmPage />,
      },
      {
        path: "/admin/item-form",
        element: <ItemForm />,
      },
      {
        path: "/pedidos",
        element: <PedidosStatus />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ScheduleProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </ScheduleProvider>
    </AuthProvider>
  </React.StrictMode>
);
