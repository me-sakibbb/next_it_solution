import React, { useEffect, useRef, useState } from 'react';
import { cn } from "@/lib/utils";

interface EditableProps {
    value: string;
    onChange: (value: string) => void;
    isEditing: boolean;
    className?: string;
    multiline?: boolean;
    placeholder?: string;
}

export const Editable: React.FC<EditableProps> = ({
    value,
    onChange,
    isEditing,
    className,
    multiline = false,
    placeholder = "Click to edit"
}) => {
    const [localValue, setLocalValue] = useState(value);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        if (multiline && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [localValue, multiline, isEditing]);

    if (!isEditing) {
        return <span className={cn("whitespace-pre-wrap", className)}>{value || placeholder}</span>;
    }

    const editStyles = "w-full bg-blue-50/50 border border-dashed border-blue-300 rounded px-1 -mx-1 hover:bg-blue-50 transition-colors focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

    if (multiline) {
        return (
            <textarea
                ref={textareaRef}
                value={localValue ?? ''}
                onChange={(e) => {
                    setLocalValue(e.target.value);
                    onChange(e.target.value);
                }}
                className={cn(
                    editStyles,
                    "resize-none align-top overflow-hidden",
                    className
                )}
                placeholder={placeholder}
                rows={1}
            />
        );
    }

    return (
        <input
            type="text"
            value={localValue ?? ''}
            onChange={(e) => {
                setLocalValue(e.target.value);
                onChange(e.target.value);
            }}
            className={cn(
                editStyles,
                className
            )}
            placeholder={placeholder}
        />
    );
};
