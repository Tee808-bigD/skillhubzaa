import React from 'react';
import { Notification } from '../types';
import { Bell, CheckCheck, Briefcase, BookOpen, ShoppingBag, Users } from 'lucide-react';

interface NotificationsViewProps {
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onNavigateView: (view: any) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAllAsRead,
  onNavigateView
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-600" />
          <h2 className="font-extrabold text-sm text-slate-900">Notifications & Alerts</h2>
        </div>

        <button
          onClick={onMarkAllAsRead}
          className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark all read</span>
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => n.actionUrl && onNavigateView(n.actionUrl)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              n.read ? 'bg-white border-slate-100' : 'bg-emerald-50/50 border-emerald-200'
            }`}
          >
            <div className="mt-0.5 p-2 rounded-xl bg-slate-900 text-emerald-400 shrink-0">
              {n.type === 'learnership' && <Briefcase className="w-4 h-4" />}
              {n.type === 'course' && <BookOpen className="w-4 h-4" />}
              {n.type === 'service_booking' && <ShoppingBag className="w-4 h-4" />}
              {n.type === 'mentor' && <Users className="w-4 h-4" />}
            </div>

            <div className="flex-1 text-xs space-y-0.5">
              <h4 className="font-extrabold text-slate-900">{n.title}</h4>
              <p className="text-slate-600 font-medium leading-relaxed">{n.message}</p>
              <span className="text-[10px] text-slate-400 block pt-1">{n.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
