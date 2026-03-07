import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles';
import { API_BASE_URL } from '../config';
import StyledButton from './StyledButton';
// 1. Importar os ícones, assim como no ItemManager
import { EditIcon, TrashIcon } from './Icons';

const CategoryManager = () => {
    const { token } = useAuth();
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');

    // 2. Estados para controlar a edição
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [updatedCategoryName, setUpdatedCategoryName] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/categorias`);
            if (!response.ok) throw new Error('Falha ao buscar categorias.');
            setCategories(await response.json());
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        try {
            const response = await fetch(`${API_BASE_URL}/admin/categoria`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ nome: newCategoryName })
            });
            if (!response.ok) throw new Error('Falha ao criar categoria.');
            setNewCategoryName('');
            fetchCategories();
        } catch (err) {
            setError(err.message);
        }
    };

    // 3. Função para DELETAR uma categoria (similar ao ItemManager)
    const handleDelete = async (categoryId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/categoria/${categoryId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao excluir a categoria.');
            }
            setConfirmDeleteId(null);
            fetchCategories();
        } catch (err) {
            setError(err.message);
        }
    };

    // 4. Função para ATUALIZAR uma categoria
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!updatedCategoryName.trim() || !editingCategoryId) return;
        try {
            const response = await fetch(`${API_BASE_URL}/admin/categoria/${editingCategoryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ nome: updatedCategoryName })
            });
             if (!response.ok) throw new Error('Falha ao atualizar a categoria.');
             setEditingCategoryId(null); // Sai do modo de edição
             setUpdatedCategoryName('');
             fetchCategories(); // Atualiza a lista
        } catch (err) {
            setError(err.message);
        }
    };

    // 5. Funções auxiliares para entrar e sair do modo de edição
    const handleStartEdit = (category) => {
        setEditingCategoryId(category.id);
        setUpdatedCategoryName(category.nome);
    };

    const handleCancelEdit = () => {
        setEditingCategoryId(null);
        setUpdatedCategoryName('');
    };


    return (
        <div style={styles.card}>
            <div style={{ ...styles.input, padding: '1.5rem', border: 'none', height: 'auto', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 500 }}>Categorias</h3>
                <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Nome da nova categoria" style={{ ...styles.input, flexGrow: 1 }} />
                    <StyledButton type="submit">Adicionar</StyledButton>
                </form>
            </div>
            <div style={{ borderTop: '1px solid #E5E7EB' }}>
                {isLoading ? <p style={{ padding: '1.5rem' }}>Carregando...</p> : error ? <p style={{ padding: '1.5rem', color: 'red' }}>{error}</p> : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {categories.map((cat, index) => (
                            <li key={cat.id} style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: index < categories.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                                {/* 6. Lógica de renderização condicional: ou mostra o nome, ou mostra o formulário de edição */}
                                {editingCategoryId === cat.id ? (
                                    <form onSubmit={handleUpdate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                                        <input 
                                           value={updatedCategoryName} 
                                           onChange={(e) => setUpdatedCategoryName(e.target.value)} 
                                           style={{ ...styles.input, flexGrow: 1 }}
                                           autoFocus
                                        />
                                        <StyledButton type="submit">Salvar</StyledButton>
                                        <StyledButton variant="secondary" type="button" onClick={handleCancelEdit}>Cancelar</StyledButton>
                                    </form>
                                ) : (
                                    <>
                                        <span style={{ color: 'black' }}>{cat.nome}</span>
                                        {confirmDeleteId === cat.id ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <span style={{ fontSize: '0.78rem', color: '#DC2626', fontWeight: 600 }}>Excluir?</span>
                                                <button onClick={() => handleDelete(cat.id)} style={{ padding: '0.3rem 0.6rem', backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '0.35rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Sim</button>
                                                <button onClick={() => setConfirmDeleteId(null)} style={{ padding: '0.3rem 0.6rem', backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '0.35rem', cursor: 'pointer', fontSize: '0.78rem' }}>Não</button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                <StyledButton variant="ghost" onClick={() => handleStartEdit(cat)} title="Editar categoria">
                                                    <EditIcon style={{ color: '#777777ff', width: '1.25rem', height: '1.25rem' }} />
                                                </StyledButton>
                                                <StyledButton variant="ghost" onClick={() => setConfirmDeleteId(cat.id)} title="Excluir categoria" style={{ color: '#DC2626' }}>
                                                    <TrashIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                                                </StyledButton>
                                            </div>
                                        )}
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default CategoryManager;