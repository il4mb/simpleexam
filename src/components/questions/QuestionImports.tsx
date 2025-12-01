import { ArrowDropDown, AttachFileRounded, Close, CheckBoxOutlineBlank, FormatListBulleted } from '@mui/icons-material';
import { Button, Dialog, DialogContent, DialogTitle, IconButton, Box, Typography, CircularProgress, MenuItem, ListItemIcon, ListItemText, Menu } from '@mui/material';
import { useState, useRef, ChangeEvent } from 'react';
import { enqueueSnackbar } from 'notistack';
import * as XLSX from 'xlsx';
import WorkBookMapping, { Field } from '../WorkBookMapping';
import { useQuestions } from '@/contexts/QuestionsProvider';
import { QuestionOption } from '@/types';
import Tooltip from '../Tooltip';

export interface QuestionImportsProps { }
export default function QuestionImports({ }: QuestionImportsProps) {

    const { importQuestions, importOptions } = useQuestions();
    const [workbook, setWorkbook] = useState<XLSX.WorkBook>();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importType, setImportType] = useState<'questions' | 'options'>('questions');
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Menu handlers
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMenuAnchor(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
    };

    const handleImportTypeSelect = (type: 'questions' | 'options') => {
        setImportType(type);
        handleMenuClose();
    };

    const handleFileImport = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const validTypes = ['.xlsx', '.xls', '.csv'];
        const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!validTypes.includes(fileExt)) {
            enqueueSnackbar('Please upload Excel (.xlsx, .xls) or CSV files only', {
                variant: 'error'
            });
            return;
        }

        setIsProcessing(true);

        try {
            const workbook = await parseUploadedFile(file);
            setWorkbook(workbook);
            enqueueSnackbar(`File "${file.name}" loaded successfully`, {
                variant: 'success',
                autoHideDuration: 3000
            });
        } catch (error: any) {
            enqueueSnackbar(`Failed to load file: ${error.message}`, {
                variant: 'error'
            });
            setWorkbook(undefined);
        } finally {
            setIsProcessing(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleClose = () => {
        setWorkbook(undefined);
    };

    const triggerFileInput = () => {
        if (!isProcessing && !isImporting) {
            fileInputRef.current?.click();
        }
    };

    const handleQuestionsResults = async (rows: Record<string, string>[]) => {
        setIsImporting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const results = rows.map((item, order) => {
                const multiple = ["ganda", "multiple", "true"].includes(item.multiple?.toLowerCase());
                const duration = parseInt(item.duration) || 60;

                return {
                    id: item.id,
                    text: item.text,
                    multiple,
                    duration,
                    order
                };
            });

            console.log('Processed questions:', results);
            enqueueSnackbar(`Successfully imported ${results.length} questions`, {
                variant: 'success'
            });

            importQuestions(results);
            handleClose();

        } catch (error: any) {
            enqueueSnackbar(`Error importing questions: ${error.message}`, {
                variant: 'error'
            });
        } finally {
            setIsImporting(false);
        }
    };

    const handleOptionsResults = async (rows: Record<string, string>[]) => {
        setIsImporting(true);

        try {

            await new Promise(resolve => setTimeout(resolve, 1000));
            const flatOptions: Array<Omit<QuestionOption, 'id'> & { qid: string }> = [];
            const questionStats = new Map<string, {
                optionsCount: number;
                correctOptions: number;
                hasExplicitScores: boolean;
            }>();

            for (const item of rows) {
                const qid = item.qid?.trim();
                if (!qid) continue;

                if (!questionStats.has(qid)) {
                    questionStats.set(qid, {
                        optionsCount: 0,
                        correctOptions: 0,
                        hasExplicitScores: false
                    });
                }

                const stats = questionStats.get(qid)!;
                stats.optionsCount++;

                const isCorrect = ["true", "yes", "1", "correct", "benar", "ya"].includes(item.correct?.toLowerCase().trim());
                if (isCorrect) {
                    stats.correctOptions++;
                }

                if (item.score !== undefined && item.score !== '' && !stats.hasExplicitScores) {
                    stats.hasExplicitScores = true;
                }

                flatOptions.push({
                    qid,
                    text: item.text?.trim() || '',
                    correct: isCorrect,
                    score: item.score ? parseFloat(item.score) : undefined
                });
            }

            for (const option of flatOptions) {
                const stats = questionStats.get(option.qid);
                if (!stats) continue;
                if (option.score === undefined) {
                    if (option.correct) {
                        if (stats.correctOptions > 0) {
                            option.score = stats.correctOptions === 1 ? 10 : 10 / stats.correctOptions;
                        } else {
                            option.score = 0;
                        }
                    } else {
                        option.score = 0;
                    }
                }
            }

            try {
                importOptions(flatOptions);
                enqueueSnackbar(`Successfully imported ${flatOptions.length} options`, {
                    variant: 'success'
                });
            } catch (error) {
                enqueueSnackbar(`${flatOptions.length} options failed to import`, {
                    variant: 'warning'
                });
            }

            handleClose();

        } catch (error: any) {
            enqueueSnackbar(`Error importing options: ${error.message}`, {
                variant: 'error'
            });
        } finally {
            setIsImporting(false);
        }
    };

    const handleResults = importType === 'questions' ? handleQuestionsResults : handleOptionsResults;
    const currentFields = importType === 'questions' ? QUIZ_FIELDS : OPTION_FIELDS;
    const dialogTitle = importType === 'questions' ? 'Import Questions' : 'Import Options';
    const buttonText = importType === 'questions' ? 'Questions' : 'Options';

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                disabled={isProcessing || isImporting}
            />

            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <Tooltip title={dialogTitle}>
                    <Button
                        size='small'
                        variant="contained"
                        onClick={triggerFileInput}
                        startIcon={isProcessing ? <CircularProgress size={20} /> : <AttachFileRounded sx={{ rotate: '45deg' }} />}
                        disabled={isProcessing || isImporting}
                        sx={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>
                        {isProcessing ? 'Loading...' : buttonText}
                    </Button>
                </Tooltip>

                <Button
                    variant="contained"
                    size='small'
                    onClick={handleMenuOpen}
                    sx={{
                        minWidth: 'auto',
                        px: 0.4,
                        py: 0.4,
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        '&:hover': { bgcolor: 'primary.dark' }
                    }}
                    disabled={isProcessing || isImporting}>
                    <ArrowDropDown />
                </Button>
            </Box>

            {/* Import Type Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <MenuItem
                    onClick={() => handleImportTypeSelect('questions')}
                    selected={importType === 'questions'}>
                    <ListItemIcon>
                        <FormatListBulleted fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                        primary="Import Questions"
                        secondary="Import question text and settings"
                    />
                </MenuItem>
                <MenuItem
                    onClick={() => handleImportTypeSelect('options')}
                    selected={importType === 'options'}>
                    <ListItemIcon>
                        <CheckBoxOutlineBlank fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                        primary="Import Options"
                        secondary="Import answer options for questions"
                    />
                </MenuItem>
            </Menu>

            {workbook && (
                <Dialog
                    maxWidth="md"
                    onClose={!isImporting ? handleClose : undefined}
                    fullWidth
                    open
                    disableEscapeKeyDown={isImporting}>
                    <DialogTitle>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6" fontWeight={600}>
                                {dialogTitle}
                            </Typography>
                            {!isImporting && (
                                <IconButton
                                    onClick={handleClose}
                                    size="small"
                                    disabled={isImporting}>
                                    <Close />
                                </IconButton>
                            )}
                        </Box>
                    </DialogTitle>

                    <DialogContent>
                        {/* Loading Overlay */}
                        {isImporting && (
                            <Box
                                sx={(theme) => ({
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 10,
                                    borderRadius: 1,
                                    backdropFilter: 'blur(5px)',
                                    ...theme.applyStyles("dark", {
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    })
                                })}>
                                <CircularProgress size={60} sx={{ mb: 3 }} />
                                <Typography variant="h6" gutterBottom>
                                    Processing {importType === 'questions' ? 'Questions' : 'Options'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Please wait while we process your data...
                                </Typography>
                            </Box>
                        )}

                        <WorkBookMapping
                            title={dialogTitle}
                            workbook={workbook}
                            fields={currentFields}
                            onResults={handleResults}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}

const parseUploadedFile = async (file: File): Promise<XLSX.WorkBook> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) {
                    reject(new Error('Failed to read file'));
                    return;
                }

                const workbook = XLSX.read(data, {
                    type: 'array',
                    cellDates: true,
                    cellNF: false,
                    cellText: false
                });

                if (workbook.SheetNames.length === 0) {
                    reject(new Error('No sheets found in file'));
                    return;
                }

                resolve(workbook);
            } catch (error: any) {
                reject(new Error(error.message || 'Error parsing file'));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.onabort = () => reject(new Error('File reading was aborted'));

        reader.readAsArrayBuffer(file);
    });
};

// Fields for importing questions
const QUIZ_FIELDS: Field[] = [
    {
        id: 'id',
        label: 'Question ID',
        required: true,
        description: 'Unique ID each Question',
    },
    {
        id: 'text',
        label: 'Question Text',
        required: true,
        description: 'Main question text',
    },
    {
        id: 'multiple',
        label: 'Question Type',
        required: false,
        description: 'Leave empty for single choice, any value for multiple choice'
    },
    {
        id: 'duration',
        label: 'Duration (seconds)',
        required: false,
        description: 'Time limit for this question, default 60 seconds'
    }
];

// Fields for importing options
const OPTION_FIELDS: Field[] = [
    {
        id: 'qid',
        label: 'Question ID',
        description: 'ID of the question this option belongs to'
    },
    {
        id: 'text',
        label: 'Option Text',
        required: true,
        description: 'The text of the answer option'
    },
    {
        id: 'correct',
        label: 'Is Correct?',
        required: true,
        description: 'true/yes/1/correct/benar for correct options'
    },
    {
        id: 'score',
        label: 'Score (Optional)',
        required: false,
        description: 'Points for this option. If empty, will be calculated automatically'
    }
];