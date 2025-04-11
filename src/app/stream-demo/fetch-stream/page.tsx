'use client';

import { useEffect, useState } from 'react';

interface StreamData {
    message: string;
    count: number;
}

export default function FetchStreamDemo() {
    const [data, setData] = useState<StreamData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const abortController = new AbortController();

        const connectStream = async () => {
            try {
                setIsConnected(true);
                const response = await fetch('/api/sse', {
                    signal: abortController.signal,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                if (!response.body) {
                    throw new Error('ReadableStream not supported');
                }
                // const data = await response.text();
                // console.log('@@ data:', data);

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                        console.log('Stream complete');
                        break;
                    }

                    // 解码新的数据块并添加到缓冲区
                    buffer += decoder.decode(value, { stream: true });

                    // 处理缓冲区中的完整消息
                    const lines = buffer.split('\n\n');
                    buffer = lines.pop() || ''; // 保留最后一个不完整的块

                    for (const line of lines) {
                        if (line.trim() === '') continue;

                        // 解析 SSE 消息
                        const eventData: { [key: string]: string } = {};
                        line.split('\n').forEach(part => {
                            const [key, ...value] = part.split(':');
                            if (key && value.length) {
                                eventData[key.trim()] = value.join(':').trim();
                            }
                        });

                        // 处理数据
                        if (eventData.data) {
                            try {
                                const parsedData = JSON.parse(eventData.data);
                                setData(parsedData);
                                console.log('Received data:', parsedData);
                            } catch (e) {
                                console.error('Failed to parse data:', e);
                            }
                        }
                    }
                }
            } catch (err) {
                if (err instanceof Error) {
                    if (err.name === 'AbortError') {
                        console.log('Fetch aborted');
                    } else {
                        setError(err.message);
                        console.error('Stream error:', err);
                    }
                }
            } finally {
                setIsConnected(false);
            }
        };

        connectStream();

        // 清理函数
        return () => {
            abortController.abort();
        };
    }, []);

    return (
        <div className="p-4 space-y-4">
            <h1 className="text-2xl font-bold mb-4">Fetch Stream Demo</h1>

            <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>

            {error && <div className="text-red-500 p-4 bg-red-50 rounded">Error: {error}</div>}

            {data && (
                <div className="space-y-2 p-4 bg-gray-50 rounded">
                    <h2 className="text-lg font-semibold">Latest Data:</h2>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
