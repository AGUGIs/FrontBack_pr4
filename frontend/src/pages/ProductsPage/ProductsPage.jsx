import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import ProductList from '../../components/ProductList';
import ProductModal from '../../components/ProductModal';
import './ProductsPage.scss';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await api.getProducts();
            setProducts(data);
        } catch (err) {
            console.error(err);
            alert('Ошибка загрузки товаров');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setModalMode('create');
        setEditingProduct(null);
        setModalOpen(true);
    };

    const openEdit = (product) => {
        setModalMode('edit');
        setEditingProduct(product);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingProduct(null);
    };

    const handleDelete = async (id) => {
        const ok = window.confirm('Удалить этот товар?');
        if (!ok) return;
        try {
            await api.deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error(err);
            alert('Ошибка удаления товара');
        }
    };

    const handleSubmitModal = async (payload) => {
        try {
            if (modalMode === 'create') {
                const newProduct = await api.createProduct(payload);
                setProducts(prev => [...prev, newProduct]);
            } else {
                const updated = await api.updateProduct(payload.id, payload);
                setProducts(prev => prev.map(p => p.id === payload.id ? updated : p));
            }
            closeModal();
        } catch (err) {
            console.error(err);
            alert('Ошибка сохранения товара');
        }
    };

    return (
        <div className="page">
            <header className="header">
                <div className="header__inner">
                    <div className="brand">🍳 Магазин Кастрюль</div>
                    <div className="header__right">React + Express</div>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    <div className="toolbar">
                        <h1 className="title">Каталог товаров</h1>
                        <button className="btn btn--primary" onClick={openCreate}>
                            + Добавить товар
                        </button>
                    </div>

                    {loading ? (
                        <div className="empty">Загрузка...</div>
                    ) : (
                        <ProductList 
                            products={products} 
                            onEdit={openEdit} 
                            onDelete={handleDelete} 
                        />
                    )}
                </div>
            </main>

            <footer className="footer">
                <div className="footer__inner">
                    © {new Date().getFullYear()} Магазин Кастрюль
                </div>
            </footer>

            <ProductModal
                open={modalOpen}
                mode={modalMode}
                initialProduct={editingProduct}
                onClose={closeModal}
                onSubmit={handleSubmitModal}
            />
        </div>
    );
}