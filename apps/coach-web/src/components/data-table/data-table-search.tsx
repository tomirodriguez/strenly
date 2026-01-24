import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'

type DataTableSearchProps = {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function DataTableSearch({ value, onValueChange, placeholder = 'Buscar...' }: DataTableSearchProps) {
  const [inputValue, setInputValue] = useState(value)
  const debouncedValue = useDebounce(inputValue, 300)

  useEffect(() => {
    if (debouncedValue !== value) {
      onValueChange(debouncedValue)
    }
  }, [debouncedValue, onValueChange, value])

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleClear = () => {
    setInputValue('')
    onValueChange('')
  }

  return (
    <div className="relative w-full max-w-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="pr-9 pl-9"
      />
      {inputValue && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-1">
          <Button variant="ghost" size="icon-xs" onClick={handleClear} className="h-7 w-7">
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}
