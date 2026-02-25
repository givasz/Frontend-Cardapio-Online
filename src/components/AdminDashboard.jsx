import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles';
import StyledButton from './StyledButton';
import ItemManager from './ItemManager';
import CategoryManager from './CategoryManager';
import ScheduleManager from './ScheduleManager';
import PedidoManager from './pedidoManager';
import PedidoHistorico from './PedidoHistorico'; // 1. IMPORTA O NOVO COMPONENTE
import FreteManager from './freteManager'; // ✅ 1. IMPORTA O NOVO COMPONENTE
import MesaManager from './MesaManager';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('pedidos');
    
    // Função para simplificar o estilo dos botões da aba
    const getTabStyle = (tabName) => ({
        background:'none', 
        border:'none', 
        cursor:'pointer', 
        paddingBottom: '1rem', 
        borderBottom: activeTab === tabName ? '2px solid #EA580C' : '2px solid transparent', 
        color: activeTab === tabName ? '#EA580C' : '#6B7280', 
        fontWeight: 500
    });

    return (
        <div style={{minHeight: '100vh', backgroundColor: '#F9FAFB'}}>
            <header style={{backgroundColor: 'white', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'}}>
                 <div style={{...styles.container, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '5rem'}}>
                    <h1 style={{fontSize: '1.25rem', fontWeight: 600, color: 'black'}}>Painel Admin</h1>
                    <StyledButton onClick={() => { logout(); navigate('/'); }} variant="secondary">Sair</StyledButton>
                </div>
            </header>
            <main style={{...styles.container, padding: '2rem 1rem'}}>
                <div style={{borderBottom: '1px solid #E5E7EB', marginBottom: '1.5rem'}}>
                    <nav style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
                        <button onClick={() => setActiveTab('pedidos')} style={getTabStyle('pedidos')}>Pedidos Ativos</button>
                        <button onClick={() => setActiveTab('mesas')} style={getTabStyle('mesas')}>Mesas</button>
                        <button onClick={() => setActiveTab('historico')} style={getTabStyle('historico')}>Histórico</button>

                        <button onClick={() => setActiveTab('items')} style={getTabStyle('items')}>Itens</button>
                        <button onClick={() => setActiveTab('categories')} style={getTabStyle('categories')}>Categorias</button>
                        <button onClick={() => setActiveTab('schedule')} style={getTabStyle('schedule')}>Horários</button>
                        <button onClick={() => setActiveTab('frete')} style={getTabStyle('frete')}>Frete</button>
                    </nav>
                </div>
                <div>
                    {activeTab === 'pedidos' && <PedidoManager />}
                    {activeTab === 'mesas' && <MesaManager />}
                    {activeTab === 'historico' && <PedidoHistorico />}

                    {activeTab === 'items' && <ItemManager />}
                    {activeTab === 'categories' && <CategoryManager />}
                    {activeTab === 'schedule' && <ScheduleManager />}
                    {activeTab === 'frete' && <FreteManager />}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;