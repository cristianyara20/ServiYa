"use client";

import React, { useState, useEffect } from 'react';
import { getAdminUsers, deleteAdminUser, createAdminUser, updateAdminUser } from './actions';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Forms state
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario completamente?')) {
      await deleteAdminUser(id);
      fetchUsers();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminUser(emailInput, passwordInput);
      setIsCreateModalOpen(false);
      setEmailInput('');
      setPasswordInput('');
      fetchUsers();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        await updateAdminUser(selectedUser.id, {
           email: emailInput, 
           ...(passwordInput ? { password: passwordInput } : {}) 
        });
        setIsEditModalOpen(false);
        setSelectedUser(null);
        setEmailInput('');
        setPasswordInput('');
        fetchUsers();
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setEmailInput(user.email);
    setPasswordInput(''); // Do not load password
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 relative overflow-hidden">
      {/* Fondos radiales para modo oscuro */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Cabecera */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500 mb-1">
            Panel de Administración
          </h1>
          <p className="text-neutral-400">
            Gestiona usuarios, servicios y monitorea el rendimiento global.
          </p>
        </div>
        <button 
          onClick={() => { setIsCreateModalOpen(true); setEmailInput(''); setPasswordInput(''); }}
          className="bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 px-5 py-2.5 rounded-full font-medium transition-all flex items-center gap-2"
        >
          <span>➕</span> Nuevo Usuario
        </button>
      </div>

      {/* Navegación de Pestañas */}
      <div className="relative z-10 flex gap-2 mb-8 bg-neutral-900 border border-neutral-800 p-1 rounded-xl w-max">
        {['overview', 'usuarios'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-300 capitalize ${
              activeTab === tab
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Contenido Dinámico */}
      <div className="relative z-10 space-y-8">
        
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Usuarios Auth', value: users.length.toString(), icon: '🫂', trend: 'Online', color: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20' },
              { label: 'Servicios Config', value: 'Soporte', icon: '🗓️', trend: 'Activo', color: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/20' },
            ].map((stat, i) => (
              <div key={i} className={`bg-gradient-to-br ${stat.color} border ${stat.border} rounded-2xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl filter drop-shadow-md">{stat.icon}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md bg-green-500/20 text-green-400`}>
                    {stat.trend}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{loading ? '...' : stat.value}</h3>
                <p className="text-sm font-medium text-neutral-400">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* TABLA DE USUARIOS */}
        {activeTab === 'usuarios' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden w-full">
            <div className="p-6 border-b border-neutral-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                👥 Gestión de Usuarios Supabase
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-400">
                <thead className="text-xs uppercase bg-black/40 border-b border-neutral-800 text-neutral-500">
                  <tr>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Último Acceso</th>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="text-center py-6">Cargando usuarios...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-6">No hay usuarios.</td></tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold">
                              {user.email?.charAt(0).toUpperCase()}
                            </div>
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-neutral-500">
                          {user.id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                           <button 
                             onClick={() => openEditModal(user)}
                             className="text-orange-400 hover:text-orange-300 transition-colors font-medium"
                           >
                             Editar
                           </button>
                           <button 
                             onClick={() => handleDelete(user.id)}
                             className="text-red-500 hover:text-red-400 transition-colors font-medium"
                           >
                             Eliminar
                           </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CREAR USER */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form onSubmit={handleCreate} className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Añadir Nuevo Usuario</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-neutral-400 mb-1 block">Correo Electrónico</label>
                <input required type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)}
                  className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-2 text-white outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="text-sm text-neutral-400 mb-1 block">Contraseña</label>
                <input required type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)}
                  className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-2 text-white outline-none focus:border-red-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2 text-neutral-400 hover:text-white transition">Cancelar</button>
              <button type="submit" className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-lg font-medium transition">Crear Usuario</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL EDITAR USER */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form onSubmit={handleEdit} className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Editar Usuario</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-neutral-400 mb-1 block">Correo Electrónico</label>
                <input required type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)}
                  className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="text-sm text-neutral-400 mb-1 block">Nueva Contraseña (Opcional)</label>
                <input type="password" placeholder="Rellenar sólo para cambiar" value={passwordInput} onChange={e => setPasswordInput(e.target.value)}
                  className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2 text-neutral-400 hover:text-white transition">Cancelar</button>
              <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2 rounded-lg font-medium transition">Guardar Cambios</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
