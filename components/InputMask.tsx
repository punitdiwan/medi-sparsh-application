"use client";
import React from "react";
import { IMaskInput } from "react-imask";

type MaskedInputProps = {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
};

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ value, onChange, placeholder, disabled = false, readOnly = false, ...props }, ref) => {
    return (
      <IMaskInput
        mask="+91 000-000-0000"
        value={value}
        onAccept={(val: string) => {
          if (!readOnly && !disabled) {
            onChange?.({
              target: { value: val },
            } as React.ChangeEvent<HTMLInputElement>);
          }
        }}
        inputRef={ref}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        {...props}
        className={`
         w-full rounded-md px-2 py-1.5 text-sm
          bg-white text-gray border border-gray-200
          dark:bg-white/5 dark:text-gray-100 dark:border-white/20
          
          focus:outline  focus:outline-offset-0
          focus:ring-3 focus:ring-gray-300
          
          dark:focus:ring-white/20
          transition-all duration-200
          ${disabled || readOnly ? "opacity-60" : ""}
        `}
      />
    );
  }
);

MaskedInput.displayName = "MaskedInput";

export default MaskedInput;
