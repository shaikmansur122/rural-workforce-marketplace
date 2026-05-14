package com.ruralworkforce.marketplace.util;

import java.time.LocalTime;
import java.time.format.DateTimeParseException;

public class TimeSlotUtil {

    /**
     * Returns true iff the two time intervals overlap (exclusive endpoints).
     * Two slots sharing only an endpoint are NOT considered overlapping.
     *
     * @param slotA time slot in "HH:mm-HH:mm" format
     * @param slotB time slot in "HH:mm-HH:mm" format
     * @return true if the intervals overlap
     * @throws IllegalArgumentException if either slot is null or malformed
     */
    public static boolean overlaps(String slotA, String slotB) {
        LocalTime[] a = parse(slotA);
        LocalTime[] b = parse(slotB);
        // Overlap condition: NOT (endA <= startB OR endB <= startA)
        return !(a[1].compareTo(b[0]) <= 0 || b[1].compareTo(a[0]) <= 0);
    }

    private static LocalTime[] parse(String slot) {
        if (slot == null) {
            throw new IllegalArgumentException("Time slot must not be null");
        }
        String[] parts = slot.split("-", 2);
        if (parts.length != 2) {
            throw new IllegalArgumentException("Invalid time slot format: " + slot);
        }
        try {
            LocalTime start = LocalTime.parse(parts[0]);
            LocalTime end = LocalTime.parse(parts[1]);
            return new LocalTime[]{start, end};
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid time slot format: " + slot, e);
        }
    }
}
