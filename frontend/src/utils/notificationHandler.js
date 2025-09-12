/**
 * Notification Handler
 * Centralized notification management
 */

import { NOTIFICATION_TYPES } from './constants';

/**
 * Notification types
 */
export const NOTIFICATION_POSITIONS = {
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  TOP_CENTER: 'top-center',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_CENTER: 'bottom-center'
};

/**
 * Notification class
 */
export class Notification {
  constructor({
    id = null,
    title = '',
    message = '',
    type = NOTIFICATION_TYPES.INFO,
    duration = 5000,
    position = NOTIFICATION_POSITIONS.TOP_RIGHT,
    closable = true,
    persistent = false,
    actions = [],
    data = null
  } = {}) {
    this.id = id || this.generateId();
    this.title = title;
    this.message = message;
    this.type = type;
    this.duration = duration;
    this.position = position;
    this.closable = closable;
    this.persistent = persistent;
    this.actions = actions;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.visible = true;
  }

  generateId() {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  hide() {
    this.visible = false;
  }

  show() {
    this.visible = true;
  }
}

/**
 * Notification handler class
 */
export class NotificationHandler {
  constructor() {
    this.notifications = [];
    this.listeners = [];
    this.defaultDuration = 5000;
    this.defaultPosition = NOTIFICATION_POSITIONS.TOP_RIGHT;
  }

  /**
   * Add notification listener
   */
  addListener(listener) {
    this.listeners.push(listener);
  }

  /**
   * Remove notification listener
   */
  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify listeners
   */
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.notifications);
      } catch (err) {
      }
    });
  }

  /**
   * Add notification
   */
  add(notification) {
    const notif = notification instanceof Notification ? notification : new Notification(notification);
    this.notifications.push(notif);
    this.notifyListeners();

    // Auto remove if not persistent
    if (!notif.persistent && notif.duration > 0) {
      setTimeout(() => {
        this.remove(notif.id);
      }, notif.duration);
    }

    return notif.id;
  }

  /**
   * Remove notification
   */
  remove(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.notifyListeners();
    }
  }

  /**
   * Clear all notifications
   */
  clear() {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * Clear notifications by type
   */
  clearByType(type) {
    this.notifications = this.notifications.filter(n => n.type !== type);
    this.notifyListeners();
  }

  /**
   * Get all notifications
   */
  getAll() {
    return [...this.notifications];
  }

  /**
   * Get notifications by type
   */
  getByType(type) {
    return this.notifications.filter(n => n.type === type);
  }

  /**
   * Get visible notifications
   */
  getVisible() {
    return this.notifications.filter(n => n.visible);
  }

  /**
   * Show notification
   */
  show(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.show();
      this.notifyListeners();
    }
  }

  /**
   * Hide notification
   */
  hide(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.hide();
      this.notifyListeners();
    }
  }

  /**
   * Create specific notification types
   */
  success(title, message, options = {}) {
    return this.add({
      title,
      message,
      type: NOTIFICATION_TYPES.SUCCESS,
      ...options
    });
  }

  error(title, message, options = {}) {
    return this.add({
      title,
      message,
      type: NOTIFICATION_TYPES.ERROR,
      duration: 0, // Error notifications don't auto-dismiss
      persistent: true,
      ...options
    });
  }

  warning(title, message, options = {}) {
    return this.add({
      title,
      message,
      type: NOTIFICATION_TYPES.WARNING,
      ...options
    });
  }

  info(title, message, options = {}) {
    return this.add({
      title,
      message,
      type: NOTIFICATION_TYPES.INFO,
      ...options
    });
  }

  /**
   * Show loading notification
   */
  loading(title, message, options = {}) {
    return this.add({
      title,
      message,
      type: NOTIFICATION_TYPES.INFO,
      persistent: true,
      duration: 0,
      ...options
    });
  }

  /**
   * Update notification
   */
  update(id, updates) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      Object.assign(notification, updates);
      this.notifyListeners();
    }
  }

  /**
   * Replace notification
   */
  replace(id, newNotification) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index > -1) {
      this.notifications[index] = newNotification instanceof Notification
        ? newNotification
        : new Notification(newNotification);
      this.notifyListeners();
    }
  }
}

/**
 * Global notification handler instance
 */
export const notificationHandler = new NotificationHandler();

/**
 * Notification context
 */
export const NotificationContext = React.createContext({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  clearNotifications: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {}
});

/**
 * Notification provider
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNotificationsChange = (newNotifications) => {
      setNotifications(newNotifications);
    };

    notificationHandler.addListener(handleNotificationsChange);

    return () => {
      notificationHandler.removeListener(handleNotificationsChange);
    };
  }, []);

  const addNotification = (notification) => {
    return notificationHandler.add(notification);
  };

  const removeNotification = (id) => {
    notificationHandler.remove(id);
  };

  const clearNotifications = () => {
    notificationHandler.clear();
  };

  const success = (title, message, options) => {
    return notificationHandler.success(title, message, options);
  };

  const error = (title, message, options) => {
    return notificationHandler.error(title, message, options);
  };

  const warning = (title, message, options) => {
    return notificationHandler.warning(title, message, options);
  };

  const info = (title, message, options) => {
    return notificationHandler.info(title, message, options);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearNotifications,
      success,
      error,
      warning,
      info
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Use notification hook
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

/**
 * Notification component
 */
export const NotificationComponent = ({ notification, onClose }) => {
  const getTypeIcon = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case NOTIFICATION_TYPES.ERROR:
        return <XCircle className="w-5 h-5 text-red-500" />;
      case NOTIFICATION_TYPES.WARNING:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case NOTIFICATION_TYPES.INFO:
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeClasses = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return 'border-green-200 bg-green-50';
      case NOTIFICATION_TYPES.ERROR:
        return 'border-red-200 bg-red-50';
      case NOTIFICATION_TYPES.WARNING:
        return 'border-yellow-200 bg-yellow-50';
      case NOTIFICATION_TYPES.INFO:
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`border-l-4 ${getTypeClasses()} p-4 shadow-lg`}>
      <div className="flex items-start space-x-3">
        {getTypeIcon()}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{notification.title}</h4>
            {notification.closable && (
              <button
                onClick={() => onClose(notification.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.message}
          </p>
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex space-x-2 mt-3">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Notification container component
 */
export const NotificationContainer = ({ position = NOTIFICATION_POSITIONS.TOP_RIGHT }) => {
  const { notifications, removeNotification } = useNotification();

  const getPositionClasses = () => {
    const positionClasses = {
      [NOTIFICATION_POSITIONS.TOP_LEFT]: 'top-4 left-4',
      [NOTIFICATION_POSITIONS.TOP_RIGHT]: 'top-4 right-4',
      [NOTIFICATION_POSITIONS.TOP_CENTER]: 'top-4 left-1/2 transform -translate-x-1/2',
      [NOTIFICATION_POSITIONS.BOTTOM_LEFT]: 'bottom-4 left-4',
      [NOTIFICATION_POSITIONS.BOTTOM_RIGHT]: 'bottom-4 right-4',
      [NOTIFICATION_POSITIONS.BOTTOM_CENTER]: 'bottom-4 left-1/2 transform -translate-x-1/2'
    };
    return positionClasses[position] || positionClasses[NOTIFICATION_POSITIONS.TOP_RIGHT];
  };

  return (
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      <div className="space-y-2">
        {notifications.map(notification => (
          <NotificationComponent
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

export default {
  NOTIFICATION_POSITIONS,
  Notification,
  NotificationHandler,
  notificationHandler,
  NotificationContext,
  NotificationProvider,
  useNotification,
  NotificationComponent,
  NotificationContainer
};
