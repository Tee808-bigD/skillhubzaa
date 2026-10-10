import React, { useState } from 'react';
import { User } from '../types';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  ShieldCheck, 
  ChevronRight, 
  MessageSquare, 
  ExternalLink,
  Filter,
  ArrowUpRight
} from 'lucide-react';

interface JobOrder {
  id: string;
  title: string;
  counterpartyName: string;
  counterpartyAvatar: string;
  counterpartyRole: string;
  amount: string;
  type: 'hourly' | 'fixed_escrow';
  status: 'active' | 'in_review' | 'completed' | 'disputed';
  deadline: string;
  progress: number;
  category: string;
}

interface MyJobsOrdersViewProps {
  currentUser: User;
  onOpenChat?: (name: string) => void;
  onNavigateView?: (view: any) => void;
  onPostJob?: () => void;
}

const mockOrders: JobOrder[] = [
  {
    id: 'ord_101',
    title: 'Fintech Dashboard Design & Frontend Architecture',
    counterpartyName: 'Elena Rostova',
    counterpartyAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    counterpartyRole: 'Client (FinStudio Germany)',
    amount: '$1,850.00',
    type: 'fixed_escrow',
    status: 'active',
    deadline: 'Due Oct 24, 2026',
    progress: 65,
    category: 'Engineering & UI'
  },
  {
    id: 'ord_102',
    title: 'Solar Inverter IoT Telemetry Integration',
    counterpartyName: 'Marcus Van Der Merwe',
    counterpartyAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    counterpartyRole: 'Client (SunPower SA)',
    amount: 'R8,500.00',
    type: 'fixed_escrow',
    status: 'in_review',
    deadline: 'Submitted Yesterday',
    progress: 100,
    category: 'Renewables & IoT'
  },
  {
    id: 'ord_103',
    title: 'Mobile App Performance Optimization & Profiling',
    counterpartyName: 'Sarah Chen',
    counterpartyAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    counterpartyRole: 'Client (Apex London)',
    amount: '$650.00',
    type: 'hourly',
    status: 'completed',
    deadline: 'Completed Oct 5, 2026',
    progress: 100,
    category: 'Full-Stack'
  }
];

export const MyJobsOrdersView: React.FC<MyJobsOrdersViewProps> = ({
  currentUser,
  onOpenChat,
  onNavigateView,
  onPostJob
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'in_review' | 'completed'>('all');

  const filteredOrders = mockOrders.filter(o => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-[#1e1e1e] border border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/15 text-emerald-400 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white">My Jobs & Active Engagements</h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400">
            Track active milestones, escrow-protected contracts, and client deliveries in one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Escrow Protected</span>
          </div>
          {onPostJob && (
            <button
              onClick={onPostJob}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
            >
              Post a Job
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 overflow-x-auto">
        {(['all', 'active', 'in_review', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              filter === tab
                ? 'bg-neutral-800 text-emerald-400 border border-neutral-700'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.map(order => (
          <div
            key={order.id}
            className="bg-[#181818] border border-neutral-800/90 hover:border-neutral-700 rounded-2xl p-5 transition-all shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <img
                src={order.counterpartyAvatar}
                alt={order.counterpartyName}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30 shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-sm sm:text-base text-white">{order.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    order.status === 'active'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : order.status === 'in_review'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-neutral-700 text-neutral-300'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-neutral-400">
                  With <span className="text-neutral-200 font-semibold">{order.counterpartyName}</span> • {order.counterpartyRole}
                </p>

                <div className="flex items-center gap-4 text-xs text-neutral-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    {order.deadline}
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-neutral-300">{order.category}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-800">
              <div className="text-right">
                <p className="text-base font-black text-emerald-400">{order.amount}</p>
                <p className="text-[10px] text-neutral-500 uppercase font-semibold">
                  {order.type === 'fixed_escrow' ? 'Escrow Funded' : 'Hourly Tracked'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {onOpenChat && (
                  <button
                    onClick={() => onOpenChat(order.counterpartyName)}
                    className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                    title={`Message ${order.counterpartyName}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => alert(`Opening engagement details for ${order.title}`)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default MyJobsOrdersView;
