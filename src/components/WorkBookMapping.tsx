import { MenuItem, Stack, TextField, Typography, Paper, Box, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, useMediaQuery, useTheme } from '@mui/material';
import { useMemo, useState, useEffect } from 'react';
import { WorkBook, utils } from 'xlsx';
import { TableChart, ArrowBack, CheckCircle, Error } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import { MotionBox } from './motion';

export type Field = {
    id: string;
    label: string;
    required?: boolean;
    description?: string;
}

export type ColumnMapping = {
    fieldId: string;
    columnIndex: number;
    columnName: string;
}

export type ProcessedData = Record<string, any>[];

export interface WorkBookProps {
    title?: string;
    workbook: WorkBook;
    onResults: (processedData: ProcessedData, mappings: ColumnMapping[], sheetName: string) => void;
    fields: Field[];
}

export default function WorkBookMapping({ title = "Mapping Spreadsheet", workbook, onResults, fields }: WorkBookProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const sheetsName = useMemo(() => workbook.SheetNames, [workbook]);

    // State
    const [selectedSheet, setSelectedSheet] = useState<string>(sheetsName[0]);
    const [sheetData, setSheetData] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [mappings, setMappings] = useState<ColumnMapping[]>([]);
    const [currentStep, setCurrentStep] = useState<'mapping' | 'overview'>('mapping');

    // Load sheet data when sheet changes
    useEffect(() => {
        if (!selectedSheet || !workbook.Sheets[selectedSheet]) return;

        try {
            const worksheet = workbook.Sheets[selectedSheet];
            const jsonData = utils.sheet_to_json(worksheet, {
                header: 1,
                defval: '',
                raw: false
            }) as any;

            if (jsonData.length > 0) {
                const headers = jsonData[0]?.map((cell: any) => String(cell || '').trim());
                setColumns(headers);
                setSheetData(jsonData);

                // Reset mappings when sheet changes
                setMappings([]);
                setCurrentStep('mapping');
            }
        } catch (error) {
            console.error('Error parsing sheet:', error);
            enqueueSnackbar('Error parsing sheet data', { variant: 'error' });
        }
    }, [selectedSheet, workbook]);

    // Auto-map columns on initial load
    useEffect(() => {
        if (columns.length > 0 && mappings.length === 0) {
            const autoMappings: ColumnMapping[] = [];

            columns.forEach((columnName, columnIndex) => {
                const columnNameLower = columnName.toLowerCase().trim();

                for (const field of fields) {
                    const fieldNameLower = field.id.toLowerCase();
                    const fieldLabelLower = field.label.toLowerCase();

                    if (columnNameLower.includes(fieldNameLower) ||
                        columnNameLower.includes(fieldLabelLower) ||
                        fieldNameLower.includes(columnNameLower)) {

                        if (!autoMappings.some(m => m.fieldId === field.id)) {
                            autoMappings.push({
                                fieldId: field.id,
                                columnIndex,
                                columnName
                            });
                        }
                        break;
                    }
                }
            });

            if (autoMappings.length > 0) {
                setMappings(autoMappings);
            }
        }
    }, [columns, fields]);

    // Process data using mappings
    const processData = useMemo(() => {
        if (sheetData.length < 2 || mappings.length === 0) return [];

        const processed: ProcessedData = [];

        // Start from row 1 to skip header row
        for (let i = 1; i < sheetData.length; i++) {
            const row = sheetData[i];
            const processedRow: Record<string, any> = {};

            // Map each field to its column value
            for (const mapping of mappings) {
                const value = row[mapping.columnIndex];
                // Convert empty strings to null for consistency
                processedRow[mapping.fieldId] = value === '' ? null : value;
            }

            // Only add row if it has at least one non-null value
            if (Object.values(processedRow).some(val => val !== null)) {
                processed.push(processedRow);
            }
        }

        return processed;
    }, [sheetData, mappings]);

    // Handle mapping changes
    const handleMappingChange = (fieldId: string, columnIndex: number) => {
        setMappings(prev => {
            const filtered = prev.filter(m => m.fieldId !== fieldId);

            if (columnIndex >= 0) {
                const columnName = columns[columnIndex] || `Column ${columnIndex + 1}`;
                filtered.push({ fieldId, columnIndex, columnName });
            }

            return filtered;
        });
    };

    // Get column options
    const getColumnOptions = () => {
        return [
            { value: -1, label: 'Not mapped' },
            ...columns.map((col, index) => ({
                value: index,
                label: isMobile ? `Col ${index + 1}` : `${col} (Column ${index + 1})`
            }))
        ];
    };

    // Check if all required fields are mapped
    const isFullyMapped = () => {
        const requiredFields = fields.filter(f => f.required);
        const mappedRequiredFields = mappings.filter(m =>
            requiredFields.some(f => f.id === m.fieldId)
        );
        return mappedRequiredFields.length >= requiredFields.length;
    };

    // Get preview of processed data
    const getProcessedPreview = () => {
        return processData.slice(0, 3); // Show first 3 processed rows
    };

    // Calculate mapping stats
    const mappingStats = {
        totalRows: Math.max(0, sheetData.length - 1),
        processedRows: processData.length,
        totalColumns: columns.length,
        mappedFields: mappings.length,
        requiredFields: fields.filter(f => f.required).length,
        mappedRequiredFields: mappings.filter(m =>
            fields.some(f => f.id === m.fieldId && f.required)
        ).length
    };

    // Handle finish button
    const handleFinish = () => {
        if (processData.length === 0) {
            enqueueSnackbar('No data to process', { variant: 'warning' });
            return;
        }

        onResults(processData, mappings, selectedSheet);
    };

    // Render Mapping Step
    const renderMappingStep = () => (
        <Stack spacing={3}>
            <Typography variant="h6" fontWeight={600}>
                Map Columns
            </Typography>

            {/* Sheet Selection */}
            <TextField
                select
                label="Select Sheet"
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
                fullWidth
                size={isMobile ? "small" : "medium"}>
                {sheetsName.map(name => (
                    <MenuItem key={name} value={name}>
                        {isMobile ? name.substring(0, 20) + (name.length > 20 ? '...' : '') : name}
                    </MenuItem>
                ))}
            </TextField>

            {/* Sheet Info */}
            <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                    <Stack direction={isMobile ? "column" : "row"} spacing={isMobile ? 1 : 3}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Rows
                            </Typography>
                            <Typography variant="h6" fontWeight={600}>
                                {mappingStats.totalRows}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Columns
                            </Typography>
                            <Typography variant="h6" fontWeight={600}>
                                {mappingStats.totalColumns}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Mapped
                            </Typography>
                            <Typography variant="h6" fontWeight={600}
                                color={isFullyMapped() ? "success.main" : "warning.main"}>
                                {mappingStats.mappedRequiredFields}/{mappingStats.requiredFields}
                            </Typography>
                        </Box>
                    </Stack>
                </Stack>
            </Paper>

            {/* Mapping Fields */}
            <Stack spacing={2}>
                {fields.map((field) => {
                    const mapping = mappings.find(m => m.fieldId === field.id);
                    const columnOptions = getColumnOptions();

                    return (
                        <Box key={field.id}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                                <Typography variant="body2" fontWeight={500}>
                                    {field.label}
                                    {field.required && (
                                        <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                                            *
                                        </Typography>
                                    )}
                                </Typography>
                                {mapping && (
                                    <Chip
                                        label={isMobile ? `Col ${mapping.columnIndex + 1}` : mapping.columnName}
                                        size="small"
                                        color="primary"
                                    />
                                )}
                            </Stack>
                            <TextField
                                select
                                size="small"
                                fullWidth
                                value={mapping?.columnIndex ?? -1}
                                onChange={(e) => handleMappingChange(field.id, parseInt(e.target.value))}
                            >
                                {columnOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            {field.description && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    {field.description}
                                </Typography>
                            )}
                        </Box>
                    );
                })}
            </Stack>

            {/* Action Button */}
            <Button
                variant="contained"
                onClick={() => setCurrentStep('overview')}
                disabled={!isFullyMapped()}
                fullWidth={isMobile}
            >
                Continue to Overview
            </Button>
        </Stack>
    );

    // Render Overview Step
    const renderOverviewStep = () => {
        const processedPreview = processData.slice(0, 1); // Show only 1 row
        const remainingRows = Math.max(0, processData.length - 1);

        return (
            <Stack spacing={3}>
                <Typography variant="h6" fontWeight={600}>
                    Import Overview
                </Typography>

                {/* Summary */}
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" fontWeight={600}>
                                Ready to Import
                            </Typography>
                            <Chip
                                label={`${mappingStats.processedRows} rows`}
                                size="small"
                                color="success"
                                icon={<CheckCircle fontSize="small" />}
                            />
                        </Stack>

                        <Stack spacing={1}>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2">Sheet:</Typography>
                                <Typography variant="body2" fontWeight={500}>{selectedSheet}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2">Rows to import:</Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {mappingStats.processedRows}
                                </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2">Mapped fields:</Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {mappingStats.mappedFields}/{fields.length}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                </Paper>

                {/* Processed Data Preview */}
                {processedPreview.length > 0 && (
                    <Box sx={{ position: 'relative' }}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Data Preview
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Showing 1 of {mappingStats.processedRows} rows
                                </Typography>
                            </Stack>

                            <Stack spacing={2}>
                                {processedPreview.map((row, rowIndex) => (
                                    <Paper
                                        key={rowIndex}
                                        variant="outlined"
                                        sx={{
                                            p: 1.5,
                                            position: 'relative',
                                            zIndex: 1
                                        }}>
                                        <Typography variant="caption" color="text.secondary" gutterBottom>
                                            Item Preview
                                        </Typography>
                                        <Stack spacing={0.5}>
                                            {Object.entries(row).map(([fieldId, value]) => {
                                                const field = fields.find(f => f.id === fieldId);
                                                return (
                                                    <Stack key={fieldId} direction="row" justifyContent="space-between">
                                                        <Typography variant="caption" fontWeight={500}>
                                                            {field?.label || fieldId}:
                                                        </Typography>
                                                        <Typography variant="caption">
                                                            {value !== null ? String(value) : '(empty)'}
                                                        </Typography>
                                                    </Stack>
                                                );
                                            })}
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>

                            {/* Overlay for remaining rows */}
                            {remainingRows > 0 && (
                                <Stack justifyContent={"center"} alignItems={"center"} mt={1}>
                                    <Typography variant="body2" color="text.secondary">
                                        {remainingRows} more row{remainingRows !== 1 ? 's' : ''} to import
                                    </Typography>
                                </Stack>
                            )}
                        </Paper>
                    </Box>
                )}

                {/* Action Buttons */}
                <Stack direction={isMobile ? "column" : "row"} spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={() => setCurrentStep('mapping')}
                        fullWidth={isMobile}>
                        Back to Mapping
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleFinish}
                        fullWidth={isMobile}
                        disabled={processData.length === 0}>
                        Finish Import ({mappingStats.processedRows} rows)
                    </Button>
                </Stack>
            </Stack>
        );
    };
    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}>
            <Stack spacing={3}>
                {/* Header */}
                <Stack direction="row" alignItems="center" spacing={2}>
                    <TableChart color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                        {title}
                    </Typography>
                    <Chip
                        label={`Step ${currentStep === 'mapping' ? '1' : '2'}/2`}
                        size="small"
                        color="primary"
                    />
                </Stack>

                {/* Content */}
                {currentStep === 'mapping' ? renderMappingStep() : renderOverviewStep()}
            </Stack>
        </MotionBox>
    );
}