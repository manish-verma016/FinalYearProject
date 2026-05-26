import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, 
  MapPin, Bell, Star, Heart, CheckSquare, Square, CheckCircle2, Milestone, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const EVENT_TYPES = [
  { id: 'muhurat', label: 'Auspicious Muhurat 🌟', color: 'bg-amber-100 text-amber-800 border-amber-200 fill-amber-500 dot-amber' },
  { id: 'visit', label: 'Venue Site Visit 🚗', color: 'bg-sky-100 text-sky-800 border-sky-200 fill-sky-500 dot-sky' },
  { id: 'booking', label: 'Booking & Deposit 💰', color: 'bg-emerald-100 text-emerald-800 border-emerald-200 fill-emerald-500 dot-emerald' },
  { id: 'fitting', label: 'Decor / Catering Trial 🍰', color: 'bg-purple-100 text-purple-800 border-purple-200 fill-purple-500 dot-purple' },
  { id: 'other', label: 'Ceremony / Milestone 💍', color: 'bg-pink-100 text-pink-800 border-pink-200 fill-pink-500 dot-pink' }
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PRESET_EVENTS = [
  {
    id: 'preset-1',
    title: 'Highly Auspicious Akshaya Tritiya Muhurat',
    date: '2026-05-20',
    type: 'muhurat',
    venueId: 'venue_siri_natures',
    venueTitle: "Siri Nature's Valley Resort",
    notes: 'Celestial alignment premium wedding day. Recommended for primary booking.',
    completed: false
  },
  {
    id: 'preset-2',
    title: 'Divine June Vivah Muhurat 🌟',
    date: '2026-06-05',
    type: 'muhurat',
    venueId: 'venue_amita_rasa',
    venueTitle: "Amita Rasa",
    notes: 'Exquisite evening alignment, clean planetary transitions.',
    completed: false
  },
  {
    id: 'preset-3',
    title: 'Advance Deposit Due for Siri Valley',
    date: '2026-05-25',
    type: 'booking',
    venueId: 'venue_siri_natures',
    venueTitle: "Siri Nature's Valley Resort",
    notes: 'Verify 10% cash discount receipt with the finance advisor.',
    completed: false
  },
  {
    id: 'preset-4',
    title: 'Grand Food Tasting session with Chef',
    date: '2026-06-12',
    type: 'fitting',
    venueId: 'venue_hilton_genome',
    venueTitle: "Hilton Hyderabad Genome Valley Resort & Spa",
    notes: 'Reviewing 10 signature Mughal-style appetizers and organic desert buffet.',
    completed: false
  }
];

export default function WeddingCalendar({ venueDates, onSaveVenueDate, venuesList }) {
  // Calendar Month state - current date points to May 2026 to showcase the authentic presets beautifully
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 21)); // May 2026
  const [selectedDateStr, setSelectedDateStr] = useState('2026-05-20'); // May 20, 2026
  const [events, setEvents] = useState([]);
  
  // Form input states
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventNotes, setNewEventNotes] = useState('');
  const [newEventType, setNewEventType] = useState('muhurat');
  const [newEventVenueId, setNewEventVenueId] = useState('');

  // Load calendar events from local storage, merge with presets if empty
  useEffect(() => {
    const saved = localStorage.getItem('gathbandhan_wedding_calendar_events');
    if (saved) {
      try {
        setEvents(JSON.parse(saved));
      } catch (e) {
        setEvents(PRESET_EVENTS);
      }
    } else {
      setEvents(PRESET_EVENTS);
      localStorage.setItem('gathbandhan_wedding_calendar_events', JSON.stringify(PRESET_EVENTS));
    }
  }, []);

  // Save events helper
  const saveEventsList = (updatedEvents) => {
    setEvents(updatedEvents);
    localStorage.setItem('gathbandhan_wedding_calendar_events', JSON.stringify(updatedEvents));
  };

  // Keep venueDates in sync with wedding events
  // If a venue card updates its target event date, let's inject/create or update a corresponding event automatically!
  useEffect(() => {
    if (!venueDates || Object.keys(venueDates).length === 0) return;

    let modified = false;
    const currentEvents = [...events];

    Object.entries(venueDates).forEach(([venueId, date]) => {
      if (!date) return;
      
      // Check if event already exists
      const venue = venuesList.find(vl => vl.id === venueId);
      const venueName = venue ? venue.title : 'Selected Venue';

      const existingIndex = currentEvents.findIndex(
        ev => ev.venueId === venueId && ev.type === 'booking' && ev.title.includes('Scheduled Booking')
      );

      if (existingIndex > -1) {
        if (currentEvents[existingIndex].date !== date) {
          currentEvents[existingIndex].date = date;
          modified = true;
        }
      } else {
        // Create new one automatically
        currentEvents.push({
          id: `auto-${venueId}-${Date.now()}`,
          title: `Scheduled Booking target: ${venueName}`,
          date: date,
          type: 'booking',
          venueId: venueId,
          venueTitle: venueName,
          notes: 'Auto-synchronized from Target Event Date on Venue card.',
          completed: false
        });
        modified = true;
      }
    });

    if (modified && currentEvents.length > 0) {
      saveEventsList(currentEvents);
    }
  }, [venueDates, venuesList]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Create list of days grid
  const daysArray = [];
  // For prefix offset
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push({ dayNum: null, dateStr: '' });
  }
  // Fill actual month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    daysArray.push({ dayNum: i, dateStr: dStr });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleAddEventSubmit = (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) {
      toast.error('Please name your target wedding milestone event');
      return;
    }

    const selectedVenueObj = venuesList.find(v => v.id === newEventVenueId);
    const newEvent = {
      id: `custom-${Date.now()}`,
      title: newEventTitle,
      date: selectedDateStr,
      type: newEventType,
      venueId: newEventVenueId || null,
      venueTitle: selectedVenueObj ? selectedVenueObj.title : '',
      notes: newEventNotes,
      completed: false
    };

    const updated = [...events, newEvent];
    saveEventsList(updated);

    // If it binds to a venue and is a target booking, update the venueDates dictionary as well!
    if (newEventVenueId && (newEventType === 'booking' || newEventType === 'muhurat')) {
      onSaveVenueDate(newEventVenueId, selectedDateStr);
    }

    toast.success('Pinned important milestone to celestial calendar!', { icon: '📌' });
    setNewEventTitle('');
    setNewEventNotes('');
  };

  const handleDeleteEvent = (id) => {
    const eventToDelete = events.find(e => e.id === id);
    const updated = events.filter(e => e.id !== id);
    saveEventsList(updated);

    // If deleted match cleared, also clear venueDates mapping associated
    if (eventToDelete && eventToDelete.venueId) {
      // Check if there are other entries for this venue before clearing
      const hasOther = updated.some(e => e.venueId === eventToDelete.venueId);
      if (!hasOther) {
        onSaveVenueDate(eventToDelete.venueId, '');
      }
    }

    toast.success('Milestone removed from timeline.');
  };

  const toggleEventCompleted = (id) => {
    const updated = events.map(e => {
      if (e.id === id) {
        return { ...e, completed: !e.completed };
      }
      return e;
    });
    saveEventsList(updated);
  };

  // Filter events of selected date
  const eventsForSelectedDate = events.filter(e => e.date === selectedDateStr);

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-6 md:p-10" id="wedding-interactive-calendar">
      
      {/* Visual Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8 mb-8">
        <div>
          <span className="px-3.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-amber-200 inline-flex items-center gap-1">
            <CalendarIcon className="w-3 h-3 text-amber-600" />
            Astral & Muhurat Planner
          </span>
          <h2 className="text-3xl font-black text-gray-950 font-serif uppercase tracking-tight mt-3">
            Celestial Celebration Calendar
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1.5">
            Mark important sub-locations, site visits, and astrological dates for your auspicious use
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2.5 items-center bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1.5">Auspicious Colors:</span>
          {EVENT_TYPES.map(type => (
            <div key={type.id} className="flex items-center space-x-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${type.id === 'muhurat' ? 'bg-amber-500' : type.id === 'visit' ? 'bg-sky-500' : type.id === 'booking' ? 'bg-emerald-500' : type.id === 'fitting' ? 'bg-purple-500' : 'bg-pink-500'}`} />
              <span className="text-[9px] font-bold text-gray-600 uppercase tracking-wide">{type.label.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Layout: Left is Calendar, Right is Events Planner & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Interactive Calendar Month Picker (Grid column: 7 cols on large screens) */}
        <div className="lg:col-span-7 bg-gray-50/50 rounded-3xl border border-gray-200/50 p-6 shadow-inner-sm">
          
          {/* Month Header controls */}
          <div className="flex items-center justify-between mb-6 px-2">
            <div>
              <h3 className="text-lg font-black text-gray-900 uppercase font-serif tracking-tight leading-none">
                {MONTHS[month]} {year}
              </h3>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 block">
                Select dates below to declare auspicious milestones
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={handlePrevMonth}
                className="w-10 h-10 rounded-xl bg-white hover:bg-gray-100 duration-120 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-black shadow-sm"
                title="Previous Month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="w-10 h-10 rounded-xl bg-white hover:bg-gray-100 duration-120 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-black shadow-sm"
                title="Next Month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Day names Grid */}
          <div className="grid grid-cols-7 text-center mb-3">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <span key={day} className="text-[10px] font-black text-gray-400 uppercase tracking-widest py-2">
                {day}
              </span>
            ))}
          </div>

          {/* Actual days grid */}
          <div className="grid grid-cols-7 gap-2.5">
            {daysArray.map((cell, idx) => {
              const isSelected = cell.dateStr === selectedDateStr;
              
              // Find events on this date
              const dayEvents = cell.dayNum ? events.filter(e => e.date === cell.dateStr) : [];
              
              return (
                <div key={idx} className="relative min-h-[60px] flex flex-col items-stretch">
                  {cell.dayNum ? (
                    <button
                      type="button"
                      onClick={() => setSelectedDateStr(cell.dateStr)}
                      className={`flex-1 rounded-2xl flex flex-col justify-between p-2 text-left relative transition-all duration-150 border group cursor-pointer ${
                        isSelected 
                          ? 'bg-gray-900 border-gray-950 text-white shadow-md' 
                          : 'bg-white hover:bg-pink-50/50 hover:border-pink-200 border-gray-100 text-gray-800'
                      }`}
                    >
                      <span className={`text-xs font-black tracking-tight ${isSelected ? 'text-white' : 'text-gray-900 group-hover:text-pink-600'}`}>
                        {cell.dayNum}
                      </span>

                      {/* Dots container for events on this day */}
                      {dayEvents.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 shrink-0 max-w-full">
                          {dayEvents.slice(0, 4).map(ev => {
                            let dotColor = 'bg-pink-500';
                            if (ev.type === 'muhurat') dotColor = 'bg-amber-400';
                            if (ev.type === 'visit') dotColor = 'bg-sky-400';
                            if (ev.type === 'booking') dotColor = 'bg-emerald-400';
                            if (ev.type === 'fitting') dotColor = 'bg-purple-400';
                            
                            return (
                              <span 
                                key={ev.id} 
                                className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} 
                                title={ev.title}
                              />
                            );
                          })}
                          {dayEvents.length > 4 && (
                            <span className="text-[6px] font-black text-gray-400 leading-none">+{dayEvents.length - 4}</span>
                          )}
                        </div>
                      )}
                    </button>
                  ) : (
                    // Empty grey block offset
                    <div className="flex-1 bg-gray-100/30 border border-transparent rounded-2xl" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Date Context info */}
          <div className="mt-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[7px] text-gray-400 uppercase font-black tracking-widest leading-none">Selected Date</span>
                <p className="text-sm font-black text-gray-900 uppercase">
                  {new Date(selectedDateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[8px] bg-pink-100 text-pink-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {events.filter(e => e.date === selectedDateStr).length} Events Pinned
              </span>
            </div>
          </div>

        </div>

        {/* Date Planners and Milestone Submitter (Grid column: 5 cols on large screens) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Add event on the selected date builder */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-1.5 font-serif">
              <Plus className="w-4 h-4 text-pink-500" />
              Pin Event to Date
            </h4>

            <form onSubmit={handleAddEventSubmit} className="space-y-4">
              {/* Event Title */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] block">
                  Event Title / Task
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Astro Shubh Vivah, Siri Visit..."
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-150 rounded-xl px-4 py-3 focus:bg-white focus:border-pink-500 outline-none"
                />
              </div>

              {/* Event category/type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] block">
                    Category Tag
                  </label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value)}
                    className="w-full text-xs font-bold text-gray-700 bg-gray-50 border border-gray-150 rounded-xl px-3 py-3 focus:bg-white outline-none"
                  >
                    {EVENT_TYPES.map(tag => (
                      <option key={tag.id} value={tag.id}>
                        {tag.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional Bind Venue dropdown */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] block">
                    Linked Wedding Venue
                  </label>
                  <select
                    value={newEventVenueId}
                    onChange={(e) => setNewEventVenueId(e.target.value)}
                    className="w-full text-xs font-bold text-gray-700 bg-gray-50 border border-gray-150 rounded-xl px-3 py-3 focus:bg-white outline-none max-w-full"
                  >
                    <option value="">-- No Linked Venue --</option>
                    {venuesList.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] block">
                  Planning Notes / Reminders
                </label>
                <textarea 
                  rows={2}
                  placeholder="Add details, contact, custom Muhurat notes..."
                  value={newEventNotes}
                  onChange={(e) => setNewEventNotes(e.target.value)}
                  className="w-full text-xs font-semibold text-gray-805 bg-gray-50 border border-gray-150 rounded-xl px-4 py-2 focus:bg-white focus:border-pink-500 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#e22727] hover:bg-[#c11c1c] text-white p-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-150 active:scale-97 shadow-md flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Pin Event on {selectedDateStr}
              </button>
            </form>
          </div>

          {/* Active list for selected date events log */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-black text-gray-950 uppercase tracking-widest font-serif flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-emerald-500" />
                On This Day
              </h4>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                {selectedDateStr}
              </span>
            </div>

            {eventsForSelectedDate.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Clock className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">No Scheduled Milestones</p>
                <p className="text-[9px] text-gray-400 font-medium px-4 mt-1">
                  Select a date and fill the form above to add an auspicious planner event.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto scrollbar-thin">
                {eventsForSelectedDate.map(ev => {
                  const evType = EVENT_TYPES.find(t => t.id === ev.type) || EVENT_TYPES[4];
                  return (
                    <div 
                      key={ev.id}
                      className={`p-3.5 rounded-2xl border flex items-start gap-3 justify-between group transition-all duration-150 ${
                        ev.completed ? 'bg-gray-50/55 border-gray-100 opacity-60' : 'bg-white border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <button 
                        onClick={() => toggleEventCompleted(ev.id)}
                        className="mt-0.5 shrink-0 hover:scale-105 duration-100"
                      >
                        {ev.completed ? (
                          <div className="w-4 h-4 rounded-md bg-green-500 text-white flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded0 box-border border border-gray-300 rounded-md bg-white hover:border-pink-500" />
                        )}
                      </button>

                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div>
                          <p className={`text-xs font-black uppercase tracking-wide leading-tight truncate ${ev.completed ? 'line-through text-gray-405' : 'text-gray-900'}`}>
                            {ev.title}
                          </p>
                          <span className={`inline-block text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide mt-1 ${evType.color.split(' ')[0]} ${evType.color.split(' ')[1]}`}>
                            {evType.label.split(' ')[0]} {evType.label.split(' ').slice(1).join(' ')}
                          </span>
                        </div>

                        {ev.venueTitle && (
                          <div className="flex items-center text-[8px] font-bold text-pink-600 uppercase tracking-widest gap-1">
                            <MapPin className="w-3 h-3 text-pink-500" />
                            <span className="truncate">{ev.venueTitle}</span>
                          </div>
                        )}

                        {ev.notes && (
                          <p className="text-[9px] text-gray-400 font-medium italic select-text">
                            {ev.notes}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="text-gray-350 hover:text-red-500 opacity-0 group-hover:opacity-100 duration-150 shrink-0 self-center"
                        title="Delete Milestone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Massive All Milestones & Wedding Schedule Checklist underneath */}
      <div className="mt-12 pt-8 border-t border-gray-150">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-base font-black text-gray-900 uppercase tracking-wide font-serif flex items-center gap-1.5">
              <Milestone className="w-5 h-5 text-gray-900" />
              Checklist of Critical Wedding Dates
            </h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">
              Complete pre-wedding deposits, venue visits & astrological alignments
            </p>
          </div>
          <span className="text-[10px] font-black text-white bg-gray-900 px-3 py-1 rounded-full uppercase tracking-wider">
            {events.filter(e => e.completed).length} / {events.length} Completed
          </span>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-xs text-gray-400 uppercase font-black tracking-widest">Global Timeline is Empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(ev => {
              const evType = EVENT_TYPES.find(t => t.id === ev.type) || EVENT_TYPES[4];
              const eventDateObj = new Date(ev.date);
              const formattedDate = eventDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              
              return (
                <div 
                  key={ev.id}
                  className={`p-4 rounded-3xl bg-gray-50/70 border flex flex-col justify-between duration-150 relative ${
                    ev.completed ? 'border-gray-150 opacity-60' : 'border-gray-200/50 hover:border-pink-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header line with tag and complete checkbox */}
                    <div className="flex items-start justify-between">
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide ${evType.color.split(' ')[0]} ${evType.color.split(' ')[1]}`}>
                        {evType.label}
                      </span>

                      <button 
                        onClick={() => toggleEventCompleted(ev.id)}
                        className="text-gray-400 hover:text-green-600"
                      >
                        {ev.completed ? (
                          <div className="w-5 h-5 bg-green-500 rounded-md text-white flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 border border-gray-300 rounded-md bg-white hover:border-pink-500" />
                        )}
                      </button>
                    </div>

                    {/* Content body */}
                    <div>
                      <h5 className={`text-xs font-black uppercase tracking-wide leading-snug line-clamp-2 ${ev.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {ev.title}
                      </h5>
                      {ev.notes && (
                        <p className="text-[10px] text-gray-400 font-medium italic mt-1 leading-snug">
                          {ev.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer metadata line */}
                  <div className="pt-3 border-t border-gray-200/50 mt-4 flex items-center justify-between">
                    <span className="text-[9px] font-black text-gray-500 flex items-center gap-1 uppercase tracking-widest">
                      <CalendarIcon className="w-3.5 h-3.5 text-pink-500" />
                      {formattedDate}
                    </span>

                    <button 
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="text-gray-400 hover:text-red-500 text-[10px] uppercase font-bold tracking-widest inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
