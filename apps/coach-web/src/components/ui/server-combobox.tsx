/**
 * ServerCombobox - High-level combobox for server-side filtering with infinite scroll.
 *
 * Encapsulates Base UI Combobox with:
 * - `filter={null}` (server-side filtering)
 * - Selected item preservation in items array (prevents deselection on search change)
 * - Infinite scroll via `onEndReached`
 * - Loading/empty state management
 *
 * For client-side filtering, use the low-level `Combobox` from `./combobox` instead.
 */
import { Combobox } from '@base-ui/react/combobox'
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { cn } from '@/lib/utils'

interface ServerComboboxProps<T> {
  /** Available items from server search results */
  items: T[]
  /** Currently selected item - kept in items array to prevent deselection */
  selectedItem: T | null
  /** Called when selection changes */
  onValueChange: (value: T | null) => void
  /** Called on every input keystroke (consumer should debounce for API calls) */
  onSearchChange: (search: string) => void
  /** Called when scroll nears the end of the list */
  onEndReached?: () => void
  /** Pixels from bottom to trigger onEndReached */
  endReachedThreshold?: number
  /** Compare items for equality (required for object values) */
  isItemEqualToValue: (a: T, b: T) => boolean
  /** Convert item to display string */
  itemToStringLabel: (item: T) => string
  /** Extract unique key from item */
  itemToKey: (item: T) => string
  /** Custom item renderer (defaults to itemToStringLabel text) */
  renderItem?: (item: T) => React.ReactNode
  /** Whether data is being fetched */
  loading?: boolean
  /** Message when no items match */
  emptyMessage?: string
  /** Message while loading */
  loadingMessage?: string
  /** Input placeholder */
  placeholder?: string
  /** Whether the combobox is disabled */
  disabled?: boolean
  /** Ref to the input element (for external focus management) */
  inputRef?: React.RefObject<HTMLInputElement | null>
  /** Controlled open state (for inline editing in grids etc.) */
  open?: boolean
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Whether to auto-focus the input on mount */
  autoFocus?: boolean
  /** Whether to show the trigger (chevron) button. Defaults to true. */
  showTrigger?: boolean
  /** Whether to show the clear (X) button. Defaults to true. */
  showClear?: boolean
  className?: string
}

export function ServerCombobox<T>({
  items,
  selectedItem,
  onValueChange,
  onSearchChange,
  onEndReached,
  endReachedThreshold = 200,
  isItemEqualToValue,
  itemToStringLabel,
  itemToKey,
  renderItem,
  loading = false,
  emptyMessage = 'Sin resultados.',
  loadingMessage = 'Buscando...',
  placeholder,
  disabled = false,
  inputRef,
  open,
  onOpenChange,
  autoFocus = false,
  showTrigger = true,
  showClear = true,
  className,
}: ServerComboboxProps<T>) {
  // Merge selected item into items to prevent deselection when search results change
  const mergedItems = useMemo(() => {
    if (!selectedItem) return items
    const alreadyIncluded = items.some((item) => isItemEqualToValue(item, selectedItem))
    if (alreadyIncluded) return items
    return [selectedItem, ...items]
  }, [items, selectedItem, isItemEqualToValue])

  // Infinite scroll handler on the list
  const handleListScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!onEndReached) return
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
      if (scrollHeight - scrollTop - clientHeight < endReachedThreshold) {
        onEndReached()
      }
    },
    [onEndReached, endReachedThreshold],
  )

  return (
    <Combobox.Root
      value={selectedItem}
      onValueChange={onValueChange}
      items={mergedItems}
      filter={null}
      itemToStringLabel={itemToStringLabel}
      isItemEqualToValue={isItemEqualToValue}
      inputRef={inputRef}
      open={open}
      onInputValueChange={(value, { reason }) => {
        // Don't update search when an item is pressed (would search for the label text)
        if (reason !== 'item-press') {
          onSearchChange(value)
        }
      }}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onSearchChange('')
        }
        onOpenChange?.(isOpen)
      }}
    >
      <InputGroup className={cn('w-auto', className)}>
        <Combobox.Input
          render={<InputGroupInput disabled={disabled} autoFocus={autoFocus} />}
          placeholder={placeholder}
        />
        {(showTrigger || showClear) && (
          <InputGroupAddon align="inline-end">
            {showTrigger && (
              <Combobox.Trigger
                data-slot="combobox-trigger"
                render={
                  <InputGroupButton
                    size="icon-xs"
                    variant="ghost"
                    data-slot="input-group-button"
                    className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
                    disabled={disabled}
                  />
                }
              >
                <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
              </Combobox.Trigger>
            )}
            {showClear && (
              <Combobox.Clear
                render={<InputGroupButton variant="ghost" size="icon-xs" />}
                data-slot="combobox-clear"
                disabled={disabled}
              >
                <XIcon className="pointer-events-none" />
              </Combobox.Clear>
            )}
          </InputGroupAddon>
        )}
      </InputGroup>

      <Combobox.Portal>
        <Combobox.Positioner side="bottom" sideOffset={6} align="start" className="isolate z-50">
          <Combobox.Popup
            data-slot="combobox-content"
            className="data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 group/combobox-content relative max-h-96 w-(--anchor-width) min-w-[calc(var(--anchor-width)+--spacing(7))] max-w-(--available-width) origin-(--transform-origin) overflow-hidden rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-closed:animate-out data-open:animate-in"
          >
            <Combobox.List
              data-slot="combobox-list"
              className="max-h-[min(calc(--spacing(96)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto p-1 data-empty:p-0"
              onScroll={onEndReached ? handleListScroll : undefined}
            >
              {mergedItems.map((item) => (
                <Combobox.Item
                  key={itemToKey(item)}
                  value={item}
                  data-slot="combobox-item"
                  className="relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden data-[disabled]:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0"
                >
                  {renderItem ? renderItem(item) : itemToStringLabel(item)}
                  <Combobox.ItemIndicator
                    data-slot="combobox-item-indicator"
                    render={
                      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
                    }
                  >
                    <CheckIcon className="pointer-events-none pointer-coarse:size-5 size-4" />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              ))}
            </Combobox.List>
            <Combobox.Empty data-slot="combobox-empty" className="py-2 text-center text-muted-foreground text-sm">
              {loading ? loadingMessage : emptyMessage}
            </Combobox.Empty>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  )
}
