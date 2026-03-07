import React, { useState } from 'react';
import WhatsAppButton from './WhatsAppButton';

const Spinner = () => (
    <svg className="animate-spin" style={{ width: '0.85rem', height: '0.85rem', flexShrink: 0 }} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
);

const minutosPassados = (dataString) => {
    const diff = Date.now() - new Date(dataString).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'agora';
    if (min === 1) return '1 min atrás';
    return `${min} min atrás`;
};

const isMesa = (endereco) => endereco?.toLowerCase().startsWith('mesa:');
const isRetirada = (endereco) => endereco === 'Retirar no estabelecimento';

const PedidoCard = ({ pedido, onStatusChange, acento }) => {
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    const handleAction = async (novoStatus) => {
        setLoadingAction(true);
        await onStatusChange(pedido.id, novoStatus);
        setLoadingAction(false);
    };

    const subtotal = pedido.itens.reduce((acc, ip) => {
        const preco = ip.precoFinal ?? ip.item?.preco ?? 0;
        return acc + ((preco + (ip.precoBorda ?? 0)) * ip.quantidade);
    }, 0);
    const total = (subtotal + (pedido.taxaEntrega || 0)).toFixed(2);

    const enderecoLabel = isMesa(pedido.endereco)
        ? `Mesa ${pedido.endereco.replace(/^Mesa:\s*/i, '')}`
        : isRetirada(pedido.endereco)
        ? 'Retirar no balcão'
        : pedido.endereco;

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}>
            {/* Topo colorido */}
            <div style={{
                height: '3px',
                backgroundColor: acento,
            }} />

            {/* Header: # e tempo */}
            <div style={{
                padding: '0.6rem 0.875rem 0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
                            #{pedido.id}
                        </span>
                        <span style={{
                            fontSize: '0.7rem', fontWeight: 700, color: 'white',
                            backgroundColor: acento,
                            padding: '0.1rem 0.45rem', borderRadius: '9999px',
                        }}>
                            {enderecoLabel}
                        </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginTop: '0.15rem' }}>
                        {pedido.nomeCliente}
                    </div>
                    {pedido.telefone && (
                        <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.05rem' }}>
                            {pedido.telefone}
                        </div>
                    )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 500 }}>
                        {minutosPassados(pedido.criadoEm)}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#CBD5E1' }}>
                        {new Date(pedido.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>

            {/* Linha divisória */}
            <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '0 0.875rem' }} />

            {/* Itens */}
            <div style={{ padding: '0.5rem 0.875rem' }}>
                {pedido.itens.map(ip => {
                    const preco = ip.precoFinal ?? ip.item?.preco ?? 0;
                    const precoBorda = ip.precoBorda ?? 0;
                    const extras = [
                        ip.tamanho,
                        ip.tipoMassa?.nome,
                        ip.borda?.nome ? `borda ${ip.borda.nome}` : null,
                    ].filter(Boolean);

                    return (
                        <div key={ip.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            padding: '0.25rem 0',
                            borderBottom: '1px solid #F8FAFC',
                        }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1E293B' }}>
                                    {ip.quantidade}× {ip.item?.nome || 'Item'}
                                </span>
                                {extras.length > 0 && (
                                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.05rem' }}>
                                        {extras.join(' · ')}
                                    </div>
                                )}
                            </div>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', flexShrink: 0, marginLeft: '0.5rem' }}>
                                R$ {(preco + precoBorda).toFixed(2)}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Observações */}
            {pedido.observacoes && (
                <div style={{
                    margin: '0 0.875rem 0.5rem',
                    padding: '0.35rem 0.6rem',
                    backgroundColor: '#FFFBEB',
                    borderLeft: '3px solid #F59E0B',
                    borderRadius: '0 0.25rem 0.25rem 0',
                    fontSize: '0.72rem', color: '#78350F',
                }}>
                    {pedido.observacoes}
                </div>
            )}

            {/* Rodapé: total + pagamento */}
            <div style={{
                padding: '0.5rem 0.875rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#F8FAFC',
                borderTop: '1px solid #F1F5F9',
            }}>
                <div>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 500 }}>
                        {pedido.metodoPagamento || 'Pagamento'}
                        {pedido.taxaEntrega > 0 && ` · +R$ ${pedido.taxaEntrega.toFixed(2)} entrega`}
                    </div>
                    {pedido.metodoPagamento === 'Dinheiro' && pedido.trocoPara > 0 && (
                        <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                            Troco p/ R$ {pedido.trocoPara.toFixed(2)}
                        </div>
                    )}
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 900, color: '#0F172A' }}>
                    R$ {total}
                </span>
            </div>

            {/* Ações */}
            <div style={{ padding: '0.625rem 0.875rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {pedido.status === 1 && (
                    <>
                        <button style={{ ...btnPrimary(acento), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }} onClick={() => handleAction(2)} disabled={loadingAction}>
                            {loadingAction ? <><Spinner />Atualizando...</> : 'Aceitar → Colocar na Fila'}
                        </button>
                        {confirmCancel ? (
                            <div style={{
                                border: '1px solid #FECACA', borderRadius: '0.375rem',
                                padding: '0.5rem', backgroundColor: '#FFF5F5',
                            }}>
                                <p style={{ margin: '0 0 0.375rem', fontSize: '0.75rem', color: '#991B1B', fontWeight: 600 }}>
                                    Cancelar este pedido?
                                </p>
                                <div style={{ display: 'flex', gap: '0.375rem' }}>
                                    <button
                                        style={btnSmall('#DC2626', 'white')}
                                        onClick={() => { setConfirmCancel(false); onStatusChange(pedido.id, 5); }}
                                    >
                                        Sim, cancelar
                                    </button>
                                    <button
                                        style={btnSmall('#F1F5F9', '#475569')}
                                        onClick={() => setConfirmCancel(false)}
                                    >
                                        Voltar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button style={btnGhost('#DC2626')} onClick={() => setConfirmCancel(true)}>
                                Cancelar pedido
                            </button>
                        )}
                        <WhatsAppButton pedido={pedido} statusAtual={1} />
                    </>
                )}

                {pedido.status === 2 && (
                    <>
                        <button style={{ ...btnPrimary(acento), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }} onClick={() => handleAction(3)} disabled={loadingAction}>
                            {loadingAction ? <><Spinner />Atualizando...</> : 'Marcar como Pronto'}
                        </button>
                        <WhatsAppButton pedido={pedido} statusAtual={2} />
                    </>
                )}

                {pedido.status === 3 && (
                    <>
                        <button style={{ ...btnPrimary('#64748B'), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }} onClick={() => handleAction(4)} disabled={loadingAction}>
                            {loadingAction ? <><Spinner />Atualizando...</> : 'Finalizar e Arquivar'}
                        </button>
                        <WhatsAppButton pedido={pedido} statusAtual={3} />
                    </>
                )}
            </div>
        </div>
    );
};

const btnPrimary = (cor) => ({
    width: '100%', padding: '0.55rem',
    backgroundColor: cor, color: 'white',
    border: 'none', borderRadius: '0.375rem',
    fontWeight: 700, fontSize: '0.8rem',
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'opacity 0.15s',
    textAlign: 'center',
});

const btnGhost = (cor) => ({
    width: '100%', padding: '0.45rem',
    backgroundColor: 'transparent', color: cor,
    border: `1px solid ${cor}22`,
    borderRadius: '0.375rem',
    fontWeight: 600, fontSize: '0.75rem',
    cursor: 'pointer', fontFamily: 'inherit',
    textAlign: 'center',
});

const btnSmall = (bg, color) => ({
    flex: 1, padding: '0.35rem',
    backgroundColor: bg, color,
    border: 'none', borderRadius: '0.3rem',
    fontWeight: 700, fontSize: '0.75rem',
    cursor: 'pointer', fontFamily: 'inherit',
});

export default PedidoCard;
