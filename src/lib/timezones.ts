export type Timezone = {
  value: string  // ID IANA: "America/Bogota"
  label: string  // Nombre legible: "Bogotá, Lima, Quito"
  offset: string // Offset UTC estándar: "UTC-05:00"
  region: string // Agrupación: "América", "Europa", etc.
}

export const TIMEZONES: Timezone[] = [
  // América del Norte
  { value: 'America/New_York',               label: 'Nueva York, Miami',            offset: 'UTC-05:00', region: 'América del Norte' },
  { value: 'America/Chicago',                label: 'Chicago',                      offset: 'UTC-06:00', region: 'América del Norte' },
  { value: 'America/Denver',                 label: 'Denver, Phoenix',              offset: 'UTC-07:00', region: 'América del Norte' },
  { value: 'America/Los_Angeles',            label: 'Los Ángeles, Seattle',         offset: 'UTC-08:00', region: 'América del Norte' },
  { value: 'America/Anchorage',              label: 'Alaska',                       offset: 'UTC-09:00', region: 'América del Norte' },
  { value: 'Pacific/Honolulu',               label: 'Hawái',                        offset: 'UTC-10:00', region: 'América del Norte' },
  { value: 'America/Toronto',                label: 'Toronto, Ottawa',              offset: 'UTC-05:00', region: 'América del Norte' },
  { value: 'America/Vancouver',              label: 'Vancouver',                    offset: 'UTC-08:00', region: 'América del Norte' },
  { value: 'America/Mexico_City',            label: 'Ciudad de México, Monterrey',  offset: 'UTC-06:00', region: 'América del Norte' },
  // América Central y Caribe
  { value: 'America/Guatemala',              label: 'Guatemala',                    offset: 'UTC-06:00', region: 'América Central' },
  { value: 'America/Tegucigalpa',            label: 'Tegucigalpa',                  offset: 'UTC-06:00', region: 'América Central' },
  { value: 'America/El_Salvador',            label: 'San Salvador',                 offset: 'UTC-06:00', region: 'América Central' },
  { value: 'America/Managua',                label: 'Managua',                      offset: 'UTC-06:00', region: 'América Central' },
  { value: 'America/Costa_Rica',             label: 'San José',                     offset: 'UTC-06:00', region: 'América Central' },
  { value: 'America/Panama',                 label: 'Ciudad de Panamá',             offset: 'UTC-05:00', region: 'América Central' },
  { value: 'America/Havana',                 label: 'La Habana',                    offset: 'UTC-05:00', region: 'América Central' },
  { value: 'America/Santo_Domingo',          label: 'Santo Domingo',                offset: 'UTC-04:00', region: 'América Central' },
  { value: 'America/Puerto_Rico',            label: 'San Juan, Puerto Rico',        offset: 'UTC-04:00', region: 'América Central' },
  // América del Sur
  { value: 'America/Bogota',                 label: 'Bogotá',                       offset: 'UTC-05:00', region: 'América del Sur' },
  { value: 'America/Lima',                   label: 'Lima',                         offset: 'UTC-05:00', region: 'América del Sur' },
  { value: 'America/Guayaquil',              label: 'Quito, Guayaquil',             offset: 'UTC-05:00', region: 'América del Sur' },
  { value: 'America/Caracas',               label: 'Caracas',                      offset: 'UTC-04:00', region: 'América del Sur' },
  { value: 'America/La_Paz',                label: 'La Paz, Cochabamba',           offset: 'UTC-04:00', region: 'América del Sur' },
  { value: 'America/Asuncion',              label: 'Asunción',                     offset: 'UTC-04:00', region: 'América del Sur' },
  { value: 'America/Santiago',              label: 'Santiago de Chile',            offset: 'UTC-03:00', region: 'América del Sur' },
  { value: 'America/Argentina/Buenos_Aires',label: 'Buenos Aires, Córdoba',        offset: 'UTC-03:00', region: 'América del Sur' },
  { value: 'America/Sao_Paulo',             label: 'São Paulo, Brasília, Río',     offset: 'UTC-03:00', region: 'América del Sur' },
  { value: 'America/Montevideo',            label: 'Montevideo',                   offset: 'UTC-03:00', region: 'América del Sur' },
  // Europa
  { value: 'Europe/Lisbon',                 label: 'Lisboa',                       offset: 'UTC+00:00', region: 'Europa' },
  { value: 'Europe/London',                 label: 'Londres, Dublín',              offset: 'UTC+00:00', region: 'Europa' },
  { value: 'Europe/Madrid',                 label: 'Madrid, Barcelona',            offset: 'UTC+01:00', region: 'Europa' },
  { value: 'Europe/Paris',                  label: 'París, Bruselas',              offset: 'UTC+01:00', region: 'Europa' },
  { value: 'Europe/Berlin',                 label: 'Berlín, Frankfurt',            offset: 'UTC+01:00', region: 'Europa' },
  { value: 'Europe/Rome',                   label: 'Roma, Milán',                  offset: 'UTC+01:00', region: 'Europa' },
  { value: 'Europe/Amsterdam',              label: 'Ámsterdam',                    offset: 'UTC+01:00', region: 'Europa' },
  { value: 'Europe/Zurich',                 label: 'Zúrich, Ginebra',             offset: 'UTC+01:00', region: 'Europa' },
  { value: 'Europe/Warsaw',                 label: 'Varsovia',                     offset: 'UTC+01:00', region: 'Europa' },
  { value: 'Europe/Helsinki',               label: 'Helsinki',                     offset: 'UTC+02:00', region: 'Europa' },
  { value: 'Europe/Athens',                 label: 'Atenas',                       offset: 'UTC+02:00', region: 'Europa' },
  { value: 'Europe/Bucharest',              label: 'Bucarest',                     offset: 'UTC+02:00', region: 'Europa' },
  { value: 'Europe/Istanbul',               label: 'Estambul',                     offset: 'UTC+03:00', region: 'Europa' },
  { value: 'Europe/Moscow',                 label: 'Moscú',                        offset: 'UTC+03:00', region: 'Europa' },
  // África
  { value: 'Africa/Lagos',                  label: 'Lagos, Accra, Dakar',          offset: 'UTC+01:00', region: 'África' },
  { value: 'Africa/Cairo',                  label: 'El Cairo',                     offset: 'UTC+02:00', region: 'África' },
  { value: 'Africa/Johannesburg',           label: 'Johannesburgo, Ciudad del Cabo',offset: 'UTC+02:00', region: 'África' },
  { value: 'Africa/Nairobi',                label: 'Nairobi, Addis Abeba',         offset: 'UTC+03:00', region: 'África' },
  // Asia
  { value: 'Asia/Dubai',                    label: 'Dubái, Abu Dabi',              offset: 'UTC+04:00', region: 'Asia' },
  { value: 'Asia/Karachi',                  label: 'Karachi, Islamabad',           offset: 'UTC+05:00', region: 'Asia' },
  { value: 'Asia/Kolkata',                  label: 'Mumbai, Nueva Delhi, Calcuta', offset: 'UTC+05:30', region: 'Asia' },
  { value: 'Asia/Dhaka',                    label: 'Daca',                         offset: 'UTC+06:00', region: 'Asia' },
  { value: 'Asia/Bangkok',                  label: 'Bangkok, Hanói, Yakarta',      offset: 'UTC+07:00', region: 'Asia' },
  { value: 'Asia/Singapore',                label: 'Singapur, Kuala Lumpur',       offset: 'UTC+08:00', region: 'Asia' },
  { value: 'Asia/Shanghai',                 label: 'Shanghai, Beijing, Hong Kong', offset: 'UTC+08:00', region: 'Asia' },
  { value: 'Asia/Manila',                   label: 'Manila',                       offset: 'UTC+08:00', region: 'Asia' },
  { value: 'Asia/Tokyo',                    label: 'Tokio, Osaka',                 offset: 'UTC+09:00', region: 'Asia' },
  { value: 'Asia/Seoul',                    label: 'Seúl',                         offset: 'UTC+09:00', region: 'Asia' },
  // Oceanía
  { value: 'Australia/Perth',               label: 'Perth',                        offset: 'UTC+08:00', region: 'Oceanía' },
  { value: 'Australia/Sydney',              label: 'Sídney, Melbourne, Brisbane',  offset: 'UTC+10:00', region: 'Oceanía' },
  { value: 'Pacific/Auckland',              label: 'Auckland, Wellington',         offset: 'UTC+12:00', region: 'Oceanía' },
  // UTC
  { value: 'UTC',                           label: 'UTC — Tiempo universal',       offset: 'UTC+00:00', region: 'UTC' },
]

export function findTimezone(value: string): Timezone | undefined {
  return TIMEZONES.find((tz) => tz.value === value)
}
