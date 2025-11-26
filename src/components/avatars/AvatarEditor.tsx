import { Stack, Box, Paper, useTheme, useMediaQuery, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { StyleName, StyleOptions } from './data';
import Avatar from './Avatar';
import StyleList from './StyleList';
import Properties from './properties/Properties';
import { Shuffle } from '@mui/icons-material';

export interface AvatarEditorProps {
    children?: ReactNode;
}
export default function AvatarEditor({ }: AvatarEditorProps) {
    const [style, setStyle] = useState<StyleName>("adventurer");
    const [options, setOptions] = useState<StyleOptions<typeof style>>({});
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleChange = useCallback((patch: any) => {
        setOptions(prev => ({ ...prev, ...patch }))
    }, []);

    // Randomize all options
    const handleRandomize = useCallback(() => {
        // This will trigger a re-render with new random options
        setOptions(prev => ({
            ...prev,
            // Add a random seed or any other randomizable properties
            seed: Math.random().toString(36).substring(2, 10)
        }));
    }, []);

    useEffect(() => {
        setOptions({});
    }, [style]);

    return (
        <Stack
            direction={isMobile ? "column" : "row"}
            spacing={3}
            sx={{
                width: '100%',
                // height: isMobile ? 'auto' : '100vh',
                p: 3,
            }}>
            <Stack
                spacing={3}
                sx={{
                    width: isMobile ? '100%' : 350,
                    flexShrink: 0
                }}>
                <Paper
                    elevation={2}
                    sx={{
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: 2,
                        position: 'relative'
                    }}>
                    <Tooltip title="Randomize Avatar">
                        <IconButton
                            onClick={handleRandomize}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'primary.dark',
                                }
                            }}>
                            <Shuffle />
                        </IconButton>
                    </Tooltip>

                    <Typography variant="h6" gutterBottom color="primary">
                        Preview
                    </Typography>
                    <Avatar
                        style={style}
                        options={{ ...options, size: isMobile ? 120 : 180 }}
                    />
                </Paper>

                {/* Style Selection Card */}
                <Paper
                    elevation={2}
                    sx={{
                        p: 3,
                        borderRadius: 2
                    }}>
                    <Typography variant="h6" gutterBottom color="primary">
                        Avatar Style
                    </Typography>
                    <StyleList
                        style={style}
                        onChange={setStyle}
                    />
                </Paper>
            </Stack>

            {/* Right Panel - Properties */}
            <Box
                sx={{
                    flex: 1,
                    minHeight: isMobile ? 500 : 'auto',
                    overflow: 'auto'
                }}>
                <Paper
                    elevation={2}
                    sx={{
                        height: '100%',
                        borderRadius: 2,
                        overflow: 'hidden'
                    }}>
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6" color="primary">
                                Customization
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Adjust the properties to customize your avatar
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={<Shuffle />}
                            onClick={handleRandomize}
                            size="small">
                            Randomize
                        </Button>
                    </Box>
                    <Box sx={{ p: 1 }}>
                        <Properties
                            style={style}
                            options={options}
                            onChange={handleChange}
                        />
                    </Box>
                </Paper>
            </Box>
        </Stack>
    );
}