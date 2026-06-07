'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';

const DEPARTMENTS = [
  { value: '', label: 'Seçilmedi' },
  { value: 'acil', label: 'Acil Servis' },
  { value: 'cerrahi', label: 'Cerrahi' },
  { value: 'dahiliye', label: 'Dahiliye' },
  { value: 'klinik', label: 'Klinik' },
  { value: 'kardiyoloji', label: 'Kardiyoloji' },
  { value: 'noroloji', label: 'Noroloji' },
  { value: 'pediatri', label: 'Pediatri' },
];

const ROLES = [
  { value: 'citizen', label: 'Vatandaş' },
  { value: 'doctor', label: 'Doktor' },
  { value: 'admin', label: 'Admin' },
];

const DEPT_LABELS = {
  acil: 'Acil Servis',
  cerrahi: 'Cerrahi',
  dahiliye: 'Dahiliye',
  klinik: 'Klinik',
  kardiyoloji: 'Kardiyoloji',
  noroloji: 'Noroloji',
  pediatri: 'Pediatri',
};

export default function AdminDashboard() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [dutyRecords, setDutyRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annTarget, setAnnTarget] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [userRes, aptRes, annRes, dutyRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/appointments'),
        fetch('/api/announcements'),
        fetch('/api/duty'),
      ]);

      setUsers((await userRes.json()).users || []);
      setAppointments((await aptRes.json()).appointments || []);
      setAnnouncements((await annRes.json()).announcements || []);
      setDutyRecords((await dutyRes.json()).duty || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(userId, data) {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...data }),
      });
      if (res.ok) {
        setMessage('Kullanıcı güncellendi.');
        loadData();
      }
    } catch (e) {
      setMessage('Bir hata oluştu.');
    }
  }

  async function deactivateUser(userId) {
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('Kullanıcı devre dışı bırakıldı.');
        loadData();
      }
    } catch (e) {
      setMessage('Bir hata oluştu.');
    }
  }

  async function createAnnouncement(e) {
    e.preventDefault();
    if (!annTitle || !annContent) {
      setMessage('Başlık ve içerik gerekli.');
      return;
    }
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: annTitle, content: annContent, targetRole: annTarget }),
      });
      if (res.ok) {
        setMessage('Duyuru yayınlandı.');
        setAnnTitle('');
        setAnnContent('');
        loadData();
      }
    } catch (e) {
      setMessage('Bir hata oluştu.');
    }
  }

  async function deleteAnnouncement(id) {
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('Duyuru silindi.');
        loadData();
      }
    } catch (e) {
      setMessage('Bir hata oluştu.');
    }
  }

  async function toggleDutyForUser(userId) {
    try {
      const record = dutyRecords.find(d => d.userId?._id === userId);
      if (!record) return;
      const newStatus = record.status === 'on' ? 'off' : 'on';
      const res = await fetch(`/api/duty/${record._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setMessage('Nöbet durumu güncellendi.');
        loadData();
      }
    } catch (e) {
      setMessage('Bir hata oluştu.');
    }
  }

  const statusLabels = {
    pending: 'Bekliyor',
    confirmed: 'Onaylandı',
    cancelled: 'İptal',
    completed: 'Tamamlandı',
  };

  const tabs = [
    { id: 'users', label: 'Kullanıcılar' },
    { id: 'appointments', label: 'Randevular' },
    { id: 'duty', label: 'Nöbetler' },
    { id: 'announcements', label: 'Duyurular' },
  ];

  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Paneli</h1>

        {message && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6 text-white">
            {message}
            <button onClick={() => setMessage('')} className="ml-4 text-gray-400 hover:text-white">X</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-800 rounded-xl p-1 border border-slate-700 mb-8">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                tab === t.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-700">
                    <th className="px-4 py-3 text-left text-gray-300 text-sm">Kullanıcı</th>
                    <th className="px-4 py-3 text-left text-gray-300 text-sm">Rol</th>
                    <th className="px-4 py-3 text-left text-gray-300 text-sm">Bölüm</th>
                    <th className="px-4 py-3 text-left text-gray-300 text-sm">Nöbet</th>
                    <th className="px-4 py-3 text-left text-gray-300 text-sm">Durum</th>
                    <th className="px-4 py-3 text-left text-gray-300 text-sm">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-t border-slate-700 hover:bg-slate-700/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {u.avatar && <img src={u.avatar} alt="" className="w-8 h-8 rounded-full" />}
                          <div>
                            <p className="text-white text-sm">{u.username}</p>
                            <p className="text-gray-400 text-xs">{u.name} {u.surname}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={e => updateUser(u._id, { role: e.target.value })}
                          className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                        >
                          {ROLES.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.department || ''}
                          onChange={e => updateUser(u._id, { department: e.target.value })}
                          className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                        >
                          {DEPARTMENTS.map(d => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          u.onDuty ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {u.onDuty ? 'Nöbette' : 'Nöbet Değil'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {u.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateUser(u._id, { name: prompt('Ad:', u.name || '') || u.name, surname: prompt('Soyad:', u.surname || '') || u.surname })}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => deactivateUser(u._id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            {u.isActive ? 'Devre Dışı' : 'Aktifleştir'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {tab === 'appointments' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-700">
                    <th className="px-4 py-3 text-left text-gray-300 text-sm">Hasta</th>
                    <th className="px-4 py-3 text-left text-gray-300 text-sm">Doktor</th>
                    <th className="px-4 py-3 text-left text-gray-300 text-sm">Bölüm</th>
                    <th className="px-4 py-3 text-left text-gray-300 text-sm">Tarih</th>
                    <th className="px-4 py-3 text-left text-gray-300 text-sm">Durum</th>
                    <th className="px-4 py-3 text-left text-gray-300 text-sm">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(apt => (
                    <tr key={apt._id} className="border-t border-slate-700 hover:bg-slate-700/50">
                      <td className="px-4 py-3 text-white text-sm">{apt.citizenId?.name} {apt.citizenId?.surname}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm">Dr. {apt.doctorId?.name} {apt.doctorId?.surname}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{DEPT_LABELS[apt.department] || apt.department}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{new Date(apt.date).toLocaleDateString('tr-TR')} {apt.time}</td>
                      <td className="px-4 py-3">
                        <select
                          value={apt.status}
                          onChange={e => {
                            fetch(`/api/appointments/${apt._id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: e.target.value }),
                            }).then(() => loadData());
                          }}
                          className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                        >
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            fetch(`/api/appointments/${apt._id}`, { method: 'DELETE' })
                              .then(() => loadData());
                          }}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Duty Tab */}
        {tab === 'duty' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-700">
                    <th className="px-4 py-3 text-left text-gray-300 text-sm">Doktor</th>
                    <th className="px-4 py-3 text-left text-gray-300 text-sm">Bölüm</th>
                    <th className="px-4 py-3 text-left text-gray-300 text-sm">Durum</th>
                    <th className="px-4 py-3 text-left text-gray-300 text-sm">Başlangıç</th>
                    <th className="px-4 py-3 text-left text-gray-300 text-sm">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {dutyRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">Nöbet kaydı bulunamadı.</td>
                    </tr>
                  ) : dutyRecords.map(d => (
                    <tr key={d._id} className="border-t border-slate-700 hover:bg-slate-700/50">
                      <td className="px-4 py-3 text-white text-sm">
                        Dr. {d.userId?.name} {d.userId?.surname}
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">
                        {DEPT_LABELS[d.userId?.department] || d.userId?.department || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          d.status === 'on' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {d.status === 'on' ? 'Nöbette' : 'Nöbet Değil'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">
                        {d.startedAt ? new Date(d.startedAt).toLocaleString('tr-TR') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleDutyForUser(d.userId?._id)}
                          className={`px-3 py-1 rounded text-sm text-white transition ${
                            d.status === 'on'
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {d.status === 'on' ? 'Nöbeti Bitir' : 'Nöbete Al'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {tab === 'announcements' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Yeni Duyuru</h2>
              <form onSubmit={createAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Başlık</label>
                  <input
                    type="text"
                    value={annTitle}
                    onChange={e => setAnnTitle(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    placeholder="Duyuru başlığı..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">İçerik</label>
                  <textarea
                    value={annContent}
                    onChange={e => setAnnContent(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    placeholder="Duyuru içeriği..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Hedef Kitle</label>
                  <select
                    value={annTarget}
                    onChange={e => setAnnTarget(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="all">Tümü</option>
                    <option value="doctors">Sadece Doktorlar</option>
                    <option value="citizens">Sadece Vatandaşlar</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition"
                >
                  Yayınla
                </button>
              </form>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Duyurular</h2>
              {announcements.length === 0 ? (
                <p className="text-gray-400">Henüz duyuru yok.</p>
              ) : (
                <div className="space-y-4">
                  {announcements.map(ann => (
                    <div key={ann._id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-white font-medium">{ann.title}</h3>
                          <p className="text-gray-400 text-sm mt-1">{ann.content}</p>
                          <p className="text-gray-500 text-xs mt-2">
                            {ann.createdBy?.username} - {new Date(ann.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteAnnouncement(ann._id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
