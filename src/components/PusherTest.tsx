'use client';

import { useEffect, useState } from 'react';
import { usePusher } from '@/hooks/usePusher';
import { usePusherMessaging } from '@/hooks/usePusherMessaging';

export default function PusherTest() {
  const { pusher, channel, isConnected } = usePusher();
  const { isConnected: messagingConnected } = usePusherMessaging();
  const [connectionLog, setConnectionLog] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    if (pusher) {
      const log = (message: string) => {
        console.log(message);
        setConnectionLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
      };

      pusher.connection.bind('connected', () => {
        log('Pusher connected successfully');
      });

      pusher.connection.bind('disconnected', () => {
        log('Pusher disconnected');
      });

      pusher.connection.bind('error', (error: any) => {
        log(`Pusher error: ${error.message || error}`);
      });

      return () => {
        pusher.connection.unbind_all();
      };
    }
  }, [pusher]);

  // Listen for test events
  useEffect(() => {
    if (channel) {
      channel.bind('test-event', (data: any) => {
        setTestResult(`Test received: ${data.message}`);
        setConnectionLog(prev => [...prev, `${new Date().toLocaleTimeString()}: Test event received!`]);
      });

      return () => {
        channel.unbind('test-event');
      };
    }
  }, [channel]);

  const testPusher = async () => {
    try {
      setTestResult('Sending test...');
      const response = await fetch('/api/test-pusher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      if (response.ok) {
        setTestResult(`Test sent to ${result.channel}`);
      } else {
        setTestResult(`Test failed: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`Test error: ${error}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="font-semibold text-gray-800 mb-2">Pusher Status</h3>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">Notifications: {isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${messagingConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">Messaging: {messagingConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
      
      <div className="mt-3">
        <button
          onClick={testPusher}
          className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
        >
          Test Pusher
        </button>
        {testResult && (
          <p className="text-xs text-gray-600 mt-2">{testResult}</p>
        )}
      </div>
      
      <div className="mt-3">
        <h4 className="text-xs font-semibold text-gray-600 mb-1">Connection Log:</h4>
        <div className="text-xs text-gray-500 max-h-32 overflow-y-auto">
          {connectionLog.length === 0 ? (
            <p>No events yet...</p>
          ) : (
            connectionLog.map((log, index) => (
              <p key={index}>{log}</p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}