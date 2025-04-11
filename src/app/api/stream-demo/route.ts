import { NextResponse } from 'next/server';

// 1. 基础流式传输
export async function GET(request: Request) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(controller) {
            // 发送初始数据
            controller.enqueue(encoder.encode('Starting stream...\n'));

            // 模拟数据流
            let count = 0;
            const interval = setInterval(() => {
                if (count >= 5) {
                    clearInterval(interval);
                    controller.close();
                    return;
                }
                controller.enqueue(encoder.encode(`Data chunk ${count++}\n`));
            }, 1000);
        },
        cancel() {
            // 清理资源
            console.log('Stream cancelled');
        },
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        },
    });

// 2. 使用 async generator 创建流
export async function POST() {
    const encoder = new TextEncoder();

    async function* generateData() {
        for (let i = 0; i < 5; i++) {
            yield `Generated data ${i}\n`;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    const stream = ReadableStream.from(generateData()).pipeThrough(
        new TransformStream({
            transform(chunk, controller) {
                controller.enqueue(encoder.encode(chunk));
            },
        })
    );

    return new NextResponse(stream);
}

// 3. 使用 TransformStream 处理数据
export async function PUT() {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // 创建转换流
    const transformStream = new TransformStream({
        transform(chunk, controller) {
            // 将数据转换为大写
            const text = decoder.decode(chunk);
            const upperText = text.toUpperCase();
            controller.enqueue(encoder.encode(upperText));
        },
    });

    // 创建源流
    const sourceStream = new ReadableStream({
        start(controller) {
            const data = ['hello', 'world', 'stream'];
            data.forEach(word => {
                controller.enqueue(encoder.encode(word + '\n'));
            });
            controller.close();
        },
    });

    // 连接流
    const stream = sourceStream.pipeThrough(transformStream);
    return new NextResponse(stream);
}

// 4. 使用 async/await 处理流
export async function PATCH() {
    const encoder = new TextEncoder();

    async function processStream() {
        const stream = new ReadableStream({
            async start(controller) {
                for (let i = 0; i < 3; i++) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    controller.enqueue(encoder.encode(`Processed data ${i}\n`));
                }
                controller.close();
            },
        });

        return stream;
    }

    const stream = await processStream();
    return new NextResponse(stream);
}
