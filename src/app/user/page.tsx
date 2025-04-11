'use client';

import { Box, Text } from '@mantine/core';
import { useEffect } from 'react';

export default function Home() {
    useEffect(() => {
        setTimeout(() => {
            throw new Error('xxxxx');
        }, 3e3);
    }, []);
    console.log(a.b);
    return (
        <Box>
            <Text size="xl">{'2024 100'}</Text>
            {new Date('232sxx').toLocaleDateString()}
        </Box>
    );
}
