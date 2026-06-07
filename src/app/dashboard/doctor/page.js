'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';

const DEPT_LABELS = {
  acil: 'Acil Servis',
  cerrahi: 'Cerrahi',
  dahiliye: 'Dahiliye',
  klinik: 'Klinik',
  kardiyoloji: 'Kardiyoloji',
  noroloji: 'Noroloji',
  pediatri: 'Pediatri',
};

export default function DoctorDashboard() {
  const { user, refreshUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [dutyStatus, setDutyStatus] = useState('off');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [aptRes, dutyRes, annRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/duty'),
        fetch('/api/announcements'),
      ]);

      const aptData = await aptRes.json();
      const dutyData = await dutyRes.json();
      const annData = await annRes.json();

      setAppointments(aptData.appointments || []);
      if (dutyData.duty) setDutyStatus(dutyData.duty.status || 'off');
      setAnnouncements(annData.announcements || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function toggleDuty() {
    try {
      const res = await fetch('/api/duty', { method: 'POST' });
      const data = await res.json();
      if (data.duty) {
        setDutyStatus(data.duty.status);
        setMessage(data.duty.status === 'on' ? 'Nöbete başladınız!' : 'Nöbet sonlandı.');
      }
    } catch (e) {
      setMessage('Bir hata oluştu.');
    }
  }

  async function updateAppointmentStatus(id, status) {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        loadData();
        setMessage('Randevu durumu güncellendi.');
      }
    } catch (e) {
      setMessage('Bir hata oluştu.');
    }
  }

  const statusLabels = {
    pending: 'Bekliyor',
    confirmed: 'Onaylandı',
    cancelled: 'İptal Edildi',
    completed: 'Tamamlandı',
  };

  return (
    <AuthGuard allowedRoles={['doctor']}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Doktor Paneli</h1>

        {message && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6 text-white">
            {message}
            <button onClick={() => setMessage('')} className="ml-4 text-gray-400 hover:text-white">X</button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile & Duty */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Profilim</h2>
              <div className="flex items-center space-x-4 mb-4">
                {user?.avatar && (
                  <img src={user.avatar} alt="" className="w-16 h-16 rounded-full" />
                )}
                <div>
                  <p className="text-white font-medium text-lg">
                    Dr. {user?.name} {user?.surname}
                  </p>
                  <p className="text-gray-400">{DEPT_LABELS[user?.department] || user?.department}</p>
                </div>
              </div>

              <button
                onClick={toggleDuty}
                className={`w-full py-3 rounded-lg font-medium text-lg transition ${
                  dutyStatus === 'on'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {dutyStatus === 'on' ? 'Nöbeti Bitir' : 'Nöbete Başla'}
              </button>
              <p className="text-center mt-2 text-sm text-gray-400">
                Durum: {dutyStatus === 'on' ? 'Nöbette' : 'Nöbet Değil'}
              </p>
            </div>

            {/* Announcements */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Duyurular</h2>
              {announcements.length === 0 ? (
                <p className="text-gray-400">Henüz duyuru yok.</p>
              ) : (
                <div className="space-y-3">
                  {announcements.slice(0, 5).map(ann => (
                    <div key={ann._id} className="bg-slate-700/50 rounded-lg p-3">
                      <p className="text-white font-medium text-sm">{ann.title}</p>
                      <p className="text-gray-400 text-xs mt-1">{ann.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Randevularım</h2>
              {loading ? (
                <p className="text-gray-400">Yükleniyor...</p>
              ) : appointments.length === 0 ? (
                <p className="text-gray-400">Henüz randevunuz bulunmuyor.</p>
              ) : (
                <div className="space-y-4">
                  {appointments.map(apt => (
                    <div key={apt._id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-white font-medium">
                            {apt.citizenId?.name} {apt.citizenId?.surname}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {new Date(apt.date).toLocaleDateString('tr-TR')} - {apt.time}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {statusLabels[apt.status]}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{apt.reason}</p>
                      <p className="text-gray-500 text-xs mb-3">Bölüm: {DEPT_LABELS[apt.department] || apt.department}</p>

                      {apt.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateAppointmentStatus(apt._id, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm transition"
                          >
                            Onayla
                          </button>
                          <button
                            onClick={() => updateAppointmentStatus(apt._id, 'cancelled')}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm transition"
                          >
                            Reddet
                          </button>
                        </div>
                      )}
                      {apt.status === 'confirmed' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt._id, 'completed')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm transition"
                        >
                          Tamamlandı
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
