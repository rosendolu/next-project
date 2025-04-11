'use client';

import FileUpload from '@/components/FileUpload';
import { Container, Divider, Group, Paper, Stack, Title } from '@mantine/core';
import { FileWithPath } from '@mantine/dropzone';
import Image from 'next/image';
import { useState } from 'react';

const FIELS = [
    {
        path: '/1.jpg',
        name: '1.jpg',
        size: 100,
        type: 'image/jpeg',
    },
];
export default function FilePage() {
    const [files, setFiles] = useState<FileWithPath[]>([]);
    const handleFileSelect = (selectedFiles: FileWithPath[]) => {
        console.log('@@ selected files in page', selectedFiles);
        setFiles(selectedFiles);
    };

    return (
        <Container size="md" py="xl">
            <Stack gap="lg">
                <Title order={2}>File Upload</Title>

                <Paper shadow="sm" p="md" withBorder>
                    <FileUpload onFileSelect={handleFileSelect} />
                </Paper>
            </Stack>
            <Divider h={24} />
            <Group>
                {FIELS.map(file => (
                    <Image key={file.path} src={file.path} alt="file" width={100} height={100} />
                ))}
            </Group>
        </Container>
    );
}
