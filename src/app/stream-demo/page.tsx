'use client';

import { useState } from 'react';

export default function StreamDemo() {
    const [results, setResults] = useState<{ [key: string]: string[] }>({
        basic: [],
        generator: [],
        transform: [],
        async: [],
    });

    // 基础流式传输测试
    const testBasicStream = async () => {
        const response = await fetch('/api/stream-demo');
        const reader = response.body?.getReader();
        if (!reader) return;

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = new TextDecoder().decode(value);
                setResults(prev => ({
                    ...prev,
                    basic: [...prev.basic, text],
                }));
            }
        } finally {
            reader.releaseLock();
        }
    };

    // Async Generator 流测试
    const testGeneratorStream = async () => {
        const response = await fetch('/api/stream-demo', { method: 'POST' });
        const reader = response.body?.getReader();
        if (!reader) return;

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = new TextDecoder().decode(value);
                setResults(prev => ({
                    ...prev,
                    generator: [...prev.generator, text],
                }));
            }
        } finally {
            reader.releaseLock();
        }
    };

    // TransformStream 测试
    const testTransformStream = async () => {
        const response = await fetch('/api/stream-demo', { method: 'PUT' });
        const reader = response.body?.getReader();
        if (!reader) return;

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = new TextDecoder().decode(value);
                setResults(prev => ({
                    ...prev,
                    transform: [...prev.transform, text],
                }));
            }
        } finally {
            reader.releaseLock();
        }
    };

    // Async/Await 流测试
    const testAsyncStream = async () => {
        const response = await fetch('/api/stream-demo', { method: 'PATCH' });
        const reader = response.body?.getReader();
        if (!reader) return;

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = new TextDecoder().decode(value);
                setResults(prev => ({
                    ...prev,
                    async: [...prev.async, text],
                }));
            }
        } finally {
            reader.releaseLock();
        }
    };

    return (
        <div className="p-4 space-y-8">
            <h1 className="text-2xl font-bold mb-4">ReadableStream Demo</h1>

            {/* 基础流式传输 */}
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Basic Stream</h2>
                <button
                    onClick={testBasicStream}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Test Basic Stream
                </button>
                <pre className="bg-gray-100 p-4 rounded">{results.basic.join('')}</pre>
            </div>

            {/* Async Generator 流 */}
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Generator Stream</h2>
                <button
                    onClick={testGeneratorStream}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Test Generator Stream
                </button>
                <pre className="bg-gray-100 p-4 rounded">{results.generator.join('')}</pre>
            </div>

            {/* TransformStream */}
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Transform Stream</h2>
                <button
                    onClick={testTransformStream}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
                    Test Transform Stream
                </button>
                <pre className="bg-gray-100 p-4 rounded">{results.transform.join('')}</pre>
            </div>

            {/* Async/Await 流 */}
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Async Stream</h2>
                <button
                    onClick={testAsyncStream}
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
                    Test Async Stream
                </button>
                <pre className="bg-gray-100 p-4 rounded">{results.async.join('')}</pre>
            </div>
        </div>
    );
}
