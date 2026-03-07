import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles';
import { API_BASE_URL } from '../config';
import StyledButton from '../components/StyledButton';
import { XIcon } from '../components/Icons';

const PLACEHOLDER_IMAGE = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgMTUwIDEwMCI+CiAgICA8cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPgogICAgPHBhdGggZD0iTTMwIDgwIEw1MCA0MCBMNzAgNjAgTDEwMCAzMCBMMTMwIDcwIEwxNTAgNTAgTDE1MCAxMDAgTDAgMTAwIFoiIGZpbGw9IiNjY2MiLz4KICAgIDxjaXJjbGUgY3g9IjY1IiBjeT0iMzUiIHI9IjEwIiBmaWxsPSIjY2NjIi8+CiAgICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJjZW50cmFsIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZmlsbD0iI2FhYSI+Tk8gSU1BR0U8L3RleHQ+Cjwvc3ZnPg==";

const ItemForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = useAuth();
    const { item, categories } = location.state || {};

    const [formData, setFormData] = useState({
        nome: '', descricao: '', preco: '', categoriaId: '', imagemUrl: '', disponivel: true,
        precoP: '', precoM: '', precoG: '', precoGG: '',
        precoPComBorda: '', precoMComBorda: '', precoGComBorda: '', precoGGComBorda: '',
        promocaoAtiva: false, descontoPercent: '',
        descontoPPercent: '', descontoMPercent: '', descontoGPercent: '', descontoGGPercent: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imageMode, setImageMode] = useState('url'); // 'url' | 'file'

    const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const MAX_SIZE = 500;
                let { width, height } = img;
                if (width > MAX_SIZE || height > MAX_SIZE) {
                    if (width > height) {
                        height = Math.round((height * MAX_SIZE) / width);
                        width = MAX_SIZE;
                    } else {
                        width = Math.round((width * MAX_SIZE) / height);
                        height = MAX_SIZE;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                // Tenta qualidades progressivamente menores até caber (~300KB em base64 ≈ ~220KB real)
                let quality = 0.72;
                let dataUrl;
                do {
                    dataUrl = canvas.toDataURL('image/jpeg', quality);
                    quality -= 0.1;
                } while (dataUrl.length > 400_000 && quality > 0.2);
                setFormData(prev => ({ ...prev, imagemUrl: dataUrl }));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        if (!categories) {
            navigate('/admin');
            return;
        }

        if (item) {
            setFormData({
                nome: item.nome || '',
                descricao: item.descricao || '',
                preco: item.preco || '',
                precoP: item.precoP || '',
                precoM: item.precoM || '',
                precoG: item.precoG || '',
                precoGG: item.precoGG || '',
                precoPComBorda: item.precoPComBorda || '',
                precoMComBorda: item.precoMComBorda || '',
                precoGComBorda: item.precoGComBorda || '',
                precoGGComBorda: item.precoGGComBorda || '',
                categoriaId: item.categoriaId || '',
                imagemUrl: item.imagemUrl || '',
                disponivel: item.disponivel ?? true,
                promocaoAtiva: item.promocaoAtiva ?? false,
                descontoPercent: item.descontoPercent ?? '',
                descontoPPercent: item.descontoPPercent ?? '',
                descontoMPercent: item.descontoMPercent ?? '',
                descontoGPercent: item.descontoGPercent ?? '',
                descontoGGPercent: item.descontoGGPercent ?? '',
            });
        } else {
            setFormData({
                nome: '', descricao: '', preco: '', imagemUrl: '', disponivel: true,
                precoP: '', precoM: '', precoG: '', precoGG: '',
                precoPComBorda: '', precoMComBorda: '', precoGComBorda: '', precoGGComBorda: '',
                categoriaId: categories.length > 0 ? categories[0].id : '',
                promocaoAtiva: false, descontoPercent: '',
                descontoPPercent: '', descontoMPercent: '', descontoGPercent: '', descontoGGPercent: '',
            });
        }
    }, [item, categories, navigate]);

    const selectedCategory = categories?.find(cat => cat.id === parseInt(formData.categoriaId));
    const isPizzaCategory = selectedCategory?.nome.toLowerCase() === 'pizzas';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const url = item ? `${API_BASE_URL}/admin/item/${item.id}` : `${API_BASE_URL}/admin/item`;
        const method = item ? 'PUT' : 'POST';

        const body = {
            nome: formData.nome,
            descricao: formData.descricao,
            imagemUrl: formData.imagemUrl,
            disponivel: formData.disponivel,
            categoriaId: parseInt(formData.categoriaId),
            promocaoAtiva: formData.promocaoAtiva,
            descontoPercent: formData.descontoPercent ? parseFloat(formData.descontoPercent) : null,
        };

        if (isPizzaCategory) {
            body.preco = parseFloat(formData.precoP) || 0;
            body.precoP = formData.precoP ? parseFloat(formData.precoP) : null;
            body.precoM = formData.precoM ? parseFloat(formData.precoM) : null;
            body.precoG = formData.precoG ? parseFloat(formData.precoG) : null;
            body.precoGG = formData.precoGG ? parseFloat(formData.precoGG) : null;
            // Preços COM borda (opcionais)
            body.precoPComBorda = formData.precoPComBorda ? parseFloat(formData.precoPComBorda) : null;
            body.precoMComBorda = formData.precoMComBorda ? parseFloat(formData.precoMComBorda) : null;
            body.precoGComBorda = formData.precoGComBorda ? parseFloat(formData.precoGComBorda) : null;
            body.precoGGComBorda = formData.precoGGComBorda ? parseFloat(formData.precoGGComBorda) : null;
            body.descontoPPercent = formData.descontoPPercent ? parseFloat(formData.descontoPPercent) : null;
            body.descontoMPercent = formData.descontoMPercent ? parseFloat(formData.descontoMPercent) : null;
            body.descontoGPercent = formData.descontoGPercent ? parseFloat(formData.descontoGPercent) : null;
            body.descontoGGPercent = formData.descontoGGPercent ? parseFloat(formData.descontoGGPercent) : null;
        } else {
            body.preco = parseFloat(formData.preco) || 0;
            body.precoP = null;
            body.precoM = null;
            body.precoG = null;
            body.precoGG = null;
            body.precoPComBorda = null;
            body.precoMComBorda = null;
            body.precoGComBorda = null;
            body.precoGGComBorda = null;
        }

        if (!body.nome || !body.preco || !body.categoriaId) {
            setError('Nome, Categoria e Preço são obrigatórios.');
            setIsLoading(false);
            return;
        }

        try {
            const activeToken = token || localStorage.getItem('admin_token');
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeToken}` }, body: JSON.stringify(body) });
            if (response.status === 401) { setError('Sessão expirada. Faça logout e login novamente.'); setIsLoading(false); return; }
            if (!response.ok) { const errData = await response.json(); throw new Error(errData.error || 'Falha ao salvar o item.'); }
            navigate('/adm');
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    };

    if (!categories) return null;

    return (
        <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
            <div style={{
                ...styles.container,
                maxWidth: '800px',
                paddingTop: '2rem',
                paddingBottom: '2rem'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        ...styles.modalHeader,
                        backgroundColor: '#DC2626',
                        color: 'white',
                        padding: '1.5rem'
                    }}>
                        <h3 style={{fontSize: '1.5rem', fontWeight: 600}}>
                            {item ? "Editar Item" : "Adicionar Item"}
                        </h3>
                        <StyledButton
                            onClick={() => navigate('/adm')}
                            style={{padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.2)'}}
                        >
                            <XIcon/>
                        </StyledButton>
                    </div>

                    <div style={{padding: '2rem'}}>
                        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                            <div>
                                <label style={{...styles.label, display: 'block', marginBottom: '0.5rem'}}>
                                    Nome do Item
                                </label>
                                <input
                                    style={styles.input}
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{...styles.label, display: 'block', marginBottom: '0.5rem'}}>
                                    Descrição
                                </label>
                                <textarea
                                    style={{...styles.input, height: '100px', resize: 'vertical'}}
                                    name="descricao"
                                    value={formData.descricao}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label style={{...styles.label, display: 'block', marginBottom: '0.5rem'}}>
                                    Categoria
                                </label>
                                <select
                                    name="categoriaId"
                                    value={formData.categoriaId}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                    ))}
                                </select>
                            </div>

                            {isPizzaCategory ? (
                                <>
                                    <div>
                                        <label style={{...styles.label, display: 'block', marginBottom: '0.75rem', fontWeight: 'bold', fontSize: '1.125rem'}}>
                                            Preços SEM Borda Recheada
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                            <div>
                                                <label style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem', display: 'block'}}>
                                                    Tamanho P *
                                                </label>
                                                <input
                                                    style={styles.input}
                                                    name="precoP"
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.precoP}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem', display: 'block'}}>
                                                    Tamanho M
                                                </label>
                                                <input
                                                    style={styles.input}
                                                    name="precoM"
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.precoM}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div>
                                                <label style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem', display: 'block'}}>
                                                    Tamanho G
                                                </label>
                                                <input
                                                    style={styles.input}
                                                    name="precoG"
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.precoG}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div>
                                                <label style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem', display: 'block'}}>
                                                    Tamanho GG
                                                </label>
                                                <input
                                                    style={styles.input}
                                                    name="precoGG"
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.precoGG}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        backgroundColor: '#FEF2F2',
                                        padding: '1.25rem',
                                        borderRadius: '0.5rem',
                                        border: '2px solid #FEE2E2'
                                    }}>
                                        <label style={{...styles.label, display: 'block', marginBottom: '0.75rem', fontWeight: 'bold', fontSize: '1.125rem', color: '#DC2626'}}>
                                            Preços COM Borda Recheada
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                            <div>
                                                <label style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem', display: 'block'}}>
                                                    Tamanho P com Borda
                                                </label>
                                                <input
                                                    style={styles.input}
                                                    name="precoPComBorda"
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.precoPComBorda}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div>
                                                <label style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem', display: 'block'}}>
                                                    Tamanho M com Borda
                                                </label>
                                                <input
                                                    style={styles.input}
                                                    name="precoMComBorda"
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.precoMComBorda}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div>
                                                <label style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem', display: 'block'}}>
                                                    Tamanho G com Borda
                                                </label>
                                                <input
                                                    style={styles.input}
                                                    name="precoGComBorda"
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.precoGComBorda}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div>
                                                <label style={{fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem', display: 'block'}}>
                                                    Tamanho GG com Borda
                                                </label>
                                                <input
                                                    style={styles.input}
                                                    name="precoGGComBorda"
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.precoGGComBorda}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label style={{...styles.label, display: 'block', marginBottom: '0.5rem'}}>
                                        Preço
                                    </label>
                                    <input
                                        style={styles.input}
                                        name="preco"
                                        type="number"
                                        step="0.01"
                                        value={formData.preco}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label style={{...styles.label, display: 'block', marginBottom: '0.5rem'}}>
                                    Imagem (Opcional)
                                </label>
                                {/* Toggle URL / Arquivo */}
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    {['url', 'file'].map(mode => (
                                        <button
                                            key={mode}
                                            type="button"
                                            onClick={() => setImageMode(mode)}
                                            style={{
                                                padding: '0.35rem 1rem',
                                                borderRadius: '9999px',
                                                border: '1.5px solid',
                                                borderColor: imageMode === mode ? '#DC2626' : '#D1D5DB',
                                                backgroundColor: imageMode === mode ? '#FEF2F2' : 'white',
                                                color: imageMode === mode ? '#DC2626' : '#6B7280',
                                                fontWeight: imageMode === mode ? 700 : 400,
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {mode === 'url' ? 'URL' : 'Upload do computador'}
                                        </button>
                                    ))}
                                </div>

                                {imageMode === 'url' ? (
                                    <input
                                        style={styles.input}
                                        name="imagemUrl"
                                        value={formData.imagemUrl}
                                        onChange={handleChange}
                                        placeholder="https://exemplo.com/imagem.jpg"
                                    />
                                ) : (
                                    <div style={{
                                        border: '2px dashed #D1D5DB',
                                        borderRadius: '0.5rem',
                                        padding: '1.25rem',
                                        textAlign: 'center',
                                        backgroundColor: '#F9FAFB',
                                        cursor: 'pointer',
                                    }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                            id="imageFileInput"
                                        />
                                        <label htmlFor="imageFileInput" style={{ cursor: 'pointer' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                                            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                                Clique para selecionar uma imagem
                                            </p>
                                            <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                                                JPG, PNG, WebP — será comprimida automaticamente
                                            </p>
                                        </label>
                                    </div>
                                )}

                                {/* Preview */}
                                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                                    <div style={{
                                        width: '240px',
                                        aspectRatio: '4/3',
                                        borderRadius: '0.5rem',
                                        border: '2px solid #E5E7EB',
                                        overflow: 'hidden',
                                        backgroundColor: '#F3F4F6',
                                        position: 'relative',
                                    }}>
                                        <img
                                            src={formData.imagemUrl || PLACEHOLDER_IMAGE}
                                            alt="Pré-visualização"
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                objectPosition: 'center',
                                            }}
                                        />
                                    </div>
                                </div>
                                {formData.imagemUrl && (
                                    <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, imagemUrl: '' }))}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#9CA3AF',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                textDecoration: 'underline',
                                            }}
                                        >
                                            Remover imagem
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '1rem',
                                backgroundColor: '#F9FAFB',
                                borderRadius: '0.5rem'
                            }}>
                                <input
                                    type="checkbox"
                                    id="disponivel"
                                    name="disponivel"
                                    checked={formData.disponivel}
                                    onChange={(e) => setFormData({ ...formData, disponivel: e.target.checked })}
                                    style={{ height: '1.25rem', width: '1.25rem', cursor: 'pointer' }}
                                />
                                <label htmlFor="disponivel" style={{ cursor: 'pointer', fontSize: '1rem', fontWeight: '500' }}>
                                    Item Disponível para Venda
                                </label>
                            </div>

                            {/* Seção de Promoção */}
                            <div style={{ backgroundColor: '#FFF7ED', border: '2px solid #FED7AA', borderRadius: '0.5rem', padding: '1.25rem' }}>
                                <p style={{ fontWeight: 700, fontSize: '1rem', color: '#C2410C', marginBottom: '0.75rem' }}>
                                    🏷️ Promoção Temporária
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {isPizzaCategory ? (
                                        <div>
                                            <label style={{ ...styles.label, display: 'block', marginBottom: '0.5rem' }}>
                                                Desconto por tamanho (%) — deixe em branco para não aplicar
                                            </label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
                                                {[
                                                    { label: 'P', field: 'descontoPPercent', preco: formData.precoP },
                                                    { label: 'M', field: 'descontoMPercent', preco: formData.precoM },
                                                    { label: 'G', field: 'descontoGPercent', preco: formData.precoG },
                                                    { label: 'GG', field: 'descontoGGPercent', preco: formData.precoGG },
                                                ].map(({ label, field, preco }) => (
                                                    <div key={field} style={{ textAlign: 'center' }}>
                                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#C2410C', marginBottom: '0.25rem' }}>{label}</div>
                                                        <input
                                                            style={{ ...styles.input, textAlign: 'center', padding: '0.4rem', marginBottom: '0.25rem' }}
                                                            name={field}
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.1"
                                                            value={formData[field]}
                                                            onChange={handleChange}
                                                            placeholder="%"
                                                        />
                                                        {formData[field] && preco && (
                                                            <div style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 600 }}>
                                                                R$ {(parseFloat(preco) * (1 - parseFloat(formData[field]) / 100)).toFixed(2)}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label style={{ ...styles.label, display: 'block', marginBottom: '0.4rem' }}>
                                                Desconto (%)
                                            </label>
                                            <input
                                                style={{ ...styles.input, maxWidth: '160px' }}
                                                name="descontoPercent"
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                value={formData.descontoPercent}
                                                onChange={handleChange}
                                                placeholder="Ex: 20"
                                            />
                                            {formData.descontoPercent && formData.preco && (
                                                <p style={{ fontSize: '0.82rem', color: '#C2410C', marginTop: '0.35rem', fontWeight: 500 }}>
                                                    Preço com desconto: R$ {(parseFloat(formData.preco) * (1 - parseFloat(formData.descontoPercent) / 100)).toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div
                                            onClick={() => setFormData({ ...formData, promocaoAtiva: !formData.promocaoAtiva })}
                                            style={{
                                                width: '2.5rem', height: '1.4rem', borderRadius: '999px',
                                                backgroundColor: formData.promocaoAtiva ? '#DC2626' : '#D1D5DB',
                                                position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s', flexShrink: 0,
                                            }}
                                        >
                                            <div style={{
                                                position: 'absolute', top: '2px',
                                                left: formData.promocaoAtiva ? 'calc(100% - 1.1rem - 2px)' : '2px',
                                                width: '1.1rem', height: '1.1rem', borderRadius: '50%',
                                                backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s',
                                            }} />
                                        </div>
                                        <label style={{ cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, color: formData.promocaoAtiva ? '#DC2626' : '#6B7280' }}
                                            onClick={() => setFormData({ ...formData, promocaoAtiva: !formData.promocaoAtiva })}>
                                            {formData.promocaoAtiva ? 'Promoção ATIVA — aparece no cardápio' : 'Promoção inativa'}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <p style={{
                                    color: '#DC2626',
                                    fontSize: '1rem',
                                    backgroundColor: '#FEE2E2',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #FCA5A5'
                                }}>
                                    {error}
                                </p>
                            )}

                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '1rem',
                                paddingTop: '1.5rem',
                                borderTop: '2px solid #E5E7EB',
                                marginTop: '1rem'
                            }}>
                                <StyledButton
                                    type="button"
                                    variant="secondary"
                                    onClick={() => navigate('/adm')}
                                    style={{padding: '0.75rem 1.5rem', fontSize: '1rem'}}
                                >
                                    Cancelar
                                </StyledButton>
                                <StyledButton
                                    type="submit"
                                    disabled={isLoading}
                                    style={{padding: '0.75rem 1.5rem', fontSize: '1rem'}}
                                >
                                    {isLoading ? 'Salvando...' : 'Salvar'}
                                </StyledButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemForm;
