export type Currency = {
  code: string
  label: string
}

export const CURRENCIES: Currency[] = [
  // Más usadas globalmente
  { code: 'USD', label: '🇺🇸 Dólar estadounidense' },
  { code: 'EUR', label: '🇪🇺 Euro' },
  { code: 'GBP', label: '🇬🇧 Libra esterlina' },
  { code: 'CAD', label: '🇨🇦 Dólar canadiense' },
  { code: 'AUD', label: '🇦🇺 Dólar australiano' },
  { code: 'CHF', label: '🇨🇭 Franco suizo' },
  { code: 'JPY', label: '🇯🇵 Yen japonés' },
  { code: 'INR', label: '🇮🇳 Rupia india' },
  // América Latina
  { code: 'MXN', label: '🇲🇽 Peso mexicano' },
  { code: 'BRL', label: '🇧🇷 Real brasileño' },
  { code: 'COP', label: '🇨🇴 Peso colombiano' },
  { code: 'ARS', label: '🇦🇷 Peso argentino' },
  { code: 'CLP', label: '🇨🇱 Peso chileno' },
  { code: 'PEN', label: '🇵🇪 Sol peruano' },
  { code: 'UYU', label: '🇺🇾 Peso uruguayo' },
  { code: 'BOB', label: '🇧🇴 Boliviano' },
  { code: 'PYG', label: '🇵🇾 Guaraní paraguayo' },
  { code: 'VES', label: '🇻🇪 Bolívar venezolano' },
  { code: 'DOP', label: '🇩🇴 Peso dominicano' },
  { code: 'CRC', label: '🇨🇷 Colón costarricense' },
  { code: 'GTQ', label: '🇬🇹 Quetzal guatemalteco' },
  { code: 'HNL', label: '🇭🇳 Lempira hondureño' },
  { code: 'NIO', label: '🇳🇮 Córdoba nicaragüense' },
  { code: 'PAB', label: '🇵🇦 Balboa panameño' },
  { code: 'CUP', label: '🇨🇺 Peso cubano' },
]
