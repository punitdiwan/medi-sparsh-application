"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAbility } from "@/components/providers/AbilityProvider";

type PermissionButtonProps = {
  action: string;
  subject: string;
  tooltip?: string;
} & React.ComponentProps<typeof Button>;

export function PermissionButton({
  action,
  subject,
  tooltip = "You don’t have permission",
  disabled,
  ...props
}: PermissionButtonProps) {
  const ability = useAbility();
  const allowed = ability.can(action, subject);

  const isDisabled = disabled || !allowed;

  // Disabled button tooltip workaround
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block">
            <Button
              {...props}
              disabled={isDisabled}
              className={!allowed ? "cursor-not-allowed opacity-60" : ""}
            />
          </span>
        </TooltipTrigger>

        {!allowed && (
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

// how to use
{/* <PermissionButton
                      action="delete"
                      subject="ChargesUnit"
                      size="sm"
                      variant="destructive"
                      tooltip="You don't have permission to delete"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </PermissionButton> */}