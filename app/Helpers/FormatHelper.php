<?php

namespace App\Helpers;

class FormatHelper
{
    /**
     * Format offline duration with rounding up and conversion to hours/days
     * 
     * @param float|null $minutes The offline duration in minutes
     * @return string Formatted duration string (e.g., "5 minutes", "2 hours", "3 days 2 hours")
     */
    public static function formatOfflineDuration(?float $minutes): string
    {
        if ($minutes === null || $minutes <= 0) {
            return '0 minutes';
        }

        // Round up to the nearest minute
        $roundedMinutes = (int) ceil($minutes);

        // If less than 60 minutes, return in minutes
        if ($roundedMinutes < 60) {
            return $roundedMinutes . ' minute' . ($roundedMinutes !== 1 ? 's' : '');
        }

        // Convert to hours
        $hours = floor($roundedMinutes / 60);
        $remainingMinutes = $roundedMinutes % 60;

        // If less than 24 hours, return in hours (and minutes if any)
        if ($hours < 24) {
            if ($remainingMinutes > 0) {
                return $hours . ' hour' . ($hours !== 1 ? 's' : '') . ' ' . $remainingMinutes . ' minute' . ($remainingMinutes !== 1 ? 's' : '');
            }
            return $hours . ' hour' . ($hours !== 1 ? 's' : '');
        }

        // Convert to days
        $days = floor($hours / 24);
        $remainingHours = $hours % 24;

        if ($remainingHours > 0) {
            return $days . ' day' . ($days !== 1 ? 's' : '') . ' ' . $remainingHours . ' hour' . ($remainingHours !== 1 ? 's' : '');
        }

        return $days . ' day' . ($days !== 1 ? 's' : '');
    }
}

