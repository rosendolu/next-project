import { Box, Text, Title } from '@mantine/core';
import { formatNumberWithCommas } from 'packages/utils/formatter';

export async function getSeverSideProps() {
    const data = await new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(2);
            resolve(1);
        }, 1e4);
    });
    return {
        data,
    };
}

export default function Home({ data }) {
    return (
        <Box>
            <Title order={1}>{data}</Title>
            <Text size="xl">{formatNumberWithCommas('1000100.29')}</Text>
        </Box>
    );
}
