import PusherClient from 'pusher-js';
import { CHANNELS, EVENTS } from './pusher';

interface PusherManagerConfig {
  userId: string;
  onMessage?: (data: any) => void;
  onTyping?: (data: any) => void;
  onReadReceipt?: (data: any) => void;
  onMatch?: (data: any) => void;
  onLike?: (data: any) => void;
}

class PusherManager {
  private static instance: PusherManager | null = null;
  private pusher: PusherClient | null = null;
  private channel: any = null;
  private userId: string | null = null;
  private connectionPromise: Promise<void> | null = null;
  private isConnected = false;
  private subscribers = new Map<string, PusherManagerConfig>();

  private constructor() {}

  static getInstance(): PusherManager {
    if (!PusherManager.instance) {
      PusherManager.instance = new PusherManager();
    }
    return PusherManager.instance;
  }

  async connect(config: PusherManagerConfig): Promise<string> {
    const subscriberId = `subscriber-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.subscribers.set(subscriberId, config);

    // If already connected to the same user, just add subscriber
    if (this.isConnected && this.userId === config.userId && this.pusher?.connection.state === 'connected') {
      console.log('PusherManager: Reusing existing connection');
      return Promise.resolve(subscriberId);
    }

    // If connecting to different user, disconnect first
    if (this.pusher && this.userId !== config.userId) {
      console.log('PusherManager: Switching user, disconnecting');
      await this.disconnect();
    }

    // If already connecting, wait for it
    if (this.connectionPromise) {
      console.log('PusherManager: Connection in progress, waiting');
      await this.connectionPromise;
      return subscriberId;
    }

    // Only connect if not already connected or connection is broken
    if (!this.pusher || this.pusher.connection.state === 'disconnected' || this.pusher.connection.state === 'failed') {
      this.connectionPromise = this._connect(config);
      await this.connectionPromise;
    }
    
    return subscriberId;
  }

  private async _connect(config: PusherManagerConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
          forceTLS: true,
          enabledTransports: ['ws', 'wss'],
          disableStats: true,
        });

        this.userId = config.userId;
        this.channel = this.pusher.subscribe(CHANNELS.USER(config.userId));

        this.pusher.connection.bind('connected', () => {
          console.log('PusherManager: Connected');
          this.isConnected = true;
          this.connectionPromise = null;
          this.bindAllEvents();
          resolve();
        });

        this.pusher.connection.bind('disconnected', () => {
          console.log('PusherManager: Disconnected');
          this.isConnected = false;
        });

        this.pusher.connection.bind('error', (error: any) => {
          console.error('PusherManager: Connection error:', error);
          this.isConnected = false;
          this.connectionPromise = null;
          reject(error);
        });

        this.pusher.connection.bind('failed', () => {
          console.error('PusherManager: Connection failed');
          this.isConnected = false;
          this.connectionPromise = null;
        });
      } catch (error) {
        this.connectionPromise = null;
        reject(error);
      }
    });
  }

  private bindAllEvents() {
    if (!this.channel) return;

    // Bind all events for all subscribers
    this.channel.bind(EVENTS.MESSAGE_RECEIVE, (data: any) => {
      this.subscribers.forEach(config => config.onMessage?.(data));
    });

    this.channel.bind(EVENTS.TYPING_USER_TYPING, (data: any) => {
      this.subscribers.forEach(config => config.onTyping?.(data));
    });

    this.channel.bind(EVENTS.MESSAGE_READ_RECEIPT, (data: any) => {
      this.subscribers.forEach(config => config.onReadReceipt?.(data));
    });

    this.channel.bind(EVENTS.MATCH_NEW, (data: any) => {
      this.subscribers.forEach(config => config.onMatch?.(data));
    });

    this.channel.bind(EVENTS.MATCH_LIKE, (data: any) => {
      this.subscribers.forEach(config => config.onLike?.(data));
    });
  }

  private bindEvents(config: PusherManagerConfig) {
    // Events are already bound globally, subscribers just need to be in the map
  }

  disconnect(subscriberId?: string): Promise<void> {
    if (subscriberId) {
      this.subscribers.delete(subscriberId);
      console.log(`PusherManager: Removed subscriber ${subscriberId}, remaining: ${this.subscribers.size}`);
      
      // Don't disconnect if other subscribers exist
      if (this.subscribers.size > 0) {
        return Promise.resolve();
      }
    }

    console.log('PusherManager: Disconnecting all subscribers');
    
    return new Promise((resolve) => {
      // Only cleanup if we're the only subscriber left
      if (this.subscribers.size === 0) {
        if (this.channel) {
          try {
            this.channel.unbind_all();
            if (this.pusher && 
                this.pusher.connection.state === 'connected') {
              this.pusher.unsubscribe(CHANNELS.USER(this.userId!));
            }
          } catch (error) {
            console.warn('Error during channel cleanup:', error);
          }
          this.channel = null;
        }

        // Only disconnect if no subscribers and connection is active
        if (this.pusher && this.pusher.connection.state === 'connected') {
          try {
            this.pusher.disconnect();
          } catch (error) {
            console.warn('Error during Pusher disconnect:', error);
          }
        }

        this.pusher = null;
        this.userId = null;
        this.isConnected = false;
        this.connectionPromise = null;
        this.subscribers.clear();
      }
      
      resolve();
    });
  }

  getConnectionState(): boolean {
    return this.isConnected;
  }

  subscribe(subscriberId: string, config: PusherManagerConfig) {
    this.subscribers.set(subscriberId, config);
    return () => {
      this.subscribers.delete(subscriberId);
      if (this.subscribers.size === 0) {
        this.disconnect();
      }
    };
  }
}

export const pusherManager = PusherManager.getInstance();