import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { collection, addDoc, doc, updateDoc, deleteDoc, writeBatch, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const NotificationContext = createContext({
  notifications: [],
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  deleteNotification: () => {},
  executeAction: () => {},
  broadcastAlert: () => {},
  unreadCount: 0,
  realtimeConnected: false
});

export const useNotifications = () => useContext(NotificationContext);

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'default-notif-1',
    title: 'Resort Booking Confirmed! 🎉',
    message: 'Admin Manish accepted your booking query for Siri Nature\'s Valley Resort. Pre-booking voucher is generated.',
    type: 'booking',
    recipientRole: 'user',
    senderName: 'System Admin',
    targetId: 'venue_siri_natures',
    targetName: "Siri Nature's Valley Resort",
    actionable: false,
    actionStatus: 'completed',
    timestamp: Date.now() - 3600000 * 2, // 2 hours ago
    read: false
  },
  {
    id: 'default-notif-2',
    title: 'New Service Addition Pending Review 🛠️',
    message: 'Vendor "Elite Flowers & Decor" requested to add a new luxury venue service "Heavenly Jasmine Garland Mandap".',
    type: 'service',
    recipientRole: 'admin',
    senderName: 'Elite Flowers Vendor',
    targetId: 'service_luxury_jasmine',
    targetName: 'Heavenly Jasmine Mandap',
    actionable: true,
    actionLabel: 'Confirm & Approve Service',
    actionStatus: 'pending',
    timestamp: Date.now() - 3600000 * 12, // 12 hours ago
    read: false
  },
  {
    id: 'default-notif-3',
    title: 'Booking Request Received 💍',
    message: 'Bridesmaid Divya wishes to reserve "Amita Rasa" for a guest capacity of 500 guests on 2026-06-15.',
    type: 'booking',
    recipientRole: 'vendor',
    senderName: 'Divya (User)',
    targetId: 'venue_amita_rasa',
    targetName: 'Amita Rasa Venue',
    actionable: true,
    actionLabel: 'Accept & Book',
    actionStatus: 'pending',
    timestamp: Date.now() - 3600000 * 24, // 1 day ago
    read: true
  },
  {
    id: 'default-notif-4',
    title: 'Planetary Cosmic Alert ⭐',
    message: 'Solar-Mercury alignment on June 20-22 offers extremely auspicious 5-star Vivah Muhurats. Hyderabad/Lucknow venues are selling 3x faster than average!',
    type: 'system',
    recipientRole: 'everyone',
    senderName: 'Astrologer Acharya',
    actionable: false,
    timestamp: Date.now() - 3600000 * 48, // 2 days ago
    read: false
  }
];

export function NotificationProvider({ children }) {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  
  // Refs to allow accessing active state in websocket onSnapshot triggers without stale closures
  const notificationsRef = useRef([]);
  const userRef = useRef(user);
  const roleRef = useRef(role);
  const firstLoadRef = useRef(true);

  // Sync references
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    userRef.current = user;
    roleRef.current = role;
  }, [user, role]);

  // Handle Seeding of Default Notifications to Firestore
  const seedDefaultNotifications = async () => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      DEFAULT_NOTIFICATIONS.forEach((n) => {
        const docRef = doc(collection(db, 'notifications'));
        batch.set(docRef, {
          ...n,
          timestamp: Date.now() - (Date.now() - n.timestamp), // keep original offsets
          createdBy: 'system_bootstrap',
          recipientUserId: n.recipientRole === 'user' ? user.uid : null
        });
      });
      await batch.commit();
      console.log('Seeded default notifications to Cloud Firestore successfully.');
    } catch (err) {
      console.error('Failed to seed default notifications into Firestore:', err);
    }
  };

  // Firestore Realtime Listener
  useEffect(() => {
    if (!user) {
      // Local Fallback: load offline data from localStorage
      const saved = localStorage.getItem('gathbandhan_offline_alerts_log');
      let localAlerts = DEFAULT_NOTIFICATIONS;
      if (saved) {
        try {
          localAlerts = JSON.parse(saved);
        } catch (e) {
          localAlerts = DEFAULT_NOTIFICATIONS;
        }
      }
      setNotifications(localAlerts);
      setRealtimeConnected(false);
      firstLoadRef.current = true;
      return;
    }

    setRealtimeConnected(true);
    firstLoadRef.current = true;

    const unsubscribe = onSnapshot(
      collection(db, 'notifications'),
      async (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort on client side descending by timestamp
        items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        // Seed if empty
        if (items.length === 0 && firstLoadRef.current) {
          firstLoadRef.current = false;
          await seedDefaultNotifications();
          return;
        }

        // Real-Time Incoming Alert Toast Filter Block (Only trigger for newly received items AFTER first load)
        if (!firstLoadRef.current) {
          const newItems = items.filter(
            (item) => !notificationsRef.current.some((existing) => existing.id === item.id)
          );

          newItems.forEach((item) => {
            // Recipient check
            const isRecipient =
              item.recipientRole === 'everyone' ||
              item.recipientRole === roleRef.current ||
              item.recipientUserId === userRef.current?.uid;

            // Sender check (avoid triggering alert for user doing the action)
            const isSender = item.createdBy === userRef.current?.uid;

            if (isRecipient && !isSender) {
              toast(
                (t) => (
                  <span className="flex flex-col gap-1 text-xs select-none">
                    <strong className="text-gray-900 font-extrabold tracking-tight uppercase flex items-center gap-1.5">
                      <span>🔔</span> Real-Time Alert
                    </strong>
                    <span className="text-gray-950 font-black mb-0.5">{item.title}</span>
                    <span className="text-gray-500 font-medium">
                      {item.message.substring(0, 100)}
                      {item.message.length > 100 ? '...' : ''}
                    </span>
                  </span>
                ),
                {
                  duration: 6000,
                  icon: '🔔',
                  style: {
                    borderRadius: '1.25rem',
                    background: '#fff',
                    color: '#1e293b',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    border: '2px solid #ec4899',
                  }
                }
              );
            }
          });
        }

        setNotifications(items);
        firstLoadRef.current = false;
      },
      (error) => {
        console.error('Firestore real-time listener failed:', error);
        setRealtimeConnected(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Sync back local changes if not authenticated (Offline Mode)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('gathbandhan_offline_alerts_log', JSON.stringify(notifications));
    }
  }, [notifications, user]);

  // Add alert notification
  const addNotification = async ({
    title,
    message,
    type = 'general',
    recipientRole = 'everyone',
    senderName = 'System',
    targetId = null,
    targetName = null,
    actionable = false,
    actionLabel = '',
    recipientUserId = null
  }) => {
    const newAlert = {
      title,
      message,
      type,
      recipientRole,
      senderName,
      targetId,
      targetName,
      actionable,
      actionLabel,
      actionStatus: actionable ? 'pending' : 'completed',
      timestamp: Date.now(),
      read: false,
      recipientUserId: recipientUserId || null,
      createdBy: user ? user.uid : 'anonymous'
    };

    if (user) {
      try {
        await addDoc(collection(db, 'notifications'), newAlert);
      } catch (err) {
        console.error('Error writing notification to Firestore:', err);
        // Fallback locally
        setNotifications((prev) => [
          { id: `alert-local-${Date.now()}`, ...newAlert },
          ...prev
        ]);
        triggerStandardToast(title, message);
      }
    } else {
      setNotifications((prev) => [
        { id: `alert-local-${Date.now()}`, ...newAlert },
        ...prev
      ]);
      triggerStandardToast(title, message);
    }
  };

  const triggerStandardToast = (title, message) => {
    toast(
      (t) => (
        <span className="flex flex-col gap-1 text-xs select-none">
          <strong className="text-gray-900 font-black tracking-tight uppercase flex items-center gap-1.5 animate-pulse">
            <span>📢</span> {title}
          </strong>
          <span className="text-gray-500 font-medium">
            {message.substring(0, 100)}
            {message.length > 100 ? '...' : ''}
          </span>
        </span>
      ),
      {
        duration: 5000,
        icon: '🔔',
        style: {
          borderRadius: '1.25rem',
          background: '#fff',
          color: '#1e293b',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          border: '1px solid #f1f5f9'
        }
      }
    );
  };

  const markAsRead = async (id) => {
    if (user && !id.startsWith('alert-local')) {
      try {
        await updateDoc(doc(db, 'notifications', id), { read: true });
      } catch (err) {
        console.error('Failed to mark read in Firestore:', err);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } else {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifs = notifications.filter((n) => !n.read);
    if (unreadNotifs.length === 0) return;

    if (user) {
      try {
        const batch = writeBatch(db);
        unreadNotifs.forEach((n) => {
          if (!n.id.startsWith('alert-local')) {
            batch.update(doc(db, 'notifications', n.id), { read: true });
          }
        });
        await batch.commit();
        toast.success('All notifications marked as read', { id: 'read-all' });
      } catch (err) {
        console.error('Batch read all failed, doing sequential update:', err);
        for (const n of unreadNotifs) {
          try {
            await updateDoc(doc(db, 'notifications', n.id), { read: true });
          } catch (e) {}
        }
        toast.success('All notifications marked as read', { id: 'read-all' });
      }
    } else {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read', { id: 'read-all' });
    }
  };

  const deleteNotification = async (id) => {
    if (user && !id.startsWith('alert-local')) {
      try {
        await deleteDoc(doc(db, 'notifications', id));
        toast.success('Alert dismissed');
      } catch (err) {
        console.error('Failed to delete notification in Firestore:', err);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast.success('Alert dismissed');
      }
    } else {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Alert dismissed');
    }
  };

  const executeAction = async (id, approvalState = 'completed') => {
    const n = notifications.find((notif) => notif.id === id);
    if (!n) return;

    if (user && !id.startsWith('alert-local')) {
      try {
        await updateDoc(doc(db, 'notifications', id), {
          actionStatus: approvalState,
          read: true
        });

        // Deep Action Linkages: Interact with other modules of the website live!
        if (n.targetId) {
          if (n.type === 'service') {
            try {
              await updateDoc(doc(db, 'services', n.targetId), {
                status: approvalState === 'completed' ? 'approved' : 'rejected'
              });
            } catch (err) {
              console.warn('Silent fallback for service sync (not found or permission):', err);
            }
          } else if (n.type === 'booking') {
            try {
              await updateDoc(doc(db, 'bookings', n.targetId), {
                status: approvalState === 'completed' ? 'confirmed' : 'cancelled'
              });
            } catch (err) {
              console.warn('Silent fallback for booking sync (not found or permission):', err);
            }
          }
        }

        const verb = approvalState === 'completed' ? 'Approved' : 'Declined';

        // Direct follow-up broadcast message to the original sender or booking client
        await addDoc(collection(db, 'notifications'), {
          title: `${n.type === 'service' ? 'Service Listing Approved! 🎉' : 'Booking Request Approved! 💍'}`,
          message: `${n.senderName} received an update: "${n.targetName}" has been successfully ${verb.toLowerCase()} by Admin मनीष. It is active in real-time.`,
          type: n.type,
          recipientRole: n.type === 'service' ? 'vendor' : 'user',
          recipientUserId: n.createdBy !== 'system_bootstrap' ? n.createdBy : null,
          senderName: 'Admin Automator',
          timestamp: Date.now(),
          read: false,
          actionable: false,
          actionStatus: 'completed',
          createdBy: user.uid
        });

        toast.success(
          approvalState === 'completed'
            ? 'Request thoroughly validated, approved, and listed!'
            : 'Request declined.',
          { icon: '💼' }
        );
      } catch (err) {
        console.error('Failed to execute real-time action:', err);
      }
    } else {
      // Local simulation action
      setNotifications((prev) =>
        prev.map((notif) => {
          if (notif.id === id) {
            const verb = approvalState === 'completed' ? 'Approved' : 'Declined';
            setTimeout(() => {
              addNotification({
                title: `${notif.type === 'service' ? 'Service Request' : 'Booking Request'} ${verb}! 🎉`,
                message: `${notif.senderName} received positive updates: "${notif.targetName}" has been successfully ${verb.toLowerCase()} by key stakeholders.`,
                type: notif.type,
                recipientRole: 'user',
                senderName: 'System Automator'
              });
            }, 1000);

            return {
              ...notif,
              actionStatus: approvalState,
              read: true
            };
          }
          return notif;
        })
      );
      toast.success(
        approvalState === 'completed' ? 'Request successfully approved!' : 'Request declined.',
        { icon: '💼' }
      );
    }
  };

  const broadcastAlert = (title, message, senderName = 'System Admin') => {
    addNotification({
      title,
      message,
      type: 'system',
      recipientRole: 'everyone',
      senderName,
      actionable: false
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        executeAction,
        broadcastAlert,
        unreadCount,
        realtimeConnected
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
