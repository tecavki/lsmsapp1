'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';

const DEPARTMENTS = [
  { value: 'acil', label: 'Acil Servis' },
  { value: 'cerrahi', label: 'Cerrahi' },
  { value: 'dahiliye', label: 'Dahiliye' },
  { value: 'klinik', label: 'Klinik' },
  { value: 'kardiyoloji', label: 'Kardiyoloji' },
  { value: 'noroloji', label: 'Noroloji' },
  { value: 'pediatri', label: 'Pediatri' },
];

export default function CitizenDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAppointments();
    loadDoctors();
  }, []);

  useEffect(() => {
    if (selectedDept) {
      loadDoctors(selectedDept);
    } else {
      loadDoctors();
    }
    setSelectedDoctor('');
  }, [selectedDept]);

  async function loadAppointments() {
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadDoctors(dept) {
    try {
      const url = dept ? `/api/doctors?department=${dept}` : '/api/doctors';
      const res = await fetch(url);
      const data = await res.json();
      setDoctors(data.doctors || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedDoctor || !date || !time) {
      setMessage('Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          department: selectedDept,
          date,
          time,
          reason,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Randevu başarıyla oluşturuldu!');
        setDate('');
        setTime('');
        setReason('');
        loadAppointments();
      } else {
        setMessage(data.error || 'Bir hata oluştu.');
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

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  };

  return (
    <AuthGuard allowedRoles={['citizen']}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Vatandaş Paneli</h1>

        {message && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6 text-white">
            {message}
            <button onClick={() => setMessage('')} className="ml-4 text-gray-400 hover:text-white">X</button>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Yeni Randevu</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Bölüm</label>
                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Bölüm Seçin</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Doktor</label>
                <select
                  value={selectedDoctor}
                  onChange={e => setSelectedDoctor(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Doktor Seçin</option>
                  {doctors.map(doc => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name && doc.surname ? `Dr. ${doc.name} ${doc.surname}` : doc.username}
                      {doc.onDuty ? ' (Nöbette)' : ' (Nöbet Değil)'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Tarih</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Saat</label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Açıklama</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  placeholder="Şikayetinizi kısaca açıklayın..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition"
              >
                Randevu Al
              </button>
            </form>
          </div>

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
                          Dr. {apt.doctorId?.name} {apt.doctorId?.surname}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {new Date(apt.date).toLocaleDateString('tr-TR')} - {apt.time}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[apt.status]}`}>
                        {statusLabels[apt.status]}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{apt.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
