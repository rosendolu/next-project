import { Center, Loader } from '@mantine/core';

export default function Loading() {
    return (
        <Center style={{ position: 'relative' }}>
            <Loader variant="dots" size={'xl'}></Loader>
        </Center>
    );
}
