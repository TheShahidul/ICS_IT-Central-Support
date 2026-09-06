import { Laptop, Monitor, Printer, Router, Smartphone, SquareStack, Usb } from 'lucide-react'

const icons = {
  Laptop,
  Desktop: Laptop,
  Monitor,
  Printer,
  Router,
  Switch: SquareStack,
  'Mobile Device': Smartphone,
  Other: Usb,
}

export default function AssetIcon({ type, size = 18 }) {
  const Icon = icons[type] || Usb
  return <Icon size={size} aria-hidden="true" />
}
