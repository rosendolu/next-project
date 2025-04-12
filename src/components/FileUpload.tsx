import { Group, Paper, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDownload, IconUpload, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

interface FileUploadProps {
    onFilesChange: (files: File[]) => void;
    pasteContainer?: HTMLElement;
}

export default function FileUpload({ onFilesChange, pasteContainer }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle window paste event
    useEffect(() => {
        const handleWindowPaste = async (e: ClipboardEvent) => {
            console.log('@@ handling window paste', e);
            const target = e.target as Node;
            if (pasteContainer && !pasteContainer.contains(target)) {
                return;
            }
            if (e.clipboardData?.files.length) {
                handleFiles(Array.from(e.clipboardData.files));
            }
        };

        window.addEventListener('paste', handleWindowPaste);
        return () => {
            window.removeEventListener('paste', handleWindowPaste);
        };
    }, []);

    const validateFiles = (files: File[]) => {
        console.log('@@ validating files', files);
        const validFiles: File[] = [];
        const invalidFiles: { name: string; reason: string }[] = [];

        files.forEach(file => {
            const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
            const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);

            if (!isImage && !isVideo) {
                invalidFiles.push({ name: file.name, reason: 'unsupported file type' });
                return;
            }

            const isImageSizeValid = isImage && file.size <= MAX_IMAGE_SIZE;
            const isVideoSizeValid = isVideo && file.size <= MAX_VIDEO_SIZE;

            if (!isImageSizeValid && !isVideoSizeValid) {
                invalidFiles.push({ name: file.name, reason: 'file too large' });
                return;
            }

            validFiles.push(file);
        });

        if (invalidFiles.length > 0) {
            notifications.show({
                title: 'Invalid files',
                withBorder: true,
                withCloseButton: true,
                message: (
                    <Stack gap="xs">
                        {invalidFiles.map((file, index) => (
                            <Text key={index} size="sm">
                                {file.name}: {file.reason}
                            </Text>
                        ))}
                    </Stack>
                ),
                color: 'red',
            });
        }

        return validFiles;
    };

    const handleFiles = useCallback(
        (files: File[]) => {
            const validFiles = validateFiles(files);
            if (validFiles.length > 0) {
                setSelectedFiles(prev => [...prev, ...validFiles]);
                onFilesChange(validFiles);
            }
        },
        [onFilesChange]
    );

    const handleDragEnter = (e: React.DragEvent) => {
        console.log('@@ handling drag enter', e);
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        console.log('@@ handling drag leave', e);
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const getFileNameFromUrl = (url: string): string => {
        console.log('@@ getting filename from url', url);
        try {
            // Parse the URL
            const urlObj = new URL(url);

            // Check if it's a Next.js image URL
            //  "http://localhost:3000/_next/image?url=%2F1.jpg&w=2“
            if (urlObj.pathname.includes('/_next/image')) {
                // Get the original image path from the 'url' query parameter
                const originalPath = urlObj.searchParams.get('url');
                if (originalPath) {
                    // Decode the URL-encoded path and get the last segment
                    const decodedPath = decodeURIComponent(originalPath);
                    return decodedPath.split('/').pop() || 'image.jpg';
                }
            }

            // For direct image URLs, just get the last segment of the pathname
            const fileName = urlObj.pathname.split('/').pop();
            return fileName || 'image.jpg';
        } catch (error) {
            console.error('@@ Error parsing URL:', error);
            return 'image.jpg';
        }
    };
    const handleDrop = async (e: React.DragEvent) => {
        console.log('@@ handling drop', e);
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const items = Array.from(e.dataTransfer.items);
        const files: File[] = [];

        // Handle both direct file drops and URL/HTML drops
        for (const item of items) {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) files.push(file);
            } else if (item.type === 'text/uri-list') {
                try {
                    const url = await new Promise<string>(resolve => item.getAsString(resolve));
                    console.log('@@ handling uri-list', url);
                    const response = await fetch(url);
                    const blob = await response.blob();
                    const fileName = getFileNameFromUrl(url);
                    files.push(new File([blob], fileName, { type: blob.type }));
                } catch (error) {
                    console.error('@@ Error handling uri-list:', error);
                }
            }
        }

        if (files.length > 0) {
            handleFiles(files);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        console.log('@@ handling paste', e);
        const files = e.clipboardData.files;
        if (files.length > 0) {
            handleFiles(Array.from(files));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('@@ handling input change', e);
        if (e.target.files) {
            handleFiles(Array.from(e.target.files));
        }
        // Reset input value to allow selecting the same file again
        e.target.value = '';
    };

    const removeFile = (index: number) => {
        console.log('@@ removing file', index);
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <Stack gap="md">
            <Paper
                withBorder
                p="xl"
                style={{
                    border: isDragging
                        ? '2px dashed var(--mantine-color-blue-6)'
                        : '2px dashed var(--mantine-color-gray-4)',
                    backgroundColor: isDragging ? 'var(--mantine-color-blue-0)' : 'transparent',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}>
                <input
                    ref={inputRef}
                    type="file"
                    accept={[...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(',')}
                    multiple
                    onChange={handleInputChange}
                    style={{ display: 'none' }}
                />

                <Group justify="center" gap="xl">
                    {isDragging ? (
                        <IconDownload size={50} stroke={1.5} style={{ color: 'var(--mantine-color-blue-6)' }} />
                    ) : (
                        <IconUpload size={50} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)' }} />
                    )}
                </Group>

                <Text ta="center" mt="md">
                    Paste or Drag files here or click to select files
                </Text>
                <Text ta="center" size="sm" c="dimmed">
                    Images up to 5MB, Videos up to 100MB
                </Text>
            </Paper>

            {selectedFiles.length > 0 && (
                <Paper withBorder p="md">
                    <Stack gap="xs">
                        {selectedFiles.map((file, index) => (
                            <Group key={index} justify="space-between" wrap="nowrap">
                                <Text size="sm" truncate>
                                    {file.name} - {(file.size / 1024 / 1024).toFixed(2)}MB
                                </Text>
                                <IconX
                                    size={16}
                                    style={{ cursor: 'pointer', color: 'var(--mantine-color-red-6)' }}
                                    onClick={() => removeFile(index)}
                                />
                            </Group>
                        ))}
                    </Stack>
                </Paper>
            )}
        </Stack>
    );
}
