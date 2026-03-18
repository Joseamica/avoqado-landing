import * as React from 'react'
import { Command } from 'cmdk'
import { Search, Monitor, ShoppingBag, BookOpen, ExternalLink, ArrowRight, X } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function GlobalSearch() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    const openSearch = () => {
        setOpen(true)
    }

    document.addEventListener('keydown', down)
    document.addEventListener('open-global-search', openSearch)
    
    return () => {
      document.removeEventListener('keydown', down)
      document.removeEventListener('open-global-search', openSearch)
    }
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[500] flex items-start justify-center pt-[20vh] px-4">
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={() => setOpen(false)}
      />
      
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <Command label="Global Search" className="flex flex-col w-full">
          <div className="flex items-center border-b border-zinc-800 px-4">
            <Search className="mr-2 h-5 w-5 shrink-0 text-zinc-400" />
            <Command.Input 
              placeholder="Buscar en Avoqado..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-zinc-500 text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button 
                onClick={() => setOpen(false)}
                className="ml-2 p-1 rounded-md hover:bg-zinc-800 text-zinc-500"
            >
                <X className="h-4 w-4" />
            </button>
          </div>
          
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm text-zinc-500">
              No se encontraron resultados.
            </Command.Empty>

            <Command.Group heading="Productos" className="text-zinc-400 px-2 py-1.5 text-xs font-semibold">
              <Item icon={Monitor} onSelect={() => runCommand(() => window.location.href = '/productos/hardware')}>
                Hardware y Terminales
              </Item>
              <Item icon={ShoppingBag} onSelect={() => runCommand(() => window.location.href = '/productos/pagos')}>
                Pagos en Línea
              </Item>
            </Command.Group>

            <Command.Group heading="Industrias" className="text-zinc-400 px-2 py-1.5 text-xs font-semibold mt-2">
              <Item icon={ArrowRight} onSelect={() => runCommand(() => window.location.href = '/restaurants')}>
                Restaurantes
              </Item>
              <Item icon={ArrowRight} onSelect={() => runCommand(() => window.location.href = '/retail')}>
                Retail y Tiendas
              </Item>
              <Item icon={ArrowRight} onSelect={() => runCommand(() => window.location.href = '/services')}>
                Servicios Profesionales
              </Item>
            </Command.Group>

            <Command.Group heading="Recursos" className="text-zinc-400 px-2 py-1.5 text-xs font-semibold mt-2">
              <Item icon={BookOpen} onSelect={() => runCommand(() => window.location.href = '/docs')}>
                Documentación
              </Item>
              <Item icon={ExternalLink} onSelect={() => runCommand(() => window.location.href = 'https://dashboard.avoqado.io')}>
                Ir al Dashboard
              </Item>
            </Command.Group>
          </Command.List>
          
          <div className="border-t border-zinc-800 px-4 py-2 flex justify-between items-center bg-zinc-900/50">
             <span className="text-xs text-zinc-500">
                Navegar <kbd className="font-sans bg-zinc-800 px-1 rounded text-[10px] mx-1">↑</kbd> <kbd className="font-sans bg-zinc-800 px-1 rounded text-[10px] mx-1">↓</kbd>
             </span>
             <span className="text-xs text-zinc-500">
                Seleccionar <kbd className="font-sans bg-zinc-800 px-1 rounded text-[10px] ml-1">↵</kbd>
             </span>
          </div>
        </Command>
      </div>
    </div>
  )
}

function Item({ 
  children, 
  icon: Icon, 
  onSelect,
  className
}: { 
  children: React.ReactNode
  icon?: React.ElementType
  onSelect: () => void
  className?: string
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md px-2 py-3 text-sm outline-none data-[selected='true']:bg-zinc-800 data-[selected='true']:text-white text-zinc-300 transition-colors",
        className
      )}
    >
      {Icon && <Icon className="mr-2 h-4 w-4 text-zinc-500 data-[selected='true']:text-white" />}
      <span>{children}</span>
    </Command.Item>
  )
}
