'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';

interface EditableTimeProps {
  /** The Date value to display/edit */
  value: Date;
  /** Called when the user commits a valid new time */
  onChange: (newDate: Date) => void;
  /** Whether the field is disabled (e.g. "Running..." for end time) */
  disabled?: boolean;
  /** Placeholder shown when disabled */
  placeholder?: string;
  /** Extra CSS classes for the wrapper */
  className?: string;
}

/** Format a Date as HH:MM:SS (24h) */
function formatHMS(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/** Parse a time string (HH:MM:SS or HH:MM) into hours, minutes, seconds.
 *  Returns null if invalid. */
function parseTimeString(str: string): { h: number; m: number; s: number } | null {
  const trimmed = str.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const s = match[3] ? parseInt(match[3], 10) : 0;
  if (h > 23 || m > 59 || s > 59) return null;
  return { h, m, s };
}

/**
 * Compact inline time editor.
 * - Click to open a flatpickr time dropdown (H / M / S inputs, no spinners).
 * - Or type directly into the inline field and press Enter or blur to commit.
 */
export const EditableTime: React.FC<EditableTimeProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = '--:--:--',
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const fpRef = useRef<flatpickr.Instance | null>(null);
  const [displayValue, setDisplayValue] = useState(formatHMS(value));
  const [isEditing, setIsEditing] = useState(false);

  // Stable refs so flatpickr callbacks always see the latest values
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  /** Try to commit a typed value; returns true if valid */
  const commitTypedValue = useCallback((text: string) => {
    const parsed = parseTimeString(text);
    if (parsed) {
      const updated = new Date(valueRef.current);
      updated.setHours(parsed.h, parsed.m, parsed.s, 0);
      onChangeRef.current(updated);
      return true;
    }
    return false;
  }, []);

  const initPicker = useCallback(() => {
    if (!inputRef.current || disabled) return;

    fpRef.current = flatpickr(inputRef.current, {
      enableTime: true,
      noCalendar: true,
      dateFormat: 'H:i:S',
      time_24hr: true,
      enableSeconds: true,
      defaultDate: valueRef.current,
      minuteIncrement: 1,
      allowInput: true,
      // Append to body (default) so the dropdown is not clipped by
      // overflow:auto on parent scroll containers (e.g. the sidebar).
      // We reposition on open to keep it within the viewport.
      onOpen(_selectedDates, _dateStr, instance) {
        const cal = instance.calendarContainer;
        // Let the browser lay it out first, then clamp to viewport
        requestAnimationFrame(() => {
          const rect = cal.getBoundingClientRect();
          if (rect.left < 0) {
            cal.style.left = `${parseInt(cal.style.left || '0', 10) - rect.left + 4}px`;
          }
          if (rect.right > window.innerWidth) {
            cal.style.left = `${parseInt(cal.style.left || '0', 10) - (rect.right - window.innerWidth) - 4}px`;
          }
        });
      },
      onChange: (selectedDates) => {
        if (selectedDates.length > 0) {
          // Preserve the original date, only update time components
          const picked = selectedDates[0];
          const updated = new Date(valueRef.current);
          updated.setHours(picked.getHours(), picked.getMinutes(), picked.getSeconds(), 0);
          onChangeRef.current(updated);
        }
      },
      onClose() {
        // When the picker closes, sync the display back to the current value
        setIsEditing(false);
      },
    });
  }, [disabled]);

  useEffect(() => {
    initPicker();
    return () => {
      if (fpRef.current) {
        fpRef.current.destroy();
        fpRef.current = null;
      }
    };
  }, [initPicker]);

  // Sync the displayed value when the prop changes externally
  useEffect(() => {
    if (fpRef.current) {
      fpRef.current.setDate(value, false);
    }
    if (!isEditing) {
      setDisplayValue(formatHMS(value));
    }
  }, [value, isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const valid = commitTypedValue(displayValue);
      if (!valid) {
        // Revert to current value
        setDisplayValue(formatHMS(valueRef.current));
      }
      setIsEditing(false);
      fpRef.current?.close();
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setDisplayValue(formatHMS(valueRef.current));
      setIsEditing(false);
      fpRef.current?.close();
      inputRef.current?.blur();
    }
  };

  const handleBlur = () => {
    if (isEditing) {
      const valid = commitTypedValue(displayValue);
      if (!valid) {
        setDisplayValue(formatHMS(valueRef.current));
      }
      setIsEditing(false);
    }
  };

  if (disabled) {
    return (
      <span className={`font-mono text-xs cursor-default ${className}`}>
        {placeholder}
      </span>
    );
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <input
        ref={inputRef}
        value={displayValue}
        onChange={(e) => {
          setIsEditing(true);
          setDisplayValue(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => setIsEditing(true)}
        className="font-mono text-xs bg-transparent border-none outline-none cursor-pointer w-[4.5rem] py-0 px-0.5 rounded text-inherit hover:bg-white/60 dark:hover:bg-white/10 focus:bg-white/80 dark:focus:bg-white/15 focus:cursor-text transition-colors"
      />
    </div>
  );
};
