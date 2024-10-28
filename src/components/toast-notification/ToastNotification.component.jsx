import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../utils/firebase.utils';

const ToastNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const notificationsRef = ref(rtdb, 'notifications');
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      const newNotifications = data ? Object.values(data) : [];

      // Add new notifications with unique IDs
      setNotifications(newNotifications.map((notification) => ({
        ...notification,
        id: Math.random().toString(36).substring(7),
      })));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (notifications.length > 0) {
        setNotifications((prev) => prev.slice(1));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [notifications]);

  const notificationVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="toast-container">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={notificationVariants}
            transition={{ duration: 0.5 }}
            className="toast-notification"
          >
            <p>{notification.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastNotifications;
