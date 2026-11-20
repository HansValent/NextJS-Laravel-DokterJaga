'use client';

import { useState, useEffect, useRef } from 'react';
import { getParamedic, Paramedic } from '@/services/jadwalService';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function ParamedicSearchSelect({ value, onChange }: Props) {
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<Paramedic[]>([]);
  const [filtered, setFiltered] = useState<Paramedic[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getParamedic();
      setOptions(data);
      applyFilter(search, data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (value === 'create') {
      setSearch('Akan dibuat baru');
    } else {
      const selected = options.find(o => o.id === Number(value));
      setSearch(selected ? selected.nama_paramedic : '');
    }
  }, [value, options]);

  const applyFilter = (keyword: string, list = options) => {
    if (!keyword.trim()) {
      setFiltered(list);
    } else {
      const lower = keyword.toLowerCase();
      setFiltered(list.filter(o => o.nama_paramedic.toLowerCase().includes(lower)));
    }
  };

  useEffect(() => {
    applyFilter(search);
  }, [search, options]);

  const handleSelect = (nama: string, id: number) => {
    setSearch(nama);
    onChange(String(id));
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setSearch(newVal);
    setIsOpen(true);
    if (newVal.trim() === '') {
      onChange('');
    }
  };

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
        placeholder="Cari paramedic..."
        value={search}
        onFocus={() => setIsOpen(true)}
        onChange={handleInputChange}
        readOnly={value === 'create'}
      />
      {isOpen && !loading && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow max-h-48 overflow-auto">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.id}
                className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                onMouseDown={() => handleSelect(item.nama_paramedic, item.id)}
              >
                {item.nama_paramedic}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">Tidak ada hasil</div>
          )}
        </div>
      )}
      {value === 'create' && (
        <span className="text-xs text-blue-600 mt-1">Paramedic akan dibuat otomatis</span>
      )}
    </div>
  );
}