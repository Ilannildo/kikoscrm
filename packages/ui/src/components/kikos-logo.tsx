export function KikosLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-base', md: 'text-lg', lg: 'text-2xl' }
  const crmSizes = { sm: 'text-[8px]', md: 'text-[9px]', lg: 'text-[11px]' }
  return (
    <div className="flex items-end gap-0.5">
      <span className={`font-black tracking-tight text-white ${sizes[size]}`}>K</span>
      <span className={`font-black tracking-tight text-primary ${sizes[size]}`} style={{ margin: '0 -1px' }}>|</span>
      <span className={`font-black tracking-tight text-white ${sizes[size]}`}>KOS</span>
      <span className={`font-bold text-primary ml-1 tracking-widest ${crmSizes[size]}`} style={{ marginBottom: '1px' }}>CRM</span>
    </div>
  )
}