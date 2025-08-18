import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { adminService } from '../../services/adminServices';

export default function UserManagement() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const toast = useRef(null);

	const load = async () => {
		try {
			const data = await adminService.getAllUsers();
			setUsers(data || []);
		} catch (e) {
			toast.current?.show({ severity: 'error', summary: 'Hata', detail: e?.response?.data?.error || 'Kullanıcılar getirilemedi' });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { load(); }, []);

	const onDelete = async (row) => {
		try {
			await adminService.deleteUser(row.id);
			toast.current?.show({ severity: 'success', summary: 'Silindi', detail: 'Kullanıcı silindi' });
			load();
		} catch (e) {
			toast.current?.show({ severity: 'error', summary: 'Hata', detail: e?.response?.data?.error || 'Silinemedi' });
		}
	};

	return (
		<div>
			<Toast ref={toast} />
			<DataTable value={users} loading={loading} paginator rows={10} responsiveLayout="scroll">
				<Column field="id" header="ID" sortable />
				<Column field="email" header="E-posta" sortable />
				<Column field="firstName" header="Ad" />
				<Column field="lastName" header="Soyad" />
				<Column field="roleType" header="Rol" />
				<Column body={(row) => (
					<div className="flex gap-2">
						<Button label="Sil" className="p-button-danger p-button-sm" onClick={() => onDelete(row)} />
					</div>
				)} header="İşlemler" />
			</DataTable>
		</div>
	);
}
