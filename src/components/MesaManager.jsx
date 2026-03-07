import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';

const statusLabel = {
    1: { texto: 'Em Análise', cor: '#d4652f' },
    2: { texto: 'Na Fila', cor: '#e8a234' },
    3: { texto: 'Pronto', cor: '#5ab44f' },
    4: { texto: 'Finalizado', cor: '#6B7280' },
    5: { texto: 'Cancelado', cor: '#DC2626' },
};

const MesaManager = () => {
    const { token } = useAuth();
    const [sessoes, setSessoes] = useState([]);
    const [config, setConfig] = useState(null);
    const [mesaSelecionada, setMesaSelecionada] = useState(null); // { numero, sessao }
    const [fechandoId, setFechandoId] = useState(null);
    const [confirmFecharId, setConfirmFecharId] = useState(null);
    const [fetchError, setFetchError] = useState('');
    const [editandoMesas, setEditandoMesas] = useState(false);
    const [novoNumero, setNovoNumero] = useState('');
    const [salvando, setSalvando] = useState(false);

    const fetchTudo = async () => {
        try {
            const [resSessoes, resConfig] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/mesas`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/admin/configuracao`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            const dataSessoes = await resSessoes.json();
            const dataConfig = await resConfig.json();
            const listaSessoes = Array.isArray(dataSessoes) ? dataSessoes : [];
            setSessoes(listaSessoes);
            setConfig(dataConfig);
            setNovoNumero(String(dataConfig.numeroDeMesas));
            // Atualiza painel lateral se uma mesa já estava selecionada
            setMesaSelecionada(prev => {
                if (!prev) return null;
                const sessaoAtualizada = listaSessoes.find(s => s.mesa === prev.numero) || null;
                return { numero: prev.numero, sessao: sessaoAtualizada };
            });
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTudo();
        const id = setInterval(fetchTudo, 30000);
        return () => clearInterval(id);
    }, []);

    const handleSalvarConfig = async () => {
        setSalvando(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/configuracao/${config.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ numeroDeMesas: Number(novoNumero) }),
            });
            if (!res.ok) throw new Error('Falha ao salvar');
            const updated = await res.json();
            setConfig(updated);
            setEditandoMesas(false);
        } catch {
            setFetchError('Erro ao salvar número de mesas.');
        } finally {
            setSalvando(false);
        }
    };

    const handleFecharMesa = async (sessao) => {
        setConfirmFecharId(null);
        setFechandoId(sessao.id);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/sessao/${sessao.id}/fechar`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error((await res.json()).error);
            setMesaSelecionada(null);
            await fetchTudo();
        } catch (err) {
            setFetchError('Erro ao fechar mesa: ' + err.message);
        } finally {
            setFechandoId(null);
        }
    };

    const calcularTotal = (sessao) =>
        sessao.pedidos
            .filter(p => p.status !== 5)
            .reduce((acc, pedido) => {
                const sub = pedido.itens.reduce((a, item) => {
                    const preco = item.precoFinal ?? item.item?.preco ?? 0;
                    return a + (preco + (item.precoBorda ?? 0)) * item.quantidade;
                }, 0);
                return acc + sub + (pedido.taxaEntrega || 0);
            }, 0);

    const formatarHora = (d) => new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (!config) return <div style={{ padding: '2rem', color: '#6B7280' }}>Carregando...</div>;

    const todasMesas = Array.from({ length: config.numeroDeMesas }, (_, i) => {
        const num = String(i + 1);
        const sessao = sessoes.find(s => s.mesa === num) || null;
        return { numero: num, sessao };
    });

    const { sessao: sessaoSelecionada, numero: numeroSelecionado } = mesaSelecionada || {};
    const totalSelecionada = sessaoSelecionada ? calcularTotal(sessaoSelecionada) : 0;

    return (
        <div>
            {fetchError && (
                <div style={{ marginBottom: '1rem', backgroundColor: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '0.5rem', padding: '0.5rem 0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: '#DC2626', fontSize: '0.8rem', fontWeight: 500, margin: 0 }}>{fetchError}</p>
                    <button onClick={() => setFetchError('')} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0 0.25rem' }}>✕</button>
                </div>
            )}
            {/* Barra de config */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>
                    Total de mesas: <strong>{config.numeroDeMesas}</strong>
                </span>
                {!editandoMesas ? (
                    <button onClick={() => setEditandoMesas(true)} style={{ background: 'none', border: '1px solid #D1D5DB', borderRadius: '6px', padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.8rem', color: '#374151' }}>
                        Editar
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                            type="text" inputMode="numeric"
                            value={novoNumero}
                            onChange={(e) => setNovoNumero(e.target.value.replace(/\D/g, ''))}
                            style={{ width: '60px', padding: '0.3rem 0.5rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.9rem' }}
                        />
                        <button onClick={handleSalvarConfig} disabled={salvando} style={{ backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                            {salvando ? '...' : 'Salvar'}
                        </button>
                        <button onClick={() => { setEditandoMesas(false); setNovoNumero(String(config.numeroDeMesas)); }} style={{ background: 'none', border: '1px solid #D1D5DB', borderRadius: '6px', padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                            Cancelar
                        </button>
                    </div>
                )}
                <button onClick={fetchTudo} style={{ marginLeft: 'auto', background: 'none', border: '1px solid #D1D5DB', borderRadius: '6px', padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.8rem', color: '#374151' }}>
                    Atualizar
                </button>
            </div>

            {/* Layout: grade + painel lateral */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

                {/* Grade de mesas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem', flex: '0 0 auto', width: mesaSelecionada ? '320px' : '100%' }}>
                    {todasMesas.map(({ numero, sessao }) => {
                        const ocupada = sessao !== null;
                        const selecionada = mesaSelecionada?.numero === numero;
                        const total = ocupada ? calcularTotal(sessao) : 0;
                        const pendentes = ocupada ? sessao.pedidos.filter(p => [1, 2, 3].includes(p.status)).length : 0;

                        return (
                            <button
                                key={numero}
                                onClick={() => setMesaSelecionada(selecionada ? null : { numero, sessao })}
                                style={{
                                    borderRadius: '12px',
                                    border: selecionada ? '3px solid #1D4ED8' : `2px solid ${ocupada ? '#FCA5A5' : '#D1FAE5'}`,
                                    background: ocupada
                                        ? 'linear-gradient(135deg, #DC2626, #B91C1C)'
                                        : 'linear-gradient(135deg, #16A34A, #15803D)',
                                    color: 'white',
                                    padding: '1rem 0.75rem',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    boxShadow: selecionada ? '0 0 0 3px rgba(29,78,216,0.3)' : '0 2px 6px rgba(0,0,0,0.15)',
                                    transition: 'transform 0.1s',
                                }}
                            >
                                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Mesa {numero}</div>
                                {ocupada ? (
                                    <>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.2rem' }}>R$ {total.toFixed(2)}</div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.85, marginTop: '0.15rem' }}>
                                            {sessao.pedidos.length} pedido(s)
                                            {pendentes > 0 && <span style={{ display: 'block' }}>{pendentes} em andamento</span>}
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.2rem' }}>Livre</div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Painel de detalhes */}
                {mesaSelecionada && (
                    <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '2px solid #FEE2E2', overflow: 'hidden', minWidth: 0 }}>
                        {/* Cabeçalho do painel */}
                        <div style={{ background: 'linear-gradient(135deg, #DC2626, #B91C1C)', color: 'white', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>Mesa {numeroSelecionado}</h2>
                                {sessaoSelecionada && (
                                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', opacity: 0.85 }}>
                                        Aberta às {formatarHora(sessaoSelecionada.abertaEm)} · {sessaoSelecionada.pedidos.length} pedido(s)
                                    </p>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {sessaoSelecionada && (
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>R$ {totalSelecionada.toFixed(2)}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Total da mesa</div>
                                    </div>
                                )}
                                <button onClick={() => setMesaSelecionada(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '2rem', height: '2rem', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                            </div>
                        </div>

                        {/* Conteúdo */}
                        <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
                            {!sessaoSelecionada ? (
                                <p style={{ color: '#6B7280', textAlign: 'center', padding: '2rem 0' }}>Mesa livre — nenhum pedido no momento.</p>
                            ) : (
                                <>
                                    {/* Pedidos em colunas */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                        {sessaoSelecionada.pedidos.map(pedido => {
                                            const subtotal = pedido.itens.reduce((a, item) => {
                                                const preco = item.precoFinal ?? item.item?.preco ?? 0;
                                                return a + (preco + (item.precoBorda ?? 0)) * item.quantidade;
                                            }, 0);
                                            const st = statusLabel[pedido.status] || { texto: '?', cor: '#9CA3AF' };

                                            return (
                                                <div key={pedido.id} style={{ border: '1px solid #E5E7EB', borderRadius: '10px', backgroundColor: '#F9FAFB', overflow: 'hidden' }}>
                                                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' }}>
                                                        <div>
                                                            <span style={{ fontWeight: 700 }}>Pedido #{pedido.id}</span>
                                                            <span style={{ fontSize: '0.8rem', color: '#6B7280', marginLeft: '0.5rem' }}>{formatarHora(pedido.criadoEm)}</span>
                                                        </div>
                                                        <span style={{ backgroundColor: st.cor, color: 'white', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                            {st.texto}
                                                        </span>
                                                    </div>
                                                    <div style={{ padding: '0.75rem 1rem' }}>
                                                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>{pedido.nomeCliente}</p>
                                                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#4B5563' }}>
                                                            {pedido.itens.map(itemPedido => {
                                                                const preco = itemPedido.precoFinal ?? itemPedido.item?.preco ?? 0;
                                                                const borda = itemPedido.precoBorda ?? 0;
                                                                return (
                                                                    <li key={itemPedido.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0', borderBottom: '1px solid #F3F4F6' }}>
                                                                        <span>
                                                                            {itemPedido.quantidade}x {itemPedido.item?.nome}
                                                                            {itemPedido.tamanho && <strong style={{ color: '#EA580C' }}> ({itemPedido.tamanho})</strong>}
                                                                            {itemPedido.tipoMassa && <span style={{ color: '#6B7280' }}> · {itemPedido.tipoMassa.nome}</span>}
                                                                            {itemPedido.borda && <span style={{ color: '#DC2626' }}> · Borda {itemPedido.borda.nome}</span>}
                                                                        </span>
                                                                        <span style={{ fontWeight: 600, marginLeft: '0.5rem', whiteSpace: 'nowrap' }}>
                                                                            R$ {((preco + borda) * itemPedido.quantidade).toFixed(2)}
                                                                        </span>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                        {pedido.observacoes && (
                                                            <p style={{ fontSize: '0.78rem', color: '#9CA3AF', fontStyle: 'italic', margin: '0.25rem 0' }}>Obs: {pedido.observacoes}</p>
                                                        )}
                                                        <div style={{ textAlign: 'right', fontWeight: 700, color: '#EA580C', marginTop: '0.25rem' }}>
                                                            R$ {subtotal.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Rodapé com total e fechar */}
                                    <div style={{ borderTop: '2px solid #FEE2E2', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                            Total: <span style={{ color: '#DC2626' }}>R$ {totalSelecionada.toFixed(2)}</span>
                                        </div>
                                        {confirmFecharId === sessaoSelecionada.id ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                                                {sessaoSelecionada.pedidos.filter(p => [1,2,3].includes(p.status)).length > 0 && (
                                                    <span style={{ fontSize: '0.78rem', color: '#DC2626', fontWeight: 600 }}>
                                                        ⚠️ {sessaoSelecionada.pedidos.filter(p => [1,2,3].includes(p.status)).length} pedido(s) em andamento
                                                    </span>
                                                )}
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Confirmar fechamento?</span>
                                                    <button onClick={() => handleFecharMesa(sessaoSelecionada)} disabled={fechandoId === sessaoSelecionada.id} style={{ backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
                                                        {fechandoId === sessaoSelecionada.id ? 'Fechando...' : 'Sim, fechar'}
                                                    </button>
                                                    <button onClick={() => setConfirmFecharId(null)} style={{ backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmFecharId(sessaoSelecionada.id)}
                                                disabled={fechandoId === sessaoSelecionada.id}
                                                style={{
                                                    backgroundColor: '#DC2626',
                                                    color: 'white', border: 'none', borderRadius: '10px',
                                                    padding: '0.75rem 2rem', fontWeight: 700, fontSize: '1rem',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Fechar Mesa
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MesaManager;
