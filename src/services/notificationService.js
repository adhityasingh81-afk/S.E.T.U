/**
 * Centralized Notification and Messaging Service for NEXUS
 * Synchronizes crisis alerts, SOS field telemetry, and inter-agency messages
 * across the Command Center, Header Notification Bell, and /sos emergency routes.
 */

const STORAGE_KEY_NOTIFS = 'nexus_crisis_notifications';
const STORAGE_KEY_MSGS = 'nexus_supplier_messages';

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Active Landslide Severance: NH-6 Sonapur Pass',
    desc: '75% flow disruption in East Jaintia Hills. Agartala & Aizawl medical oxygen runway down to 2.2 days.',
    time: '2m ago',
    type: 'crisis',
    unread: true,
    actionTab: 'fracture-mode',
    actionLabel: 'View Cascade Ripple'
  },
  {
    id: 'notif-2',
    title: 'NFR Freight Green Corridor Finalised',
    desc: 'North East Frontier Railway locked 2 dedicated Ro-Ro trains through Badarpur siding within 48 hours.',
    time: '14m ago',
    type: 'negotiation',
    unread: true,
    actionTab: 'negotiation-room',
    actionLabel: 'Open Negotiation Room'
  },
  {
    id: 'notif-3',
    title: 'Multimodal Failover Protocol Active',
    desc: 'Strategy C (Balanced Tri-Modal) computed +₹20.8 Cr net economic & relief value preserved.',
    time: '35m ago',
    type: 'recovery',
    unread: false,
    actionTab: 'recovery-cockpit',
    actionLabel: 'Inspect Strategy'
  },
];

export const INITIAL_MESSAGES = [
  {
    id: 'msg-1',
    sender: 'Col. Vikramaditya Rathore (BRO Task Force)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    subject: 'Sonapur Pass 120-ft Bailey Bridge Deployment',
    preview: 'Double-single military Bailey bridge launched. Single-lane emergency convoy passage opens in 36 hours.',
    time: '10:20 AM',
    unread: true,
    actionTab: 'negotiation-room',
  },
  {
    id: 'msg-2',
    sender: 'Sanjay K. Barua, IRTS (NFR Maligaon)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    subject: 'Emergency Rake Allocation: Lumding-Badarpur',
    preview: '14 flat-car wagons allocated for cryogenic oxygen tankers. Green corridor clear signal authorized.',
    time: '09:45 AM',
    unread: true,
    actionTab: 'recovery-cockpit',
  },
  {
    id: 'msg-3',
    sender: 'Pranab Bordoloi (IWAI Pandu Port)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    subject: 'NW-2 River Barge Flotilla En Route',
    preview: '4 self-propelled 200-tonne river barges departed Pandu for Dhubri/Jogighopa along National Waterway 2.',
    time: '08:20 AM',
    unread: false,
    actionTab: 'digital-twin',
  },
];

class NotificationService {
  constructor() {
    this.listeners = new Set();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY_NOTIFS || e.key === STORAGE_KEY_MSGS) {
          this._notifyListeners();
        }
      });
      window.addEventListener('nexus:notif-event', () => {
        this._notifyListeners();
      });
    }
  }

  _notifyListeners() {
    const notifs = this.getNotifications();
    const msgs = this.getMessages();
    this.listeners.forEach(fn => fn({ notifications: notifs, messages: msgs }));
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getNotifications() {
    if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed reading notifications from localStorage', e);
    }
    return INITIAL_NOTIFICATIONS;
  }

  getMessages() {
    if (typeof window === 'undefined') return INITIAL_MESSAGES;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MSGS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed reading messages from localStorage', e);
    }
    return INITIAL_MESSAGES;
  }

  saveNotifications(notifs) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifs));
      } catch (e) {
        console.warn('Failed saving notifications', e);
      }
      window.dispatchEvent(new Event('nexus:notif-event'));
    }
    this._notifyListeners();
  }

  saveMessages(msgs) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_MSGS, JSON.stringify(msgs));
      } catch (e) {
        console.warn('Failed saving messages', e);
      }
      window.dispatchEvent(new Event('nexus:notif-event'));
    }
    this._notifyListeners();
  }

  addNotification(notif) {
    const current = this.getNotifications();
    const newEntry = {
      id: notif.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      time: notif.time || 'Just now',
      unread: true,
      ...notif
    };
    const updated = [newEntry, ...current];
    this.saveNotifications(updated);
    return newEntry;
  }

  addMessage(msg) {
    const current = this.getMessages();
    const newEntry = {
      id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      time: msg.time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      unread: true,
      ...msg
    };
    const updated = [newEntry, ...current];
    this.saveMessages(updated);
    return newEntry;
  }

  markAllNotifsRead() {
    const current = this.getNotifications();
    const updated = current.map(n => ({ ...n, unread: false }));
    this.saveNotifications(updated);
  }

  markAllMessagesRead() {
    const current = this.getMessages();
    const updated = current.map(m => ({ ...m, unread: false }));
    this.saveMessages(updated);
  }

  markNotifRead(id) {
    const current = this.getNotifications();
    const updated = current.map(n => n.id === id ? { ...n, unread: false } : n);
    this.saveNotifications(updated);
  }

  markMessageRead(id) {
    const current = this.getMessages();
    const updated = current.map(m => m.id === id ? { ...m, unread: false } : m);
    this.saveMessages(updated);
  }
}

export const notificationService = new NotificationService();
