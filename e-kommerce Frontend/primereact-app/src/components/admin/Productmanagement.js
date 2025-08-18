import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { adminService } from '../../services/adminServices';

export default function Productmanagement() {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState({});
	const toast = useRef(null);

	const load = async () => {
		try {
			const data = await adminService.getAllProducts();
			setProducts(data || []);
		} catch (e) {
			toast.current?.show({ severity: 'error', summary: 'Hata', detail: e?.response?.data?.error || 'Ürünler getirilemedi' });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { load(); }, []);

	const onDelete = async (row) => {
		try {
			await adminService.deleteProduct(row.id);
			toast.current?.show({ severity: 'success', summary: 'Silindi', detail: 'Ürün silindi' });
			load();
		} catch (e) {
			toast.current?.show({ severity: 'error', summary: 'Hata', detail: e?.response?.data?.error || 'Silinemedi' });
		}
	};

	const onSave = async (row) => {
		try {
			await adminService.updateProduct(row.id, {
				name: row.name,
				price: row.price,
				stock: row.stock,
				featured: !!row.featured,
				categoryId: row.categoryId,
				sellerId: row.sellerId,
				description: row.description,
				imageUrl: row.imageUrl
			});
			toast.current?.show({ severity: 'success', summary: 'Kaydedildi', detail: 'Ürün güncellendi' });
			setEditing({});
			load();
		} catch (e) {
			toast.current?.show({ severity: 'error', summary: 'Hata', detail: e?.response?.data?.error || 'Kaydedilemedi' });
		}
	};

	const textEditor = (options) => (
		<InputText value={options.value ?? ''} onChange={(e) => options.editorCallback(e.target.value)} />
	);

	return (
		<div>
			<Toast ref={toast} />
			<DataTable value={products} loading={loading} paginator rows={10} editMode="row" dataKey="id" onRowEditComplete={(e)=>onSave(e.newData)} responsiveLayout="scroll">
				<Column field="id" header="ID" sortable style={{ width: 80 }} />
				<Column field="name" header="İsim" editor={textEditor} sortable />
				<Column field="price" header="Fiyat" editor={textEditor} sortable />
				<Column field="stock" header="Stok" editor={textEditor} sortable />
				<Column field="sellerId" header="Satıcı" editor={textEditor} sortable />
				<Column field="categoryId" header="Kategori" editor={textEditor} sortable />
				<Column rowEditor headerStyle={{ width: '10rem' }} bodyStyle={{ textAlign: 'center' }}></Column>
				<Column body={(row) => (
					<Button label="Sil" className="p-button-danger p-button-sm" onClick={() => onDelete(row)} />
				)} header="İşlemler" style={{ width: 120 }} />
			</DataTable>
		</div>
	);
}
