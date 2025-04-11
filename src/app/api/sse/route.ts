import { NextResponse } from 'next/server';

export async function GET() {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(controller) {
            let count = 0;

            // Send initial retry configuration
            controller.enqueue(encoder.encode('retry: 3000\n\n'));

            const interval = setInterval(() => {
                const data = {
                    message: `Server time: ${new Date().toISOString()}`,
                    count: count++,
                };

                // Send event with ID
                controller.enqueue(encoder.encode(`id: ${count}\n`));
                controller.enqueue(encoder.encode(`event: update\n`));
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                // controller.enqueue(encoder.encode(`data: xxx\n`));
            }, 3000);

            // Clean up on client disconnect
            return () => clearInterval(interval);
        },
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        },
    });
}
