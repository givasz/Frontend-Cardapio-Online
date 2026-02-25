import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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

// Define as rotas da aplicação
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // A página principal (cardápio)
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
    element: <AdmPage />, // A página de administração
  },
  {
    path: "/admin/item-form",
    element: <ItemForm />, // Página de formulário de item (admin)
  },
  {
    path: "/pedidos",
    element: <PedidosStatus />, // A página de pedidos
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
