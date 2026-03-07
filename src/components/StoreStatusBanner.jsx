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
            }
        };
        fetchTaxaEntrega();
    }, []);

    return (
        <div style={{
            backgroundColor: isOpen ? '#F0FDF4' : '#FEF2F2',
            borderBottom: `1px solid ${isOpen ? '#BBF7D0' : '#FECACA'}`,
            padding: '0.6rem 1rem',
        }}>
            <div style={{
                ...styles.container,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
            }}>
                {/* Status pill */}
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    backgroundColor: isOpen ? '#16A34A' : '#DC2626',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                    flexShrink: 0,
                }}>
                    <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        animation: isOpen ? 'pulse 2s ease-in-out infinite' : 'none',
                        flexShrink: 0,
                    }} />
                    {isOpen ? 'Aberto' : 'Fechado'}
                </span>

                <ClockIcon style={{ width: '1rem', height: '1rem', color: isOpen ? '#16A34A' : '#DC2626', flexShrink: 0 }} />

                <p style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: isOpen ? '#166534' : '#991B1B',
                }}>
                    {storeStatusMessage}
                </p>

            </div>
        </div>
    );
};

export default StoreStatusBanner;
