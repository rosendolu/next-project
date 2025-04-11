import { Alert, Center } from '@mantine/core';
import Link from 'next/link';

export default function NotFound() {
    return (
        <Center w="100vw" h="100vh">
            <Alert variant="light" title={'404 Not Found'}>
                <Link type="link" href={'/'}>
                    Go Back To Home
                </Link>
            </Alert>
        </Center>
    );
}
