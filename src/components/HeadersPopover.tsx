import type React from "react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import * as Popover from "@radix-ui/react-popover";
import { Button, Input } from "@cortexapps/react-plugin-ui";
import { Trash } from "@phosphor-icons/react";

interface HeaderItem {
  id: string;
  headerKey: string;
  headerValue: string;
}

interface HeadersPopoverProps {
  headers: Record<string, string>;
  onSubmit: (headers: Record<string, string>) => void;
}

const HeadersPopover: React.FC<HeadersPopoverProps> = ({
  headers,
  onSubmit,
}) => {
  const headersPropItems: HeaderItem[] = Object.entries(headers).map(
    ([headerKey, headerValue]) => ({
      id: uuidv4(),
      headerKey,
      headerValue,
    })
  );
  const [headerItems, setHeaderItems] =
    useState<HeaderItem[]>(headersPropItems);

  const updateHeaders = (items: HeaderItem[]): void => {
    const newHeaders: Record<string, string> = {};
    items.forEach((item) => {
      if (item.headerKey) {
        newHeaders[item.headerKey] = item.headerValue;
      }
    });
    onSubmit(newHeaders);
  };

  const handleHeaderKeyChange = (id: string, newKey: string): void => {
    setHeaderItems((prev) => {
      const newItems = prev.map((item) =>
        item.id === id ? { ...item, headerKey: newKey } : item
      );
      updateHeaders(newItems);
      return newItems;
    });
  };

  const handleHeaderValueChange = (id: string, newValue: string): void => {
    setHeaderItems((prev) => {
      const newItems = prev.map((item) =>
        item.id === id ? { ...item, headerValue: newValue } : item
      );
      updateHeaders(newItems);
      return newItems;
    });
  };

  const addHeader = (): void => {
    const newItem: HeaderItem = {
      id: uuidv4(),
      headerKey: `header-${headerItems.length}`,
      headerValue: "",
    };
    setHeaderItems((prev) => {
      const newItems = [...prev, newItem];
      updateHeaders(newItems);
      return newItems;
    });
  };

  const removeHeader = (id: string): void => {
    setHeaderItems((prev) => {
      const newItems = prev.filter((item) => item.id !== id);
      updateHeaders(newItems);
      return newItems;
    });
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button
          variant="link"
          className="inline-flex items-center"
          style={{ margin: "auto" }}
        >
          Headers ({headerItems.length})
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={5}
          className="p-4 border border-[var(--cortex-plugin-border)] rounded-md shadow-lg bg-[var(--cortex-plugin-foreground)] w-full max-w-md"
        >
          {headerItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-row flex-nowrap gap-2 items-center mb-2"
            >
              <Input
                id={`header-key-${item.id}`}
                name={`header-key-${item.id}`}
                placeholder="Header key"
                value={item.headerKey}
                onChange={(e) => {
                  handleHeaderKeyChange(item.id, e.target.value);
                }}
                className="w-full sm:w-1/2"
              />
              <Input
                id={`header-value-${item.id}`}
                name={`header-value-${item.id}`}
                placeholder="Header value"
                value={item.headerValue}
                onChange={(e) => {
                  handleHeaderValueChange(item.id, e.target.value);
                }}
                className="w-full sm:w-1/2"
              />
              <Button
                variant="destructive"
                onClick={() => {
                  removeHeader(item.id);
                }}
              >
                <Trash size={16} weight="bold" />
              </Button>
            </div>
          ))}
          <div className="flex flex-row gap-2">
            <Button variant="link" onClick={addHeader}>
              Add Header
            </Button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default HeadersPopover;
