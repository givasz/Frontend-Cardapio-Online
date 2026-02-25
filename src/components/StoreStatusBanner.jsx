import React, { useState, useEffect } from 'react';
import { useSchedule } from '../contexts/ScheduleContext';
import styles from '../styles';
import { ClockIcon } from './Icons';
import { API_BASE_URL } from '../config';

const StoreStatusBanner = () => {
    const { isOpen, storeStatusMessage } = useSchedule();
    const [taxaEntrega, setTaxaEntrega] = useState(null);

    useEffect(() => {
        const fetchTaxaEntrega = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/entrega`);
                if (response.ok) {
                    const data = await response.json();
                    setTaxaEntrega(data.taxaEntrega);
                }
            } catch (error) {
                console.error("Falha ao buscar a taxa de entrega:", error);
                // Não mostra alert aqui pois é apenas informação secundária no banner
            }
        };

        fetchTaxaEntrega();
    }, []);

    const bannerStyle = {
        padding: '0.75rem 1rem',
        textAlign: 'center',
        fontWeight: 500,
        color: 'white',
        backgroundColor: isOpen ? '#16A34A' : '#DC2626'
    };

    return (
        <div style={bannerStyle}>
            <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <ClockIcon style={{ width: '1.5rem', height: '1.5rem', color: 'white', flexShrink: 0 }} />
                
                {/* ✅ ALTERAÇÃO: Container para o texto, permitindo múltiplas linhas */}
                <div style={{ textAlign: 'left', color: 'white' }}>
                    
                    {/* Linha 1: Status de abertura/fechamento */}
                    <p style={{ margin: 0, fontWeight: 500 }}>
                        {storeStatusMessage}
                    </p>
                    
                    {/* Linha 2: Taxa de entrega (só aparece se a loja estiver aberta e a taxa carregada) */}
                    {isOpen && taxaEntrega !== null && (
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', opacity: 0.9 }}>
                            {`Taxa de Entrega: R$ ${taxaEntrega.toFixed(2).replace('.', ',')}`}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoreStatusBanner;