"use client";

import React, { useState, useEffect } from 'react';
import { getAdminDashboardData, deleteAdminUser, createAdminUser, updateAdminUser } from './actions';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('Gestión de Usuarios');
  const [users, setUsers] = useState<any[]>([]);
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [allReservas, setAllReservas] = useState<any[]>([]);
  const [allPQRs, setAllPQRs] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  
  // Search and Forms state
  const [search, setSearch] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminDashboardData();
      setUsers(data.users);
      setGlobalStats(data.stats);
      setAllReservas(data.allReservas || []);
      setAllPQRs(data.allPQRs || []);
      setAllReviews(data.allReviews || []);
      setDebugInfo(data.debug);
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

  const exportDataJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(users, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "usuarios_serviya.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(search.toLowerCase()) || 
    user.id.includes(search)
  );

  const stats = [
    { label: 'Usuarios',      value: globalStats?.usuarios || users.length,   icon: '👥', color: 'from-blue-600 to-blue-800' },
    { label: 'Citas',         value: globalStats?.citas || 0,                 icon: '🗓️', color: 'from-purple-600 to-purple-800' },
    { label: 'Reseñas',       value: globalStats?.resenas || 0,               icon: '⭐', color: 'from-yellow-500 to-orange-500' },
    { label: 'PQRs',          value: globalStats?.pqrs || 0,                  icon: '💬', color: 'from-green-500 to-green-700' },
    { label: 'Promedio',      value: globalStats?.promedio || '0.0',          icon: '📊', color: 'from-orange-500 to-red-500' },
    { label: 'Emergencias',   value: globalStats?.emergencias || 0,           icon: '🚨', color: 'from-red-600 to-red-800' },
    { label: 'PQR Pendientes',value: globalStats?.pqrPendientes || 0,         icon: '🕒', color: 'from-teal-500 to-teal-700' },
    { label: 'Sin Respuesta', value: globalStats?.sinRespuesta || 0,          icon: '📈', color: 'from-pink-500 to-pink-700' },
  ];

  const tabs = [
    { label: `Gestión de Usuarios (${globalStats?.usuarios || users.length})`, id: 'Gestión de Usuarios', icon: '👥' },
    { label: `Gestión de Citas (${globalStats?.citas || 0})`, id: 'Gestión de Citas', icon: '🗓️' },
    { label: `Gestión de Reseñas (${globalStats?.resenas || 0})`, id: 'Gestión de Reseñas', icon: '⭐' },
    { label: `Gestión de PQRs (${globalStats?.pqrs || 0})`, id: 'Gestión de PQRs', icon: '💬' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-8 relative">
      {/* Fondos radiales */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* Banner Superior */}
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-purple-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between shadow-2xl">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <span className="text-3xl">🛡️</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Panel de Super Administrador
              </h1>
              <p className="text-white/80 text-sm">
                Control total del sistema SERVIYA • Acceso completo
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={exportDataJson}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 backdrop-blur-md"
            >
              <span className="text-lg">📥</span> Exportar Datos
            </button>
            <button 
              className="bg-red-500/80 hover:bg-red-500 border border-red-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 backdrop-blur-md"
            >
              <span className="text-lg">🗑️</span> Limpiar Sistema
            </button>
          </div>
        </div>

        {/* Debug Panel (Solo si hay errores o el usuario lo activa) */}
        {(debugInfo && (Object.keys(debugInfo.errors).length > 0 || showDebug)) && (
          <div className="bg-red-900/10 border border-red-500/20 rounded-2xl p-4 text-xs font-mono text-red-400 space-y-2">
            <div className="flex justify-between items-center mb-2">
               <span className="font-bold underline uppercase">⚠️ Modo Diagnóstico Activo</span>
               <button onClick={() => setShowDebug(!showDebug)} className="text-white hover:underline">[Toggle Full Log]</button>
            </div>
            {Object.entries(debugInfo.errors).map(([key, val]: any) => (
              <div key={key}>❌ {key}: {val}</div>
            ))}
            {showDebug && (
              <div className="mt-4 pt-4 border-t border-red-500/10 text-neutral-400">
                 Registros cargados: {JSON.stringify(debugInfo.counts)}
              </div>
            )}
          </div>
        )}

        {/* Botón flotante secreto para activar debug si todo sale en 0 */}
        {!showDebug && stats.every(s => s.value === 0 || s.value === '0.0') && (
           <button 
             onClick={() => setShowDebug(true)}
             className="fixed bottom-4 right-4 bg-neutral-800 text-[10px] p-2 rounded-full opacity-30 hover:opacity-100 transition-opacity"
           >
             DEBUG
           </button>
        )}

        {/* Cajas de Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-[#111] border border-neutral-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all hover:border-neutral-600 hover:-translate-y-1">
               <span className={`text-2xl mb-2 bg-gradient-to-br ${s.color} w-10 h-10 rounded-xl flex items-center justify-center shadow-lg`}>
                 {s.icon}
               </span>
               <span className="text-2xl font-black text-white leading-none mb-1">
                 {s.value}
               </span>
               <span className={`text-[10px] uppercase font-bold text-neutral-400 tracking-wider`}>
                 {s.label}
               </span>
            </div>
          ))}
        </div>

        {/* Pestañas (Tabs) */}
        <div className="flex flex-wrap gap-2 justify-between border-b border-neutral-800 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-500 bg-orange-500/5 rounded-t-xl'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300 hover:bg-white/5 rounded-t-xl'
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Zona de Gestión Completa de Usuarios */}
        {activeTab === 'Gestión de Usuarios' && (
          <div className="bg-[#111] border border-neutral-800 rounded-3xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span>👥</span> Gestión Completa de Usuarios
                </h2>
                <p className="text-neutral-500 text-sm mt-1">Control total sobre todos los usuarios del sistema</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">🔍</span>
                   <input 
                     type="text" 
                     placeholder="Buscar usuarios..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="w-full bg-black border border-neutral-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-orange-500 transition-colors"
                   />
                </div>
                <button 
                  onClick={() => { setIsCreateModalOpen(true); setEmailInput(''); setPasswordInput(''); }}
                  className="bg-orange-500 hover:bg-orange-400 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap"
                >
                  + Usuario
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                 <div className="text-center py-10 text-orange-500 font-bold animate-pulse">Cargando usuarios...</div>
              ) : filteredUsers.length === 0 ? (
                 <div className="text-center py-10 text-neutral-500 font-medium">No se encontraron usuarios.</div>
              ) : (
                filteredUsers.map(user => (
                  <div key={user.id} className="bg-black/50 border border-neutral-800 rounded-2xl p-5 hover:border-orange-500/50 transition-all group flex flex-col md:flex-row gap-6 relative overflow-hidden">
                    {/* Borde izquierdo decorativo */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Avatar y Datos Personales */}
                    <div className="flex gap-4 items-center md:w-1/3">
                      <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center text-xl font-black shrink-0">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base truncate">{user.nombre || 'Usuario'}</h3>
                        <p className="text-neutral-500 text-sm truncate">{user.email}</p>
                      </div>
                    </div>
                    
                    {/* Meta Info */}
                    <div className="grid grid-cols-2 md:flex md:flex-1 gap-4 items-center text-xs text-neutral-400">
                       <div className="flex items-center gap-1.5"><span className="text-base">📅</span> Registro: {new Date(user.created_at || Date.now()).toLocaleDateString()}</div>
                       <div className="flex items-center gap-1.5"><span className="text-base">🕒</span> Acceso: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}</div>

                       {/* Pills extra */}
                       <div className="flex items-center gap-2 mt-2 md:mt-0 md:ml-auto">
                         <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold">
                           👤 {user.email?.split('@')[0]}
                         </span>
                         <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold">
                           {user.metrics?.citas || 0} citas
                         </span>
                         <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full font-bold">
                           {user.metrics?.resenas || 0} reseñas
                         </span>
                         <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-bold">
                           {user.metrics?.pqrs || 0} PQRs
                         </span>
                       </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-3 md:justify-end shrink-0 pt-4 md:pt-0 border-t md:border-0 border-neutral-800">
                       <button 
                         onClick={() => openEditModal(user)}
                         className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                       >
                         <span>✏️</span> Editar
                       </button>
                       <button 
                         onClick={() => handleDelete(user.id)}
                         className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                       >
                         <span>🗑️</span> Eliminar
                       </button>
                    </div>
                  </div>
                ))
               )}
            </div>
          </div>
        )}

        {/* Zona de Gestión de Citas */}
        {activeTab === 'Gestión de Citas' && (
          <div className="bg-[#111] border border-neutral-800 rounded-3xl p-6 md:p-8 overflow-hidden">
             <div className="mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2"><span>🗓️</span> Registro de Citas</h2>
                <p className="text-neutral-500 text-sm mt-1">Todas las citas agendadas en el sistema</p>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-neutral-800 text-neutral-500 text-xs uppercase font-bold">
                     <th className="px-4 py-3">Cliente</th>
                     <th className="px-4 py-3">Servicio</th>
                     <th className="px-4 py-3">Dirección</th>
                     <th className="px-4 py-3">Fecha Agenda</th>
                     <th className="px-4 py-3">ID Reserva</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm">
                    {allReservas.length === 0 ? (
                      <tr><td colSpan={5} className="py-10 text-center text-neutral-600">No hay citas registradas.</td></tr>
                    ) : (
                      allReservas.map((res, i) => (
                        <tr key={i} className="border-b border-neutral-900 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-4">
                             <div className="font-bold">{res.cliente_nombre}</div>
                             <div className="text-[10px] text-neutral-500">{res.cliente_email}</div>
                          </td>
                          <td className="px-4 py-4">Servicio #{res.id_servicio}</td>
                          <td className="px-4 py-4 italic text-neutral-400">{res.direccion || 'No especificada'}</td>
                          <td className="px-4 py-4 text-orange-400 font-mono">{new Date(res.fecha_agenda).toLocaleString()}</td>
                          <td className="px-4 py-4 text-neutral-600">#{res.id_reserva}</td>
                        </tr>
                      ))
                    )}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* Zona de Gestión de Reseñas */}
        {activeTab === 'Gestión de Reseñas' && (
          <div className="bg-[#111] border border-neutral-800 rounded-3xl p-6 md:p-8 overflow-hidden">
             <div className="mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2"><span>⭐</span> Valoraciones y Reseñas</h2>
                <p className="text-neutral-500 text-sm mt-1">Feedback directo de los clientes</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allReviews.length === 0 ? (
                  <div className="col-span-full py-10 text-center text-neutral-600">No hay reseñas por ahora.</div>
                ) : (
                  allReviews.map((rev, i) => (
                    <div key={i} className="bg-black/50 border border-neutral-800 p-5 rounded-2xl relative overflow-hidden group">
                       <div className="absolute right-4 top-4 text-2xl opacity-20 group-hover:opacity-100 transition-opacity">⭐</div>
                       <div className="text-xs text-neutral-500 mb-1">Por: <span className="text-white font-bold">{rev.cliente_nombre}</span></div>
                       <div className="flex gap-1 mb-3">
                          {[...Array(5)].map((_, idx) => (
                             <span key={idx} className={idx < rev.puntuacion ? 'text-yellow-500' : 'text-neutral-700'}>★</span>
                          ))}
                       </div>
                       <p className="text-sm text-neutral-300 italic">"{rev.comentario || 'Sin comentario escrito.'}"</p>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}

        {/* Zona de Gestión de PQRs */}
        {activeTab === 'Gestión de PQRs' && (
          <div className="bg-[#111] border border-neutral-800 rounded-3xl p-6 md:p-8 overflow-hidden">
             <div className="mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2"><span>💬</span> Buzón de PQRs</h2>
                <p className="text-neutral-500 text-sm mt-1">Gestión de Peticiones, Quejas y Reclamos</p>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-neutral-800 text-neutral-500 text-xs uppercase font-bold">
                     <th className="px-4 py-3">Cliente</th>
                     <th className="px-4 py-3">Tipo / Estado</th>
                     <th className="px-4 py-3">Descripción</th>
                     <th className="px-4 py-3">Fecha</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm">
                    {allPQRs.length === 0 ? (
                      <tr><td colSpan={4} className="py-10 text-center text-neutral-600">No hay PQRs registrados.</td></tr>
                    ) : (
                      allPQRs.map((pqr, i) => (
                        <tr key={i} className="border-b border-neutral-900 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-4">
                             <div className="font-bold">{pqr.cliente_nombre}</div>
                          </td>
                          <td className="px-4 py-4">
                             <span className="bg-neutral-800 px-2 py-0.5 rounded text-[10px] font-bold block w-fit mb-1">{pqr.tipo_pqr}</span>
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                               pqr.estado_pqr === 'Resuelto' || pqr.estado_pqr === 'Cerrado' 
                               ? 'bg-green-500/20 text-green-500' 
                               : 'bg-orange-500/20 text-orange-500 animate-pulse'
                             }`}>
                                {pqr.estado_pqr}
                             </span>
                          </td>
                          <td className="px-4 py-4 text-neutral-400 max-w-xs truncate">{pqr.descripcion || 'Sin descripción.'}</td>
                          <td className="px-4 py-4 text-neutral-600 text-xs font-mono">{new Date(pqr.fecha_pqr || Date.now()).toLocaleDateString()}</td>
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
                  className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="text-sm text-neutral-400 mb-1 block">Contraseña</label>
                <input required type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)}
                  className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2 text-neutral-400 hover:text-white transition">Cancelar</button>
              <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2 rounded-lg font-medium transition">Crear Usuario</button>
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
