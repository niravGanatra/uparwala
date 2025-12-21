import React from 'react';

export const Switch = ({ checked, onCheckedChange, id, label, disabled = false }) => {
    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                role="switch"
                id={id}
                aria-checked={checked}
                aria-label={label}
                disabled={disabled}
                onClick={() => !disabled && onCheckedChange(!checked)}
                className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                    ${checked ? 'bg-orange-600' : 'bg-slate-200'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <span
                    aria-hidden="true"
                    className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                        transition duration-200 ease-in-out
                        ${checked ? 'translate-x-5' : 'translate-x-0'}
                    `}
                />
            </button>
            {label && (
                <label
                    htmlFor={id}
                    className={`text-sm font-medium text-slate-700 select-none ${!disabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    onClick={() => !disabled && onCheckedChange(!checked)}
                >
                    {label}
                </label>
            )}
        </div>
    );
};
