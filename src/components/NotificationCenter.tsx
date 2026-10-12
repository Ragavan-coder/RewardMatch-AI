import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  TrendingDown,
  FileText,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  fetchNotifications,
  markNotificationsRead,
  updateNotificationPreferences,
  type NotificationItem,
} from '../services/api';

export const NotificationCenter: React.FC = () => {
  const [alerts, setAlerts] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'alerts' | 'settings'>('alerts');

  // Preferences state
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);
  const [inAppAlerts, setInAppAlerts] = useState<boolean>(true);
  const [minPriceDrop, setMinPriceDrop] = useState<number>(5);
  const [weeklyDay, setWeeklyDay] = useState<string>('Sunday');
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchNotifications();
      setAlerts(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleMarkAllRead = async () => {
    await markNotificationsRead();
    setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateNotificationPreferences({
      email_alerts_enabled: emailAlerts,
      in_app_alerts_enabled: inAppAlerts,
      min_price_drop_percent: minPriceDrop,
      weekly_report_day: weeklyDay,
    });
    if (success) {
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price_drop':
        return <TrendingDown className="w-4 h-4 text-emerald-400" />;
      case 'report_ready':
        return <FileText className="w-4 h-4 text-[#E5B567]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#FF3038]" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#18080a] via-[#100406] to-[#070707] border border-[#FF3038]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Multi-Channel Notification Engine</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#FF3038]" />
            Alerts & Notification Center
          </h2>
          <p className="text-xs text-[#A6A6A6] mt-1 max-w-xl">
            Real-time price drop notifications, high-priority credit card multiplier alerts, quiet hours, and weekly report delivery settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-[#FF3038] text-white shadow-[0_0_15px_#FF3038]'
                : 'bg-white/5 text-[#A6A6A6] hover:text-white'
            }`}
          >
            All Alerts ({alerts.filter((a) => !a.is_read).length} new)
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#FF3038] text-white shadow-[0_0_15px_#FF3038]'
                : 'bg-white/5 text-[#A6A6A6] hover:text-white'
            }`}
          >
            Preferences
          </button>
        </div>
      </div>

      {/* TAB 1: ALL ALERTS */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs text-[#A6A6A6] font-mono">
              {alerts.length} Notifications Logged
            </span>
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-[#FF5E66] hover:text-[#FF3038] cursor-pointer"
            >
              Mark All as Read
            </button>
          </div>

          {alerts.map((a) => (
            <div
              key={a.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                a.is_read
                  ? 'bg-[#12080a]/60 border-white/10 opacity-75'
                  : 'bg-[#15080a] border-[#FF3038]/40 shadow-md'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  {getAlertIcon(a.alert_type)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    {a.title}
                    {!a.is_read && (
                      <span className="w-2 h-2 rounded-full bg-[#FF3038] animate-pulse" />
                    )}
                  </h4>
                  <p className="text-xs text-[#D4D4D4] mt-1 leading-relaxed">{a.message}</p>
                  <span className="text-[10px] text-[#A6A6A6] font-mono mt-1.5 block">
                    {a.created_at}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white shrink-0">
                {a.alert_type.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: PREFERENCES */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSavePreferences} className="p-6 rounded-3xl bg-[#12080a] border border-white/10 space-y-5 max-w-2xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
            <Sliders className="w-4 h-4 text-[#FF3038]" /> Alert & Delivery Preferences
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <span className="font-bold text-white block">Email Notifications</span>
                <span className="text-[#A6A6A6]">Receive alerts and weekly reports via verified email address.</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#FF3038] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <span className="font-bold text-white block">In-App Dashboard Alerts</span>
                <span className="text-[#A6A6A6]">Display realtime notifications in top header bell and drawer.</span>
              </div>
              <input
                type="checkbox"
                checked={inAppAlerts}
                onChange={(e) => setInAppAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#FF3038] cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <label className="font-bold text-white block">Minimum Price Drop Threshold</label>
              <p className="text-[#A6A6A6]">Only alert me when monitored item drops by at least:</p>
              <select
                value={minPriceDrop}
                onChange={(e) => setMinPriceDrop(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 text-xs text-white outline-none"
              >
                <option value={3}>3% Price Drop</option>
                <option value={5}>5% Price Drop (Recommended)</option>
                <option value={10}>10% Significant Price Drop</option>
                <option value={15}>15% Major Deal Alert</option>
              </select>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <label className="font-bold text-white block">Weekly Savings Report Day</label>
              <p className="text-[#A6A6A6]">Day when automated 7-section report is compiled:</p>
              <select
                value={weeklyDay}
                onChange={(e) => setWeeklyDay(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 text-xs text-white outline-none"
              >
                <option value="Sunday">Sunday (Default)</option>
                <option value="Monday">Monday Morning</option>
                <option value="Friday">Friday Weekend Kickoff</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            {settingsSaved ? (
              <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Preferences saved in MySQL database!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white font-bold text-xs shadow-md cursor-pointer hover:shadow-[0_0_20px_rgba(255,48,56,0.6)]"
            >
              Save Preferences
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
