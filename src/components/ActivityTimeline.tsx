import React, { useState, useEffect } from 'react';
import {
  History,
  CheckCircle2,
  Clock,
  CreditCard,
  Building2,
  ShoppingBag,
  FileText,
  User,
  Zap,
  RefreshCw,
  Search,
} from 'lucide-react';
import { fetchActivityEvents, type ActivityEventItem } from '../services/api';

export const ActivityTimeline: React.FC = () => {
  const [events, setEvents] = useState<ActivityEventItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await fetchActivityEvents(categoryFilter);
      setEvents(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [categoryFilter]);

  const categories = [
    { id: 'all', label: 'All Events' },
    { id: 'account', label: 'Account' },
    { id: 'card', label: 'Cards' },
    { id: 'bank', label: 'Banks & UPI' },
    { id: 'transaction', label: 'Transactions' },
    { id: 'reward', label: 'Rewards' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'report', label: 'Reports' },
  ];

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'account':
        return <User className="w-4 h-4 text-sky-400" />;
      case 'card':
        return <CreditCard className="w-4 h-4 text-[#FF3038]" />;
      case 'bank':
        return <Building2 className="w-4 h-4 text-emerald-400" />;
      case 'transaction':
        return <Zap className="w-4 h-4 text-[#E5B567]" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4 text-purple-400" />;
      case 'report':
        return <FileText className="w-4 h-4 text-amber-400" />;
      default:
        return <History className="w-4 h-4 text-[#FF3038]" />;
    }
  };

  const filteredEvents = events.filter((ev) =>
    ev.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#18080a] via-[#100406] to-[#070707] border border-[#FF3038]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Immutable Chronological Audit Trail</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-[#FF3038]" />
            Activity & Audit History
          </h2>
          <p className="text-xs text-[#A6A6A6] mt-1 max-w-xl">
            Complete verifiable timeline of card additions, verified cashback events, banking linkages, and shopping alerts stored in MySQL.
          </p>
        </div>

        <button
          onClick={loadEvents}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#FF3038]' : ''}`} />
          Refresh Activity
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === c.id
                  ? 'bg-[#FF3038] text-white shadow-[0_0_12px_#FF3038]'
                  : 'bg-white/5 text-[#A6A6A6] hover:text-white border border-white/10'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#A6A6A6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black border border-white/15 focus:border-[#FF3038] text-xs text-white outline-none"
          />
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#12080a] border border-white/10 text-center text-xs text-[#A6A6A6]">
            No activity events found for the selected category.
          </div>
        ) : (
          filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-4 rounded-2xl bg-[#12080a] border border-white/10 hover:border-[#FF3038]/40 transition-all flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  {getCategoryIcon(ev.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-white/10 text-white uppercase">
                      {ev.category}
                    </span>
                    <span className="text-xs font-bold text-white">{ev.event_type.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-[#D4D4D4] leading-relaxed">{ev.description}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#A6A6A6] font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{ev.timestamp}</span>
                    <span>• Source: {ev.source}</span>
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                {ev.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
