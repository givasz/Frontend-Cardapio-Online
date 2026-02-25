import React from 'react';
import { Link } from 'react-router-dom'; // Importa o Link
import { useCart } from '../contexts/CartContext';
import styles from '../styles';
import { PizzaIcon, ShoppingCartIcon, PedidoIcon } from './Icons';

const Header = () => { // A prop setView foi removida daqui
    const { isCartOpen, setIsCartOpen, cartItemCount } = useCart();
    return (
        <header style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 6px rgba(220, 38, 38, 0.1)', position: 'sticky', top: 0, zIndex: 40, width: '100%', borderBottom: '3px solid #DC2626' }}>
            <div style={styles.container}>
                <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <PizzaIcon style={{ height: '3rem', width: '3rem', color: '#DC2626' }} />
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#DC2626', letterSpacing: '-0.025em' }}>La Brasa Pizzaria</h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <Link to="/pedidos" title="Acompanhe seu Pedido" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'none', transition: 'all 0.3s ease' }}>
                            <PedidoIcon style={{ height: '1.5rem', width: '1.5rem', color: '#374151' }} />
                            <h4 style={{ margin: 0, color: '#374151', fontWeight: 600 }}>Meus Pedidos</h4>
                        </Link>
                        <button onClick={() => setIsCartOpen(!isCartOpen)} style={{ position: 'relative', padding: '0.5rem 1rem', borderRadius: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShoppingCartIcon style={{ height: '1.5rem', width: '1.5rem', color: '#374151' }} />
                            <h4 style={{ margin: 0, color: '#374151', fontWeight: 600 }}>Meu Carrinho</h4>
                            {cartItemCount > 0 && (
                                <span style={{ display: 'flex', height: '1.5rem', minWidth: '1.5rem', padding: '0 0.5rem', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', backgroundColor: '#DC2626', fontSize: '0.75rem', fontWeight: 'bold', color: 'white' }}>
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;
