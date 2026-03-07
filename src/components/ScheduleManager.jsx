import React, { useState } from 'react';
import { useSchedule } from '../contexts/ScheduleContext';
import StyledButton from './StyledButton';

const ScheduleManager = () => {
    const { schedule, saveSchedule } = useSchedule();
    const [localSchedule, setLocalSchedule] = useState(schedule);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState('');

    const handleInputChange = (dayIndex, field, value) => {
        setLocalSchedule(prev => ({
            ...prev,
            [dayIndex]: { ...prev[dayIndex], [field]: value }
        }));
    };

    const handleSave = async () => {
        setSaveError('');
        try {
            await saveSchedule(localSchedule);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setSaveError(err.message || 'Erro ao salvar horários.');
        }
    };

    if (!localSchedule) return null;

    const toggleStyle = (on) => ({
        width: '2.5rem',
        height: '1.4rem',
        borderRadius: '999px',
        backgroundColor: on ? '#DC2626' : '#D1D5DB',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        flexShrink: 0,
    });

    const knobStyle = (on) => ({
        position: 'absolute',
        top: '2px',
        left: on ? 'calc(100% - 1.1rem - 2px)' : '2px',
        width: '1.1rem',
        height: '1.1rem',
        borderRadius: '50%',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left 0.2s',
    });

    const timeInputStyle = (on) => ({
        padding: '0.3rem 0.5rem',
        border: '1.5px solid #E5E7EB',
        borderRadius: '0.4rem',
        fontSize: '0.875rem',
        outline: 'none',
        fontFamily: 'inherit',
        backgroundColor: on ? 'white' : '#F3F4F6',
        color: '#374151',
    });

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1.5px solid #FEE2E2', overflow: 'hidden', boxShadow: '0 2px 8px rgba(220,38,38,0.06)' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)', padding: '1.25rem 1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>Horários de Funcionamento</h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>
                    Defina os dias e horários em que a loja aceita pedidos.
                </p>
            </div>

            {/* Days list */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.values(localSchedule).map((day, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.875rem 1rem',
                        borderRadius: '0.5rem',
                        backgroundColor: day.open ? '#FFF5F5' : '#F9FAFB',
                        border: `1.5px solid ${day.open ? '#FECACA' : '#E5E7EB'}`,
                        transition: 'all 0.15s ease',
                        flexWrap: 'wrap',
                    }}>
                        {/* Toggle switch + day name */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', minWidth: '130px' }}>
                            <div style={toggleStyle(day.open)} onClick={() => handleInputChange(index, 'open', !day.open)}>
                                <div style={knobStyle(day.open)} />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: day.open ? '#374151' : '#9CA3AF' }}>
                                {day.name}
                            </span>
                        </label>

                        {/* Time inputs */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: day.open ? 1 : 0.4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>Abre</span>
                                <input
                                    type="time"
                                    value={day.start}
                                    onChange={(e) => handleInputChange(index, 'start', e.target.value)}
                                    disabled={!day.open}
                                    style={timeInputStyle(day.open)}
                                />
                            </div>
                            <span style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>—</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>Fecha</span>
                                <input
                                    type="time"
                                    value={day.end}
                                    onChange={(e) => handleInputChange(index, 'end', e.target.value)}
                                    disabled={!day.open}
                                    style={timeInputStyle(day.open)}
                                />
                            </div>
                        </div>

                        {/* Status badge */}
                        <span style={{
                            marginLeft: 'auto',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            color: day.open ? '#16A34A' : '#9CA3AF',
                            backgroundColor: day.open ? '#D1FAE5' : '#F3F4F6',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                        }}>
                            {day.open ? 'Aberto' : 'Fechado'}
                        </span>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div style={{
                borderTop: '1.5px solid #FEE2E2',
                padding: '1rem 1.5rem',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '1rem',
                backgroundColor: '#FFFBFB',
            }}>
                {saveError && (
                    <div style={{ backgroundColor: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '0.5rem', padding: '0.4rem 0.75rem' }}>
                        <p style={{ color: '#DC2626', fontSize: '0.8rem', fontWeight: 500, margin: 0 }}>{saveError}</p>
                    </div>
                )}
                {saved && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: '0.5rem', padding: '0.4rem 0.75rem' }}>
                        <span style={{ color: '#16A34A', fontSize: '0.8rem', fontWeight: 600 }}>✓ Horários salvos!</span>
                    </div>
                )}
                <StyledButton onClick={handleSave}>Salvar Horários</StyledButton>
            </div>
        </div>
    );
};

export default ScheduleManager;
