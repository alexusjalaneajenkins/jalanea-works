// Schedule Analysis Service
// Analyzes work/class schedules to find optimal free windows for job applications

export interface WorkShift {
    day: string;        // "monday", "tuesday", etc.
    startTime: string;  // "09:00"
    endTime: string;    // "17:00"
}

export interface ClassBlock {
    className: string;
    days: string[];       // ["monday", "wednesday"]
    startTime: string;
    endTime: string;
}

export interface WorkSchedule {
    jobName?: string;
    shifts: WorkShift[];
}

export interface ScheduleBlock {
    id: string;
    startTime: string;
    endTime: string;
    title: string;
    categoryId: string;
}

export type WindowType = 'before_work' | 'lunch_break' | 'between_classes' | 'after_work' | 'evening' | 'morning';

export interface FreeWindow {
    id: string;
    day: string;           // "monday", "tuesday", etc.
    dayLabel: string;      // "Monday", "Tuesday", etc.
    startTime: string;     // "14:30"
    endTime: string;       // "16:00"
    durationMinutes: number;
    type: WindowType;
    label: string;         // "After ENC 1101"
    description: string;   // "Perfect for quick applications"
    icon: string;          // Emoji icon
    isBestWindow: boolean; // Highlight as recommended
    suitabilityScore: number; // 0-100 score for ranking
}

// Day order for sorting
const DAY_ORDER: Record<string, number> = {
    'monday': 0,
    'tuesday': 1,
    'wednesday': 2,
    'thursday': 3,
    'friday': 4,
    'saturday': 5,
    'sunday': 6
};

const DAY_LABELS: Record<string, string> = {
    'monday': 'Monday',
    'tuesday': 'Tuesday',
    'wednesday': 'Wednesday',
    'thursday': 'Thursday',
    'friday': 'Friday',
    'saturday': 'Saturday',
    'sunday': 'Sunday'
};

// Convert time string to minutes since midnight
const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

// Convert minutes since midnight to time string
const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Format time for display (12-hour format)
const formatTimeDisplay = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Determine window type based on time and context
const determineWindowType = (
    startMinutes: number,
    endMinutes: number,
    prevBlockType?: string,
    nextBlockType?: string
): WindowType => {
    const startHour = startMinutes / 60;
    const endHour = endMinutes / 60;

    // Before work (morning, ending before 10am)
    if (endHour <= 10 && nextBlockType === 'work') {
        return 'before_work';
    }

    // Lunch break (between 11am and 2pm)
    if (startHour >= 11 && endHour <= 14) {
        return 'lunch_break';
    }

    // Between classes
    if (prevBlockType === 'learning' && nextBlockType === 'learning') {
        return 'between_classes';
    }

    // After work (evening, starting after 5pm)
    if (startHour >= 17 && prevBlockType === 'work') {
        return 'after_work';
    }

    // Evening (after 6pm)
    if (startHour >= 18) {
        return 'evening';
    }

    // Morning (before noon)
    if (startHour < 12) {
        return 'morning';
    }

    return 'after_work';
};

// Get icon for window type
const getWindowIcon = (type: WindowType): string => {
    switch (type) {
        case 'before_work': return '☀️';
        case 'lunch_break': return '🥪';
        case 'between_classes': return '📚';
        case 'after_work': return '🌙';
        case 'evening': return '🌙';
        case 'morning': return '☀️';
        default: return '⏰';
    }
};

// Get description for window type
const getWindowDescription = (type: WindowType, durationMinutes: number): string => {
    if (durationMinutes >= 90) {
        return 'Great for focused job search';
    }
    if (durationMinutes >= 60) {
        return 'Good for 2-3 quality applications';
    }
    if (durationMinutes >= 45) {
        return 'Perfect for quick applications';
    }
    return 'Squeeze in one application';
};

// Calculate suitability score (0-100)
const calculateSuitabilityScore = (
    durationMinutes: number,
    type: WindowType,
    startMinutes: number
): number => {
    let score = 0;

    // Duration score (up to 40 points)
    if (durationMinutes >= 120) score += 40;
    else if (durationMinutes >= 90) score += 35;
    else if (durationMinutes >= 60) score += 30;
    else if (durationMinutes >= 45) score += 20;
    else score += 10;

    // Time of day score (up to 30 points)
    const hour = startMinutes / 60;
    if (hour >= 9 && hour <= 11) score += 30; // Late morning is ideal
    else if (hour >= 14 && hour <= 17) score += 25; // Afternoon is good
    else if (hour >= 18 && hour <= 20) score += 20; // Early evening is okay
    else if (hour >= 7 && hour <= 9) score += 15; // Early morning
    else score += 10;

    // Type score (up to 30 points)
    switch (type) {
        case 'after_work': score += 30; break;
        case 'before_work': score += 25; break;
        case 'lunch_break': score += 20; break;
        case 'between_classes': score += 15; break;
        case 'evening': score += 25; break;
        case 'morning': score += 20; break;
    }

    return Math.min(100, score);
};

// Main analysis function
export const analyzeFreeWindows = (
    workSchedule: WorkSchedule | undefined,
    classSchedule: ClassBlock[] | undefined,
    existingBlocks: ScheduleBlock[] = []
): FreeWindow[] => {
    const freeWindows: FreeWindow[] = [];
    const ANALYSIS_START = 7 * 60;  // 7:00 AM
    const ANALYSIS_END = 22 * 60;   // 10:00 PM
    const MIN_WINDOW_DURATION = 30; // 30 minutes minimum

    const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    allDays.forEach(day => {
        // Collect all busy blocks for this day
        const busyBlocks: Array<{
            start: number;
            end: number;
            type: string;
            title: string;
        }> = [];

        // Add work shifts
        if (workSchedule?.shifts) {
            workSchedule.shifts
                .filter(shift => shift.day.toLowerCase() === day)
                .forEach(shift => {
                    busyBlocks.push({
                        start: timeToMinutes(shift.startTime),
                        end: timeToMinutes(shift.endTime),
                        type: 'work',
                        title: workSchedule.jobName || 'Work'
                    });
                });
        }

        // Add classes
        if (classSchedule) {
            classSchedule
                .filter(cls => cls.days.map(d => d.toLowerCase()).includes(day))
                .forEach(cls => {
                    busyBlocks.push({
                        start: timeToMinutes(cls.startTime),
                        end: timeToMinutes(cls.endTime),
                        type: 'learning',
                        title: cls.className
                    });
                });
        }

        // Add existing schedule blocks (if they have a day property matching)
        // Note: This would need the date to be extracted - for now we skip existing blocks
        // as they're typically created from this same system

        // Sort by start time
        busyBlocks.sort((a, b) => a.start - b.start);

        // Find gaps between busy blocks
        let currentTime = ANALYSIS_START;

        busyBlocks.forEach((block, index) => {
            const gapStart = currentTime;
            const gapEnd = block.start;
            const gapDuration = gapEnd - gapStart;

            if (gapDuration >= MIN_WINDOW_DURATION) {
                const prevBlock = index > 0 ? busyBlocks[index - 1] : null;
                const windowType = determineWindowType(
                    gapStart,
                    gapEnd,
                    prevBlock?.type,
                    block.type
                );

                // Create label based on context
                let label = '';
                if (prevBlock?.type === 'learning') {
                    label = `After ${prevBlock.title}`;
                } else if (block.type === 'work') {
                    label = 'Before work';
                } else if (prevBlock?.type === 'work') {
                    label = 'After work';
                } else {
                    label = `${formatTimeDisplay(minutesToTime(gapStart))} - ${formatTimeDisplay(minutesToTime(gapEnd))}`;
                }

                const suitabilityScore = calculateSuitabilityScore(gapDuration, windowType, gapStart);

                freeWindows.push({
                    id: `${day}-${gapStart}-${gapEnd}`,
                    day,
                    dayLabel: DAY_LABELS[day],
                    startTime: minutesToTime(gapStart),
                    endTime: minutesToTime(gapEnd),
                    durationMinutes: gapDuration,
                    type: windowType,
                    label,
                    description: getWindowDescription(windowType, gapDuration),
                    icon: getWindowIcon(windowType),
                    isBestWindow: false,
                    suitabilityScore
                });
            }

            currentTime = Math.max(currentTime, block.end);
        });

        // Check gap after last block until end of day
        const lastBlock = busyBlocks[busyBlocks.length - 1];
        if (lastBlock) {
            const gapStart = lastBlock.end;
            const gapEnd = ANALYSIS_END;
            const gapDuration = gapEnd - gapStart;

            if (gapDuration >= MIN_WINDOW_DURATION) {
                const windowType = determineWindowType(gapStart, gapEnd, lastBlock.type, undefined);
                const suitabilityScore = calculateSuitabilityScore(gapDuration, windowType, gapStart);

                let label = '';
                if (lastBlock.type === 'work') {
                    label = 'After shift ends';
                } else if (lastBlock.type === 'learning') {
                    label = `After ${lastBlock.title}`;
                } else {
                    label = 'Evening free time';
                }

                freeWindows.push({
                    id: `${day}-${gapStart}-${gapEnd}`,
                    day,
                    dayLabel: DAY_LABELS[day],
                    startTime: minutesToTime(gapStart),
                    endTime: minutesToTime(gapEnd),
                    durationMinutes: gapDuration,
                    type: windowType,
                    label,
                    description: getWindowDescription(windowType, gapDuration),
                    icon: getWindowIcon(windowType),
                    isBestWindow: false,
                    suitabilityScore
                });
            }
        } else {
            // No busy blocks this day - entire day is free
            // Add morning and evening windows
            const morningEnd = 12 * 60;
            const afternoonStart = 12 * 60;
            const eveningStart = 17 * 60;

            // Morning window
            freeWindows.push({
                id: `${day}-morning`,
                day,
                dayLabel: DAY_LABELS[day],
                startTime: minutesToTime(ANALYSIS_START),
                endTime: minutesToTime(morningEnd),
                durationMinutes: morningEnd - ANALYSIS_START,
                type: 'morning',
                label: 'Morning free',
                description: 'Great for focused job search',
                icon: '☀️',
                isBestWindow: false,
                suitabilityScore: calculateSuitabilityScore(morningEnd - ANALYSIS_START, 'morning', ANALYSIS_START)
            });

            // Evening window
            freeWindows.push({
                id: `${day}-evening`,
                day,
                dayLabel: DAY_LABELS[day],
                startTime: minutesToTime(eveningStart),
                endTime: minutesToTime(ANALYSIS_END),
                durationMinutes: ANALYSIS_END - eveningStart,
                type: 'evening',
                label: 'Evening free',
                description: 'Great for focused job search',
                icon: '🌙',
                isBestWindow: false,
                suitabilityScore: calculateSuitabilityScore(ANALYSIS_END - eveningStart, 'evening', eveningStart)
            });
        }
    });

    // Sort by day order, then by suitability score
    freeWindows.sort((a, b) => {
        const dayDiff = DAY_ORDER[a.day] - DAY_ORDER[b.day];
        if (dayDiff !== 0) return dayDiff;
        return b.suitabilityScore - a.suitabilityScore;
    });

    // Mark best window (highest suitability score with at least 60 min)
    const bestWindow = freeWindows
        .filter(w => w.durationMinutes >= 60)
        .sort((a, b) => b.suitabilityScore - a.suitabilityScore)[0];

    if (bestWindow) {
        const index = freeWindows.findIndex(w => w.id === bestWindow.id);
        if (index >= 0) {
            freeWindows[index].isBestWindow = true;
        }
    }

    return freeWindows;
};

// Get windows grouped by day
export const getWindowsByDay = (windows: FreeWindow[]): Record<string, FreeWindow[]> => {
    const grouped: Record<string, FreeWindow[]> = {};

    windows.forEach(window => {
        if (!grouped[window.day]) {
            grouped[window.day] = [];
        }
        grouped[window.day].push(window);
    });

    // Sort within each day by start time
    Object.keys(grouped).forEach(day => {
        grouped[day].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    });

    return grouped;
};

// Get the best Power Hour recommendation
export const getBestPowerHourSlot = (windows: FreeWindow[]): FreeWindow | null => {
    const suitable = windows
        .filter(w => w.durationMinutes >= 60)
        .sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    return suitable[0] || null;
};

// Format duration for display
export const formatDuration = (minutes: number): string => {
    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (mins === 0) {
            return `${hours} hour${hours > 1 ? 's' : ''}`;
        }
        return `${hours}h ${mins}min`;
    }
    return `${minutes} min`;
};

// Get total free time across all windows
export const getTotalFreeTime = (windows: FreeWindow[]): number => {
    return windows.reduce((total, window) => total + window.durationMinutes, 0);
};

// Count windows suitable for Power Hour (60+ minutes)
export const countPowerHourSlots = (windows: FreeWindow[]): number => {
    return windows.filter(w => w.durationMinutes >= 60).length;
};
