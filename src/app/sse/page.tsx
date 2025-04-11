'use client';

import { useEffect, useState } from 'react';

interface SSEData {
    message: string;
    count: number;
}

export default function SSEPage() {
    const [data, setData] = useState<SSEData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lastEventId, setLastEventId] = useState<string | null>(null);

    useEffect(() => {
        const eventSource = new EventSource('/api/sse', {
            withCredentials: true,
        });

        // Handle custom event
        eventSource.addEventListener('update', event => {
            console.log('@@ Event ID:', event.lastEventId, event.type, event.data);
            setLastEventId(event.lastEventId);

            try {
                const parsedData = JSON.parse(event.data);
                setData(parsedData);
            } catch {
                setError('Failed to parse SSE data');
            }
        });

        eventSource.onerror = error => {
            console.error('SSE Error:', error);
            setError('SSE connection error');
            eventSource.close();
        };

        // Cleanup on component unmount
        return () => {
            eventSource.close();
        };
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Server-Sent Events Demo</h1>

            {error && <div className="text-red-500 mb-4">Error: {error}</div>}

            {lastEventId && <div className="text-sm text-gray-500 mb-2">Last Event ID: {lastEventId}</div>}

            {data && (
                <div className="space-y-2">
                    <p>Message: {data.message}</p>
                    <p>Count: {data.count}</p>
                </div>
            )}
        </div>
    );
}
