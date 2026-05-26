import { motion, AnimatePresence } from 'motion/react';
import { 
  History as HistoryIcon, 
  Trash2, 
  Square, 
  CheckSquare, 
  Calendar, 
  Users, 
  CheckCircle2, 
  ChevronDown, 
  Mail, 
  Phone, 
  Share2, 
  Eye, 
  Loader2,
  Trash
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { INVITATION_TEMPLATES } from '../../constants';
import { cn } from '../../lib/utils';

export default function HistoryTab({ 
  invitationsHistory, 
  selectedHistoryItems, 
  isDeleting, 
  expandedHistory,
  guests,
  onClearAll,
  onDeleteSelection,
  onSelectAll,
  onToggleSelection,
  onToggleExpand,
  onReuse,
  onDeleteIndividual,
  onManualDelivery
}) {
  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <h4 className="text-4xl font-black text-gray-900 uppercase tracking-tighter italic leading-[0.8] mb-4 text-left">Batch History</h4>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Track every celestial connection you've made.</p>
        </div>
        <div className="flex items-center space-x-4">
          {invitationsHistory.length > 0 && (
            <button 
              onClick={onClearAll}
              disabled={isDeleting}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100 disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          )}
          {selectedHistoryItems.length > 0 && (
            <button 
              onClick={() => onDeleteSelection(selectedHistoryItems)}
              disabled={isDeleting}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
            >
              {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              <span>Delete selection ({selectedHistoryItems.length})</span>
            </button>
          )}
          {invitationsHistory.length > 0 && (
            <button 
              onClick={onSelectAll}
              className="flex items-center space-x-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-100 transition-all border border-pink-100"
            >
              {selectedHistoryItems.length === invitationsHistory.length ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
              <span>{selectedHistoryItems.length === invitationsHistory.length ? 'Deselect All' : 'Select All'}</span>
            </button>
          )}
          <div className="bg-pink-50 border border-pink-100 px-6 py-3 rounded-2xl flex items-center space-x-3">
            <HistoryIcon className="w-4 h-4 text-pink-600" />
            <span className="text-[10px] font-black text-pink-600 uppercase tracking-widest">{invitationsHistory.length} Batches Dispatched</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {invitationsHistory.length > 0 ? invitationsHistory.map((inv) => (
            <motion.div 
              key={inv.id} 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={cn(
                "bg-white rounded-[2rem] border transition-all overflow-hidden group hover:shadow-md",
                selectedHistoryItems.includes(inv.id) ? "border-pink-300 shadow-md ring-1 ring-pink-100" : "border-gray-100 shadow-sm"
              )}
            >
            <div 
              onClick={() => onToggleExpand(inv.id)}
              className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-5">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelection(inv.id);
                  }}
                  className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                    selectedHistoryItems.includes(inv.id) ? "bg-pink-600 text-white" : "bg-gray-50 text-gray-300 hover:text-gray-400"
                  )}
                >
                  {selectedHistoryItems.includes(inv.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                </button>
                
                <div className="w-12 h-16 bg-pink-50 rounded-xl flex items-center justify-center overflow-hidden border border-pink-100 shrink-0">
                   <div className="text-[7px] font-black text-pink-600 uppercase -rotate-90 whitespace-nowrap">
                     {INVITATION_TEMPLATES.find(t => t.id === inv.templateId)?.name || 'Classic'}
                   </div>
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                     <h5 className="text-sm font-black text-gray-900 uppercase tracking-tight">{inv.cardData.groom} & {inv.cardData.bride}</h5>
                     <span className={cn(
                       "px-2 py-0.5 text-[7px] font-black uppercase tracking-widest rounded-full",
                       inv.status === 'completed' ? "bg-green-100 text-green-600" :
                       inv.status === 'failed' ? "bg-red-100 text-red-600" :
                       "bg-blue-100 text-blue-600 animate-pulse"
                     )}>
                       {inv.status === 'completed' ? 'Dispatched' : 
                        inv.status === 'failed' ? 'Failed' : 'Transmitting...'}
                     </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3 h-3" />
                      <span>{inv.sentAt?.toDate ? new Date(inv.sentAt.toDate()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Recently'}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-3 h-3" />
                      <span>{inv.guestIds?.length || 0} Guests</span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-green-50/50 px-2 py-0.5 rounded-full ring-1 ring-green-100/50 text-green-600">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span className="font-black text-[8px]">{inv.deliveryResults?.filter(r => r.status === 'sent').length || 0} Delivered</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                 <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onReuse(inv);
                  }}
                  className="px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-pink-50 hover:text-pink-600 transition-all border border-transparent hover:border-pink-200"
                 >
                   Reuse
                 </button>
                 <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteIndividual(inv.id);
                  }}
                  disabled={isDeleting}
                  title="Delete from history"
                  className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100 disabled:opacity-50 active:scale-95"
                 >
                   <Trash className="w-4 h-4" />
                 </button>
                 <div className={cn(
                   "w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300",
                   expandedHistory.includes(inv.id) ? "bg-pink-50 text-pink-600 rotate-180" : "bg-gray-50 text-gray-400"
                 )}>
                   <ChevronDown className="w-4 h-4" />
                 </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedHistory.includes(inv.id) && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-gray-50/50 border-t border-gray-50"
                >
                  <div className="p-8">
                     <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
                        <div className="flex-1">
                          <h6 className="text-xl font-black text-gray-900 tracking-tighter uppercase italic text-left">Dispatch Details</h6>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Guest-by-guest delivery verification</p>
                        </div>
                     </div>

                     <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {inv.guestIds && inv.guestIds.map((gId, rIdx) => {
                          const guestInfo = guests.find(g => g.id === gId);
                          const delivery = inv.deliveryResults?.find(d => d.guestId === gId || d.email === guestInfo?.email);
                          
                         return (
                            <div key={gId || rIdx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-pink-200 transition-all">
                              <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black italic shrink-0">
                                  {guestInfo?.name?.charAt(0) || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-black text-gray-900 truncate">{guestInfo?.name || 'Unknown Guest'}</p>
                                  <div className="flex items-center space-x-2">
                                    <div className={cn(
                                      "w-1.5 h-1.5 rounded-full",
                                      delivery?.status === 'sent' ? "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" : 
                                      delivery?.status === 'failed' ? "bg-red-400" : 
                                      inv.status === 'sent' ? "bg-blue-400 animate-pulse" : "bg-gray-300"
                                    )} />
                                    <span className={cn(
                                      "text-[7px] font-bold uppercase tracking-widest",
                                      delivery?.status === 'sent' ? "text-green-600" :
                                      delivery?.status === 'failed' ? "text-red-400" : 
                                      inv.status === 'sent' ? "text-blue-500 animate-pulse" : "text-gray-400"
                                    )} style={{ minWidth: '80px', display: 'inline-block' }}>
                                      {delivery?.status === 'sent' ? (
                                        <span className="flex items-center gap-1">
                                          Delivered • {delivery.sentAt ? new Date(delivery.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                        </span>
                                      ) : delivery?.status === 'failed' ? (
                                        <span className="flex flex-col">
                                          <span>Failed • {delivery.sentAt ? new Date(delivery.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
                                          <span className="text-[6px] font-medium lowercase tracking-normal mt-0.5 opacity-80 break-words text-left">
                                            {delivery.error?.includes('DOMAIN_LIMITATION') ? 'Recipient email unverified (Free Tier)' : delivery.error || 'Unknown error'}
                                          </span>
                                        </span>
                                      ) : inv.status === 'sent' ? 'Processing...' : 'Ready'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-1.5 mb-4 border-t border-gray-50 pt-3">
                                <div className="flex items-center space-x-2 text-[9px] text-gray-400 overflow-hidden">
                                  <Mail className="w-2.5 h-2.5 shrink-0" />
                                  <span className={cn("truncate", delivery?.status === 'sent' && delivery?.method === 'email' ? "text-green-600 font-bold" : "")}>
                                    {guestInfo?.email || 'No Email'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-[9px] text-gray-400">
                                  <Phone className="w-2.5 h-2.5 shrink-0" />
                                  <span className={cn(delivery?.status === 'sent' && delivery?.method === 'whatsapp' ? "text-green-600 font-bold" : "")}>
                                    {guestInfo?.phone || 'No Phone'}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onManualDelivery(inv, guestInfo);
                                  }}
                                  className={cn(
                                    "py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1 underline-offset-2 hover:underline text-[7px] font-black uppercase tracking-widest",
                                    delivery?.status === 'sent' && delivery?.method === 'whatsapp' 
                                      ? "bg-green-100 text-green-600 border border-green-200" 
                                      : "bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-600"
                                  )}
                                >
                                  <Share2 className="w-2.5 h-2.5" /> <span>{delivery?.status === 'sent' && delivery?.method === 'whatsapp' ? 'Resend' : 'WhatsApp'}</span>
                                </button>
                                <Link 
                                  to={`/invite/${inv.id}?g=${encodeURIComponent(guestInfo?.name || '')}`}
                                  target="_blank"
                                  className="py-1.5 bg-gray-50 hover:bg-pink-50 text-[7px] font-black uppercase tracking-widest text-gray-400 hover:text-pink-600 rounded-lg transition-all flex items-center justify-center space-x-1"
                                >
                                  <Eye className="w-2.5 h-2.5" /> <span>Preview</span>
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )) : (
          <motion.div 
            key="empty-history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-40 text-center"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <HistoryIcon className="w-10 h-10 text-gray-200" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No history available yet.</p>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
