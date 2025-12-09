import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus } from '../types';
import { Button } from './Button';
import { generateCallScript } from '../services/geminiService';
import { X, Phone, Calendar, Clock, Ban, Sparkles, Loader2, ExternalLink, PhoneMissed, Fingerprint, ArrowLeft, CalendarCheck } from 'lucide-react';

interface CallModalProps {
  lead: Lead;
  userName: string;
  onClose: () => void;
  onUpdateStatus: (leadId: string, status: LeadStatus, notes?: string) => void;
}

export const CallModal: React.FC<CallModalProps> = ({ lead, userName, onClose, onUpdateStatus }) => {
  const [script, setScript] = useState<string>('');
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [notes, setNotes] = useState(lead.notes || '');

  // Scheduling State
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('10:00');

  useEffect(() => {
    if (process.env.API_KEY) {
      handleGenerateScript();
    }
    
    // Default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleDate(tomorrow.toISOString().split('T')[0]);
  }, [lead]);

  const handleGenerateScript = async () => {
    setIsLoadingScript(true);
    const generated = await generateCallScript(lead, `Name: ${userName}`);
    setScript(generated);
    setIsLoadingScript(false);
  };

  const handleConfirmBooking = () => {
    if (!scheduleDate || !scheduleTime) {
      alert("Please select a valid date and time.");
      return;
    }

    const startDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // Default 30 min duration

    const subject = encodeURIComponent(`Life Insurance Consultation - ${lead.name} / Black Cygnet`);
    const body = encodeURIComponent(
      `Lead Details:\n` +
      `Name: ${lead.name}\n` +
      `Phone: ${lead.phone}\n` +
      `ID Number: ${lead.idNumber || 'N/A'}\n\n` +
      `Notes:\n${notes}\n\n` +
      `Discussion: Life Insurance Options - Black Cygnet`
    );
    
    const startDt = startDateTime.toISOString();
    const endDt = endDateTime.toISOString();
    
    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${subject}&body=${body}&startdt=${startDt}&enddt=${endDt}`;
    
    window.open(outlookUrl, '_blank');
    
    const updatedNotes = notes + `\n[System]: Booked consultation for ${startDateTime.toLocaleString()}`;
    onUpdateStatus(lead.id, LeadStatus.BOOKED, updatedNotes);
    onClose();
  };

  const handleNoAnswer = () => {
    const subject = encodeURIComponent(`Missed Call - Black Cygnet Life Insurance`);
    const emailBody = encodeURIComponent(`Hi ${lead.name},\n\nWe tried to contact you regarding Black Cygnet's insurance solutions. We will give you another call in the next day or so.\n\nBest regards,\n${userName}\nBlack Cygnet`);
    
    if (lead.email) {
      window.open(`mailto:${lead.email}?subject=${subject}&body=${emailBody}`, '_blank');
    } else {
      alert("No email address found for this lead.");
    }

    onUpdateStatus(lead.id, LeadStatus.NO_ANSWER, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/90 backdrop-blur-md">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row ring-1 ring-black/5 dark:ring-white/10 transition-colors duration-300">
        
        {/* Left Panel: Contact Info & Notes */}
        <div className="w-full md:w-1/3 bg-zinc-50 dark:bg-black/80 border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col transition-colors duration-300">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{lead.name}</h2>
            <p className="text-zinc-500 font-medium uppercase text-xs tracking-wider mt-1">{lead.company || 'Private Client'}</p>
            {lead.role && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{lead.role}</p>}
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex flex-col space-y-1">
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Phone</label>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 group hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors shadow-sm">
                 <a href={`tel:${lead.phone}`} className="text-lg font-mono font-medium text-zinc-900 dark:text-white group-hover:text-black dark:group-hover:text-white">
                   {lead.phone || 'No Phone Number'}
                 </a>
                 <Phone className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white" />
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Email</label>
               <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 group hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors shadow-sm">
                 <a href={`mailto:${lead.email}`} className="text-sm text-zinc-600 dark:text-zinc-300 truncate group-hover:text-black dark:group-hover:text-white">
                    {lead.email || 'No Email'}
                 </a>
                 <ExternalLink className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white" />
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">ID Number</label>
               <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 group transition-colors shadow-sm">
                 <span className="text-sm font-mono text-zinc-600 dark:text-zinc-300">
                    {lead.idNumber || 'N/A'}
                 </span>
                 <Fingerprint className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[150px] flex flex-col">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Consultation Notes</label>
            <textarea 
              className="w-full flex-1 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-lg focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white resize-none text-sm placeholder-zinc-400 dark:placeholder-zinc-600 transition-all shadow-sm"
              placeholder="Record key details from your conversation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Right Panel: Script & Actions OR Scheduler */}
        <div className="w-full md:w-2/3 p-6 flex flex-col bg-white dark:bg-zinc-900/50 transition-colors duration-300 relative">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">
              {isScheduling ? (
                <>
                  <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  Schedule Consultation
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  AI Assistant
                </>
              )}
            </h3>
            <button onClick={onClose} className="text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 overflow-y-auto shadow-inner mb-6 relative">
            
            {isScheduling ? (
              <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto space-y-6 animate-fade-in-up">
                <div className="text-center space-y-2">
                   <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full inline-block mb-2">
                      <CalendarCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                   </div>
                   <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Book Appointment</h3>
                   <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a date and time to open Outlook Calendar.</p>
                </div>

                <div className="w-full space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Date</label>
                    <input 
                      type="date" 
                      className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Time</label>
                    <input 
                      type="time" 
                      className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 w-full mt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setIsScheduling(false)}>
                    Back
                  </Button>
                  <Button variant="success" className="flex-1" onClick={handleConfirmBooking}>
                    Confirm Booking
                  </Button>
                </div>
              </div>
            ) : (
              // AI Script View
              <>
                {isLoadingScript ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50/90 dark:bg-zinc-950/90 z-10 backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 text-black dark:text-white animate-spin mb-3" />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-widest">Generating Strategy...</p>
                  </div>
                ) : script ? (
                  <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {script}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                    <p>Click generate to get an AI-powered script tailored for this client.</p>
                    <Button variant="secondary" size="sm" onClick={handleGenerateScript} className="mt-4">
                      Generate Script
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions - Only show if not scheduling */}
          {!isScheduling && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <Button 
                variant="outline" 
                className="flex-col h-auto py-3 text-zinc-500 border-zinc-300 hover:bg-zinc-100 hover:text-black dark:text-zinc-400 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
                onClick={() => {
                  onUpdateStatus(lead.id, LeadStatus.RESCHEDULED, notes);
                  onClose();
                }}
              >
                <Clock className="w-5 h-5 mb-1.5" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Reschedule</span>
              </Button>

              <Button 
                variant="warning" 
                className="flex-col h-auto py-3"
                onClick={handleNoAnswer}
              >
                <PhoneMissed className="w-5 h-5 mb-1.5 text-white" />
                <span className="text-white text-[10px] uppercase font-bold tracking-wider">No Answer</span>
              </Button>

              <Button 
                variant="danger" 
                className="flex-col h-auto py-3"
                onClick={() => {
                  onUpdateStatus(lead.id, LeadStatus.CANCELLED, notes);
                  onClose();
                }}
              >
                <Ban className="w-5 h-5 mb-1.5 text-white" />
                <span className="text-white text-[10px] uppercase font-bold tracking-wider">Cancel</span>
              </Button>

              <Button 
                variant="success" 
                className="flex-col h-auto py-3"
                onClick={() => setIsScheduling(true)}
              >
                <Calendar className="w-5 h-5 mb-1.5 text-white" />
                <span className="text-white text-[10px] uppercase font-bold tracking-wider">Book</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
