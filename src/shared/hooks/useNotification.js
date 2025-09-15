import { toast } from 'react-hot-toast';

const TOAST_DURATION = 3000;

export const useNotification = () => {
  const defaultStyles = {
    duration: TOAST_DURATION,
    position: 'bottom-right',
  };

  const notify = {
    success: (message) => {
      toast.success(message, {
        ...defaultStyles,
        style: {
          background: '#10B981',  // green-500
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
      });
    },
    error: (message) => {
      toast.error(message, {
        ...defaultStyles,
        style: {
          background: '#EF4444',  // red-500
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
      });
    },
    warning: (message) => {
      toast(message, {
        ...defaultStyles,
        icon: '⚠️',
        style: {
          background: '#F59E0B',  // amber-500
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
      });
    },
    info: (message) => {
      toast(message, {
        ...defaultStyles,
        icon: 'ℹ️',
        style: {
          background: '#3B82F6',  // blue-500
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
      });
    },
    custom: (message, options = {}) => {
      toast(message, {
        ...defaultStyles,
        ...options,
      });
    },
  };

  return notify;
};
