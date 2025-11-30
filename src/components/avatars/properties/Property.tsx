import { Stack, Typography, Box, Button, Slider, Tooltip, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import GridField from './defaults/GridField';
import { StyleName } from '../data';

export interface AvatarPropertyProps {
    style: StyleName;
    name: string;
    property: any;
    value?: any;
    onChange?: (value: any) => void;
    options: any;
}

const colorPresets = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#2C2C2C', '#FFFFFF', '#A55728', '#3C4F5C', '#FFDBAC'
];

// Color Field Component
const ColorField = ({ value, onChange }: { value?: string[]; onChange?: (value: string[]) => void }) => {
    return (
        <Stack spacing={1}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
                    gap: 1
                }}>
                {colorPresets.map((color) => (
                    <Tooltip key={color} title={color}>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Card
                                sx={{
                                    cursor: 'pointer',
                                    outline: value?.includes(color.replace(/^\#/, '')) ? 3 : 1,
                                    outlineColor: value?.includes(color.replace(/^\#/, '')) ? 'primary.main' : 'grey.300',
                                    boxShadow: value?.includes(color.replace(/^\#/, '')) ? 2 : 0,
                                    p: 0.5
                                }}
                                onClick={() => onChange?.([color.replace(/^\#/, '')])}>
                                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: 32,
                                            borderRadius: 1,
                                            backgroundColor: color,
                                            border: 1,
                                            borderColor: 'grey.400'
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Tooltip>
                ))}
            </Box>
            {value && (
                <Typography variant="caption" color="text.secondary" textAlign="center">
                    Selected: {value}
                </Typography>
            )}
        </Stack>
    );
};

// Number Field Component
const NumberField = ({ value, property, onChange }: { value?: number; property: any; onChange?: (value: number) => void; }) => {
    const { minimum = 0, maximum = 100, default: defaultValue = minimum } = property;

    return (
        <Stack spacing={2}>
            <Slider
                value={value ?? defaultValue}
                onChange={(_, newValue) => onChange?.(newValue as number)}
                min={minimum}
                max={maximum}
                step={1}
                valueLabelDisplay="auto"
                sx={{ color: 'primary.main' }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                    Min: {minimum}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                    {value ?? defaultValue}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Max: {maximum}
                </Typography>
            </Box>
        </Stack>
    );
};

// Boolean Field Component
const BooleanField = ({ value, onChange }: { value?: boolean; onChange?: (value: boolean) => void; }) => {
    return (
        <Stack direction="row" spacing={1}>
            <Button
                variant={value === true ? 'contained' : 'outlined'}
                onClick={() => onChange?.(true)}
                size="small"
                fullWidth>
                Yes
            </Button>
            <Button
                variant={value === false ? 'contained' : 'outlined'}
                onClick={() => onChange?.(false)}
                size="small"
                fullWidth>
                No
            </Button>
        </Stack>
    );
};

export default function Property({ style, name, property, value, onChange, options }: AvatarPropertyProps) {
    const { type, items } = property;

    const handleChange = (value: any) => {
        onChange?.({ [name]: value });
    }

    const renderField = () => {
        // Color field for color properties
        if (name.toLowerCase().includes('color')) {
            return (
                <ColorField
                    value={value}
                    onChange={handleChange}
                />
            );
        }

        // Number field
        if (type === 'number' || type === 'integer') {
            return (
                <NumberField
                    value={value}
                    property={property}
                    onChange={handleChange}
                />
            );
        }

        // Boolean field
        if (type === 'boolean') {
            return (
                <BooleanField
                    value={value}
                    onChange={handleChange}
                />
            );
        }

        // Array field with enum (already handled by GridField)
        if (type === 'array' && items && items.enum) {
            return (
                <GridField
                    options={options}
                    value={value}
                    property={property}
                    name={name as any}
                    style={style}
                    onChange={onChange}
                />
            );
        }

        // Fallback for unsupported types
        return (
            <Typography variant="body2" color="text.secondary">
                Unsupported property type: {type}
            </Typography>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}>
            <Stack spacing={1}>
                {renderField()}
            </Stack>
        </motion.div>
    );
}