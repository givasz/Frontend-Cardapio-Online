import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles';
import StyledButton from './StyledButton';
import ItemManager from './ItemManager';
import CategoryManager from './CategoryManager';
import ScheduleManager from './ScheduleManager';
import PedidoManager from './pedidoManager';
import PedidoHistorico from './PedidoHistorico';
import FreteManager from './freteManager';
import MesaManager from './MesaManager';
import { PizzaIcon } from './Icons';

const TABS = [
    { id: 'pedidos',    label: 'Pedidos Ativos' },
    { id: 'mesas',      label: 'Mesas' },
    { id: 'historico',  label: 'Histórico' },
    { id: 'items',      label: 'Itens' },
    { id: 'categories', label: 'Categorias' },
    { id: 'schedule',   label: 'Horários' },
    { id: 'frete',      label: 'Frete' },
];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('pedidos');

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#FFFBFB' }}>
            {/* Header */}
            <header style={{
                backgroundColor: 'white',
                borderBottom: '2.5px solid #DC2626',
                boxShadow: '0 1px 0 #FEE2E2, 0 4px 16px rgba(220,38,38,0.06)',
                position: 'sticky',
                top: 0,
                zIndex: 40,
            }}>
                <div style={{ ...styles.container, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                            width: '2.25rem',
                            height: '2.25rem',
                            backgroundColor: '#DC2626',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(220,38,38,0.3)',
                            flexShrink: 0,
                        }}>
                            <PizzaIcon style={{ height: '1.35rem', width: '1.35rem', color: 'white' }} />
                        </div>
                        <div>
                            <p style={{ fontWeight: 800, color: '#DC2626', fontSize: '0.975rem', lineHeight: 1 }}>La Brasa Pizzaria</p>
                            <p style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1, marginTop: '0.2rem' }}>
                                Painel Admin
                            </p>
                        </div>
                    </div>
                    <StyledButton
                        onClick={() => { logout(); navigate('/'); }}
                        variant="secondary"
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem' }}
                    >
                        Sair
                    </StyledButton>
                </div>
            </header>

            <main style={{ ...styles.container, padding: '1.5rem 1rem' }}>
                {/* Tab navigation */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    border: '1.5px solid #FEE2E2',
                    padding: '0.35rem',
                    display: 'flex',
                    gap: '0.25rem',
                    flexWrap: 'wrap',
                    marginBottom: '1.5rem',
                    boxShadow: '0 2px 8px rgba(220,38,38,0.06)',
                }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '0.45rem 0.875rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.82rem',
                                fontFamily: 'inherit',
                                transition: 'all 0.15s ease',
                                backgroundColor: activeTab === tab.id ? '#DC2626' : 'transparent',
                                color: activeTab === tab.id ? 'white' : '#6B7280',
                            }}
                            onMouseEnter={e => {
                                if (activeTab !== tab.id) e.currentTarget.style.backgroundColor = '#FEF2F2';
                                if (activeTab !== tab.id) e.currentTarget.style.color = '#DC2626';
                            }}
                            onMouseLeave={e => {
                                if (activeTab !== tab.id) e.currentTarget.style.backgroundColor = 'transparent';
                                if (activeTab !== tab.id) e.currentTarget.style.color = '#6B7280';
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div>
                    {activeTab === 'pedidos'    && <PedidoManager />}
                    {activeTab === 'mesas'      && <MesaManager />}
                    {activeTab === 'historico'  && <PedidoHistorico />}
                    {activeTab === 'items'      && <ItemManager />}
                    {activeTab === 'categories' && <CategoryManager />}
                    {activeTab === 'schedule'   && <ScheduleManager />}
                    {activeTab === 'frete'      && <FreteManager />}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
