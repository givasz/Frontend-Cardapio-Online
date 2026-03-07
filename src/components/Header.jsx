import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import styles from '../styles';
import { PizzaIcon, ShoppingCartIcon, PedidoIcon } from './Icons';

const Header = () => {
    const { isCartOpen, setIsCartOpen, cartItemCount } = useCart();

    return (
        <header style={{
            backgroundColor: 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 1px 0 #FEE2E2, 0 4px 16px rgba(220, 38, 38, 0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            width: '100%',
            borderBottom: '2.5px solid #DC2626',
        }}>
            <div style={styles.container}>
                <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4.5rem' }}>
                    {/* Logo */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
                        <div style={{
                            width: '2.75rem',
                            height: '2.75rem',
                            backgroundColor: '#DC2626',
                            borderRadius: '0.625rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.35)',
                        }}>
                            <PizzaIcon style={{ height: '1.6rem', width: '1.6rem', color: 'white' }} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#DC2626', letterSpacing: '-0.03em', lineHeight: 1 }}>
                                La Brasa
                            </h1>
                            <p style={{ fontSize: '0.65rem', fontWeight: 500, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1, marginTop: '0.2rem' }}>
                                Pizzaria
                            </p>
                        </div>
                    </Link>

                    {/* Nav actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Link
                            to="/pedidos"
                            className="header-nav-link"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                padding: '0.5rem 0.875rem',
                                textDecoration: 'none',
                            }}
                        >
                            <PedidoIcon style={{ height: '1.25rem', width: '1.25rem', color: '#6B7280' }} />
                            <h4 className="header-nav-text" style={{ margin: 0, color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>
                                Meus Pedidos
                            </h4>
                        </Link>

                        <button
                            onClick={() => setIsCartOpen(!isCartOpen)}
                            className="cart-btn"
                            style={{
                                position: 'relative',
                                padding: '0.5rem 0.875rem',
                                background: isCartOpen ? '#FEF2F2' : 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                            }}
                        >
                            <ShoppingCartIcon style={{ height: '1.25rem', width: '1.25rem', color: isCartOpen ? '#DC2626' : '#6B7280' }} />
                            <h4 className="header-nav-text" style={{ margin: 0, color: isCartOpen ? '#DC2626' : '#374151', fontWeight: 600, fontSize: '0.875rem' }}>
                                Carrinho
                            </h4>
                            {cartItemCount > 0 && (
                                <span style={{
                                    display: 'flex',
                                    height: '1.35rem',
                                    minWidth: '1.35rem',
                                    padding: '0 0.4rem',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '9999px',
                                    backgroundColor: '#DC2626',
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    color: 'white',
                                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)',
                                }}>
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
