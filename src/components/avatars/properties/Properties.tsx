import { useEffect, useMemo, useState } from 'react';
import { getAvatarCollection, StyleName, StyleOptions } from '../data';
import {
    Stack,
    Typography,
    Tabs,
    Tab,
    Box,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { formatReadable } from '@/libs/string';
import Property from './Property';

export interface PropertiesProps<T extends StyleName> {
    style: T;
    options: StyleOptions<T>;
    onChange?: (patch: Partial<StyleOptions<T>>) => void;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: string;
    value: string;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`property-tabpanel-${index}`}
            aria-labelledby={`property-tab-${index}`}
            {...other}>
            {value === index && (
                <Box sx={{ p: 1 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function Properties<T extends StyleName>({ style, options, onChange }: PropertiesProps<T>) {
    const collection = useMemo(() => getAvatarCollection(style), [style]);
    const schema = useMemo(() => collection.schema.properties || {}, [collection]);
    const featuresName = useMemo(() => Object.keys(schema), [schema]);
    const [activeTab, setActiveTab] = useState<string>('');
    const [expandedProperties, setExpandedProperties] = useState<Record<string, boolean>>({});

    // Group properties by category
    const propertyCategories = useMemo(() => {
        const categories: Record<string, string[]> = {
            face: [],
            hair: [],
            clothing: [],
            accessories: [],
            colors: [],
            other: []
        };

        featuresName.forEach(name => {
            if (name.includes('color') || name.includes('Color') || name === 'backgroundColor') {
                categories.colors.push(name);
            } else if (name.includes('hair') || name.includes('Hair')) {
                categories.hair.push(name);
            } else if (name.includes('eye') || name.includes('mouth') || name.includes('brow') || name.includes('facial')) {
                categories.face.push(name);
            } else if (name.includes('clothing') || name.includes('shirt') || name.includes('dress') || name.includes('top')) {
                categories.clothing.push(name);
            } else if (name.includes('glass') || name.includes('accessory') || name.includes('hat')) {
                categories.accessories.push(name);
            } else {
                categories.other.push(name);
            }
        });

        // Remove empty categories
        return Object.fromEntries(
            Object.entries(categories).filter(([_, properties]) => properties.length > 0)
        );
    }, [featuresName]);

    const categoryTabs = useMemo(() => Object.keys(propertyCategories), [propertyCategories]);

    useEffect(() => {
        if (activeTab || categoryTabs.length <= 0) return;
        setActiveTab(categoryTabs[0]);
    }, [categoryTabs, activeTab]);

    // Expand first property when tab changes
    useEffect(() => {
        if (activeTab && propertyCategories[activeTab]?.length > 0) {
            const firstProperty = propertyCategories[activeTab][0];
            setExpandedProperties({ [firstProperty]: true });
        }
    }, [activeTab, propertyCategories]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue);
    };

    const handlePropertyExpand = (propertyName: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedProperties(prev => ({
            ...prev,
            [propertyName]: isExpanded
        }));
    };

    return (
        <Stack sx={{ width: '100%' }}>
            {categoryTabs.length > 0 ? (
                <Stack sx={{ width: '100%' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="avatar property tabs"
                        sx={{
                            mb: 1,
                            '& .MuiTab-root': {
                                textTransform: 'capitalize',
                                minHeight: 40,
                            }
                        }}>
                        {categoryTabs.map(category => (
                            <Tab
                                key={category}
                                label={formatReadable(category)}
                                value={category}
                            />
                        ))}
                    </Tabs>

                    {categoryTabs.map(category => (
                        <TabPanel key={category} value={activeTab} index={category}>
                            <Stack spacing={0.5} sx={{ "& > .MuiPaper-root": { background: "transparent" } }}>
                                {propertyCategories[category].map(propertyName => (
                                    <Accordion
                                        key={propertyName}
                                        expanded={expandedProperties[propertyName] || false}
                                        onChange={handlePropertyExpand(propertyName)}
                                        sx={{
                                            '&:before': {
                                                display: 'none'
                                            },
                                            backgroundColor: 'transparent',
                                            backgroundImage: 'none',
                                            boxShadow: 'none',
                                            border: 'none',
                                            '&.Mui-expanded': {
                                                margin: 0,
                                            }
                                        }}>

                                        <AccordionSummary
                                            expandIcon={<ExpandMore />}
                                            aria-controls={`${propertyName}-content`}
                                            id={`${propertyName}-header`}
                                            sx={{
                                                minHeight: 40,
                                                padding: '0 8px',
                                                backgroundColor: 'transparent',
                                                borderRadius: 1,
                                                '&:hover': {
                                                    backgroundColor: 'action.hover',
                                                },
                                                '&.Mui-expanded': {
                                                    minHeight: 40,
                                                    backgroundColor: 'action.selected',
                                                },
                                                '& .MuiAccordionSummary-content': {
                                                    margin: '4px 0',
                                                }
                                            }}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {formatReadable(propertyName)}
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails
                                            sx={{
                                                padding: '8px 8px 16px 8px',
                                                backgroundColor: 'transparent',
                                            }}>
                                            <Property
                                                style={style}
                                                name={propertyName}
                                                property={schema[propertyName] as any}
                                                value={options[propertyName as keyof StyleOptions<T>]}
                                                options={options}
                                                onChange={onChange}
                                            />
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Stack>
                        </TabPanel>
                    ))}
                </Stack>
            ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        No properties available for this style
                    </Typography>
                </Paper>
            )}
        </Stack>
    );
}