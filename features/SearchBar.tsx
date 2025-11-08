
"use client"



import { useEffect, useRef } from "react";
import { SearchIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";

export function KbdInputGroup() {
  const inputRef = useRef<HTMLInputElement>(null); 

  
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => { 
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault(); 
        inputRef.current?.focus(); 
      }
    };

    
    window.addEventListener("keydown", handleKeydown);

    
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <InputGroup>
        <InputGroupInput
          ref={inputRef}
          placeholder="Search..."
          className="pl-10"
        />
        <InputGroupAddon>
          <SearchIcon className="h-5 w-5 text-gray-500" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end" className="flex items-center space-x-1">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
