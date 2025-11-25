/**
 * WebSocket Service
 * Manages Socket.IO connection and real-time events
 */

import { io } from "socket.io-client";
import { APP_CONFIG } from "../../config/app.config";

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 20; // Increased from 5 to 20
    this.pingInterval = null;
  }

  /**
   * Initialize Socket.IO connection
   */
  connect() {
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);

    if (!token) {
      console.warn("[WebSocket] No auth token found, skipping connection");
      return;
    }

    // Get backend URL from environment or default
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

    this.socket = io(backendUrl, {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 60000, // 60 seconds timeout for long-running operations
      pingTimeout: 120000, // 2 minutes before considering connection dead
      pingInterval: 25000, // Send ping every 25 seconds
    });

    this._setupEventHandlers();
    this._startPingInterval();
  }

  /**
   * Setup default Socket.IO event handlers
   */
  _setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      console.log("[WebSocket] Connected:", this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this._triggerHandler("connection.status", { connected: true });
    });

    this.socket.on("connected", (data) => {
      console.log("[WebSocket] Server welcome:", data);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[WebSocket] Disconnected:", reason);
      this.isConnected = false;
      this._triggerHandler("connection.status", { connected: false, reason });
    });

    this.socket.on("connect_error", (error) => {
      console.error("[WebSocket] Connection error:", error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("[WebSocket] Max reconnection attempts reached");
        this._triggerHandler("connection.error", { error: error.message });
      }
    });

    // Real-time notification events
    this.socket.on("notification", (data) => {
      console.log("[WebSocket] Notification received:", data);
      this._triggerHandler("notification", data);
    });

    this.socket.on("validation.assigned", (data) => {
      console.log("[WebSocket] Validation assigned:", data);
      this._triggerHandler("validation.assigned", data);
    });

    this.socket.on("validation.completed", (data) => {
      console.log("[WebSocket] Validation completed:", data);
      this._triggerHandler("validation.completed", data);
    });

    this.socket.on("quiz.completed", (data) => {
      console.log("[WebSocket] Quiz completed:", data);
      this._triggerHandler("quiz.completed", data);
    });

    this.socket.on("document.processed", (data) => {
      console.log("[WebSocket] Document processed:", data);
      this._triggerHandler("document.processed", data);
    });

    this.socket.on("questionSet.generated", (data) => {
      console.log("[WebSocket] Question set generated:", data);
      this._triggerHandler("questionSet.generated", data);
    });

    this.socket.on("commission.earned", (data) => {
      console.log("[WebSocket] Commission earned:", data);
      this._triggerHandler("commission.earned", data);
    });

    this.socket.on("subscription.updated", (data) => {
      console.log("[WebSocket] Subscription updated:", data);
      this._triggerHandler("subscription.updated", data);
    });

    this.socket.on("system.announcement", (data) => {
      console.log("[WebSocket] System announcement:", data);
      this._triggerHandler("system.announcement", data);
    });
  }

  /**
   * Trigger registered event handlers
   */
  _triggerHandler(event, data) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[WebSocket] Error in handler for ${event}:`, error);
      }
    });
  }

  /**
   * Register event handler
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  /**
   * Unregister event handler
   */
  off(event, handler) {
    if (!this.eventHandlers.has(event)) return;
    
    const handlers = this.eventHandlers.get(event);
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Send ping to server (heartbeat)
   */
  ping() {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit("ping", (response) => {
      console.log("[WebSocket] Pong received:", response);
    });
  }

  /**
   * Start ping interval to keep connection alive
   */
  _startPingInterval() {
    // Clear existing interval
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    // Send ping every 30 seconds to keep connection alive
    this.pingInterval = setInterval(() => {
      if (this.isConnected) {
        console.log("[WebSocket] Sending keep-alive ping");
        this.ping();
      }
    }, 30000);
  }

  /**
   * Stop ping interval
   */
  _stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      console.log("[WebSocket] Disconnecting...");
      this._stopPingInterval();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventHandlers.clear();
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id || null,
    };
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
