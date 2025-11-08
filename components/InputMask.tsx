"use client";
import React from "react";
import { IMaskInput } from "react-imask";

type MaskedInputProps = {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ value, onChange, ...props }, ref) => {
    return (
      <IMaskInput
        mask="+91 000-000-0000"
        value={value}
        onAccept={(val: string) => {
          onChange?.({
            target: { value: val },
          } as React.ChangeEvent<HTMLInputElement>);
        }}
        inputRef={ref}
        {...props}
        className={`
          w-full rounded-lg border border-white/20 px-2 py-1 text
          dark:bg-black/80 dark:text-white/50 
          focus:outline-none focus:border-white/40 focus:ring-3 focus:ring-white/20 focus:dark:text-gray-300
          transition-all duration-200
        `}
      />
    );
  }
);

MaskedInput.displayName = "MaskedInput";

export default MaskedInput;
