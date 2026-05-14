package com.ruralworkforce.marketplace.util;

/**
 * Haversine formula — calculates great-circle distance between two lat/lng points.
 */
public class HaversineUtil {

    private static final double EARTH_RADIUS_KM = 6371.0;

    public static double distanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    /** Round to 1 decimal place */
    public static double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
