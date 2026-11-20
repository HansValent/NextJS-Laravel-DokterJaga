'use client';

import { useState, useEffect, useRef } from 'react';
import { getposisi } from '@/services/jadwalService';
import { Posisi } from '@/lib/type';

interface Props {
  value: string;           // bisa numeric (ID), 'create', atau string kosong
  onChange: (value: string) => void;
}

export default function PosisiSearchSelect({ value, onChange }: Props) {
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<Posisi[]>([]);
  const [filtered, setFiltered] = useState<Posisi[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getposisi();
      setOptions(data);
      applyFilter(search, data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Sinkronisasi tampilan dengan value
    if (value === 'create') {
      setSearch('Akan dibuat baru');
    } else {
      const selected = options.find(o => o.id === Number(value));
      setSearch(selected ? selected.nama_posisi : '');
    }
  }, [value, options]);

  const applyFilter = (keyword: string, list = options) => {
    if (!keyword.trim()) {
      setFiltered(list);
    } else {
      const lower = keyword.toLowerCase();
      setFiltered(list.filter(o => o.nama_posisi.toLowerCase().includes(lower)));
    }
  };

  useEffect(() => {
    applyFilter(search);
  }, [search, options]);

  const handleSelect = (nama: string, id: number) => {
    setSearch(nama);
    onChange(String(id));       // kirim ID sebagai string
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setSearch(newVal);
    setIsOpen(true);
    // jika kosong, anggap belum memilih
    if (newVal.trim() === '') {
      onChange('');
    }
  };

  // Klik di luar
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        placeholder="Cari posisi..."
        value={search}
        onFocus={() => setIsOpen(true)}
        onChange={handleInputChange}
        readOnly={value === 'create'}  // kunci jika sudah pilih buat baru
      />
      {isOpen && !loading && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow max-h-48 overflow-auto">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.id}
                className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                onMouseDown={() => handleSelect(item.nama_posisi, item.id)}
              >
                {item.nama_posisi}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">Tidak ada hasil</div>
          )}
        </div>
      )}
      {value === 'create' && (
        <span className="text-xs text-blue-600 mt-1">Posisi akan dibuat otomatis</span>
      )}
    </div>
  );
}