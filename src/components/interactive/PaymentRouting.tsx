import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

// --- AVOQADO PRODUCT GRID ---
// All real products, no placeholders
// Bidirectional hover: hover any card to see its connections

interface Product {
  id: string;
  name: string;
  icon: React.ReactNode;
  iconDimmed: React.ReactNode;
  row: number;
  col: number;
  color: string;
  isPillar?: boolean;
  // Which pillars/features this feature connects to (upstream)
  connectsTo?: string[];
  // Which features this pillar/feature sends to (downstream) - for routing flow
  sendsTo?: string[];
}

// Grid config - 6x6 with compact cards for better layout balance
const GRID_COLS = 6;
const GRID_ROWS = 6;
const CARD_SIZE = 90;
const GAP = 22;
const GRID_WIDTH = GRID_COLS * CARD_SIZE + (GRID_COLS - 1) * GAP;
const GRID_HEIGHT = GRID_ROWS * CARD_SIZE + (GRID_ROWS - 1) * GAP;

const PRODUCTS: Product[] = [
  // === ROW 0 ===
  {
    id: 'reportes',
    name: 'Reportes',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="rep-a" x1="5" y1="5" x2="35" y2="35" gradientUnits="userSpaceOnUse"><stop stopColor="#00D924"/><stop offset="1" stopColor="#00A600"/></linearGradient></defs><path d="M5 5v30h30" stroke="url(#rep-a)" strokeWidth="3" strokeLinecap="round"/><path d="M32 15l-9 9-6-6-9 9" stroke="#11EFE3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><path d="M5 5v30h30" stroke="#C4CCD8" strokeWidth="2" strokeLinecap="round"/><path d="M32 15l-9 9-6-6-9 9" stroke="#C4CCD8" strokeWidth="2" strokeLinecap="round"/></svg>),
    row: 0, col: 1,
    color: '#00D924',
    connectsTo: ['dashboard'],
  },
  {
    id: 'chatbot',
    name: 'Chatbot IA',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="chat-a" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#9B66FF"/><stop offset="1" stopColor="#6E00F5"/></linearGradient></defs><circle cx="20" cy="20" r="16" fill="url(#chat-a)"/><circle cx="13" cy="17" r="2" fill="white"/><circle cx="20" cy="17" r="2" fill="white"/><circle cx="27" cy="17" r="2" fill="white"/><path d="M13 26c3 3 11 3 14 0" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><circle cx="20" cy="20" r="16" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><circle cx="13" cy="17" r="2" stroke="#C4CCD8" strokeWidth="1" fill="none"/><circle cx="20" cy="17" r="2" stroke="#C4CCD8" strokeWidth="1" fill="none"/><circle cx="27" cy="17" r="2" stroke="#C4CCD8" strokeWidth="1" fill="none"/></svg>),
    row: 0, col: 3,
    color: '#9B66FF',
    connectsTo: ['dashboard'],
  },
  {
    id: 'inventario',
    name: 'Inventario',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="inv-a" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#00D924"/><stop offset="1" stopColor="#00A600"/></linearGradient><linearGradient id="inv-b" x1="20" y1="15" x2="20" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#11EFE3"/><stop offset="1" stopColor="#21CFE0"/></linearGradient></defs><path d="M20 2l16 9v18l-16 9-16-9V11l16-9z" fill="url(#inv-a)"/><path d="M20 20v18l-16-9V11l16 9z" fill="url(#inv-b)"/><path d="M20 20l16-9" stroke="white" strokeWidth="1" strokeOpacity="0.5"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><path d="M20 2l16 9v18l-16 9-16-9V11l16-9z" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><path d="M20 20v18M4 11l16 9 16-9" stroke="#C4CCD8" strokeWidth="1"/></svg>),
    row: 0, col: 5,
    color: '#00D924',
    connectsTo: ['tpv', 'dashboard'],
  },

  // === ROW 1: TPV and related ===
  {
    id: 'mesas',
    name: 'Mesas',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="mesa-a" x1="20" y1="10" x2="20" y2="20" gradientUnits="userSpaceOnUse"><stop stopColor="#11EFE3"/><stop offset="1" stopColor="#21CFE0"/></linearGradient></defs><rect x="4" y="12" width="32" height="6" rx="2" fill="url(#mesa-a)"/><path d="M10 18v14M30 18v14" stroke="#0073E6" strokeWidth="3" strokeLinecap="round"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><rect x="4" y="12" width="32" height="6" rx="2" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><path d="M10 18v14M30 18v14" stroke="#C4CCD8" strokeWidth="2" strokeLinecap="round"/></svg>),
    row: 1, col: 0,
    color: '#11EFE3',
    connectsTo: ['tpv'],
  },
  {
    id: 'tpv',
    name: 'TPV Móvil',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <defs>
          <linearGradient id="tpv-main" x1="20" y1="0" x2="20" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#11EFE3" />
            <stop offset="1" stopColor="#21CFE0" />
          </linearGradient>
          <linearGradient id="tpv-overlay" x1="20" y1="15" x2="20" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0048E5" />
            <stop offset="1" stopColor="#9B66FF" />
          </linearGradient>
        </defs>
        <rect x="8" y="2" width="24" height="36" rx="4" fill="url(#tpv-main)" />
        <rect x="8" y="20" width="24" height="18" rx="4" fill="url(#tpv-overlay)" />
        <rect x="12" y="6" width="16" height="12" rx="2" fill="white" fillOpacity="0.3" />
        <circle cx="20" cy="34" r="2" fill="white" />
      </svg>
    ),
    iconDimmed: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <rect x="8" y="2" width="24" height="36" rx="4" stroke="#C4CCD8" strokeWidth="1.5" fill="none" />
        <rect x="12" y="6" width="16" height="12" rx="2" stroke="#C4CCD8" strokeWidth="1" fill="none" />
        <circle cx="20" cy="34" r="2" stroke="#C4CCD8" strokeWidth="1" fill="none" />
      </svg>
    ),
    row: 0, col: 2,
    color: '#11EFE3',
    isPillar: true,
    sendsTo: ['dinero', 'pagos', 'mesas', 'ordenes', 'propinas', 'inventario', 'cocina', 'impresora', 'offline', 'staff'],
  },
  {
    id: 'ordenes',
    name: 'Órdenes',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="ord-a" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#FF8F17"/><stop offset="1" stopColor="#FF6B00"/></linearGradient></defs><path d="M14 8H10a4 4 0 00-4 4v20a4 4 0 004 4h20a4 4 0 004-4V12a4 4 0 00-4-4h-4" stroke="url(#ord-a)" strokeWidth="2.5"/><rect x="14" y="4" width="12" height="8" rx="2" fill="url(#ord-a)"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><path d="M14 8H10a4 4 0 00-4 4v20a4 4 0 004 4h20a4 4 0 004-4V12a4 4 0 00-4-4h-4" stroke="#C4CCD8" strokeWidth="1.5"/><rect x="14" y="4" width="12" height="8" rx="2" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/></svg>),
    row: 1, col: 3,
    color: '#FF8F17',
    connectsTo: ['tpv', 'dashboard', 'mesas'],
  },
  {
    id: 'cocina',
    name: 'Cocina',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="coc-a" x1="20" y1="6" x2="20" y2="34" gradientUnits="userSpaceOnUse"><stop stopColor="#FF5091"/><stop offset="1" stopColor="#E03071"/></linearGradient></defs><rect x="4" y="10" width="32" height="20" rx="4" fill="url(#coc-a)"/><circle cx="12" cy="20" r="3" fill="white"/><circle cx="20" cy="20" r="3" fill="white"/><circle cx="28" cy="20" r="3" fill="white"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><rect x="4" y="10" width="32" height="20" rx="4" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><circle cx="12" cy="20" r="3" stroke="#C4CCD8" strokeWidth="1" fill="none"/><circle cx="20" cy="20" r="3" stroke="#C4CCD8" strokeWidth="1" fill="none"/><circle cx="28" cy="20" r="3" stroke="#C4CCD8" strokeWidth="1" fill="none"/></svg>),
    row: 1, col: 4,
    color: '#FF5091',
    connectsTo: ['tpv', 'ordenes','impresora'],
  },
  {
    id: 'qr',
    name: 'Pagos QR',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <defs>
          <linearGradient id="qr-a" x1="10" y1="2" x2="10" y2="18" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF5091" />
            <stop offset="1" stopColor="#E03071" />
          </linearGradient>
          <linearGradient id="qr-b" x1="30" y1="22" x2="30" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9A66FF" />
            <stop offset="1" stopColor="#6E00F5" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="16" height="16" rx="3" fill="url(#qr-a)" />
        <rect x="22" y="2" width="16" height="16" rx="3" fill="url(#qr-a)" />
        <rect x="2" y="22" width="16" height="16" rx="3" fill="url(#qr-a)" />
        <rect x="22" y="22" width="16" height="16" rx="3" fill="url(#qr-b)" />
        <rect x="6" y="6" width="8" height="8" rx="1" fill="white" fillOpacity="0.4" />
        <rect x="26" y="6" width="8" height="8" rx="1" fill="white" fillOpacity="0.4" />
        <rect x="6" y="26" width="8" height="8" rx="1" fill="white" fillOpacity="0.4" />
      </svg>
    ),
    iconDimmed: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <rect x="2" y="2" width="16" height="16" rx="3" stroke="#C4CCD8" strokeWidth="1.5" fill="none" />
        <rect x="22" y="2" width="16" height="16" rx="3" stroke="#C4CCD8" strokeWidth="1.5" fill="none" />
        <rect x="2" y="22" width="16" height="16" rx="3" stroke="#C4CCD8" strokeWidth="1.5" fill="none" />
        <rect x="22" y="22" width="16" height="16" rx="3" stroke="#C4CCD8" strokeWidth="1.5" fill="none" />
      </svg>
    ),
    row: 1, col: 5,
    color: '#FF5091',
    isPillar: true,
    sendsTo: ['pagos', 'resenas', 'split'],
  },

  // === ROW 2: Payment features ===
  {
    id: 'dinero',
    name: 'Dinero',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="din-a" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#00D924"/><stop offset="1" stopColor="#00A600"/></linearGradient></defs><circle cx="20" cy="20" r="16" fill="url(#din-a)"/><path d="M20 10v20M26 15h-8a3 3 0 000 6h4a3 3 0 010 6h-8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><circle cx="20" cy="20" r="16" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><path d="M20 10v20M26 15h-8a3 3 0 000 6h4a3 3 0 010 6h-8" stroke="#C4CCD8" strokeWidth="1.5" strokeLinecap="round"/></svg>),
    row: 2, col: 2,
    color: '#00D924',
    connectsTo: ['pagos'],
    sendsTo: ['enrutamiento'],
  },
  {
    id: 'enrutamiento',
    name: 'Enrutamiento',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="enr-a" x1="4" y1="20" x2="36" y2="20" gradientUnits="userSpaceOnUse"><stop stopColor="#9B66FF"/><stop offset="1" stopColor="#0073E6"/></linearGradient></defs><path d="M4 20h6l5-14 10 28 5-14h6" stroke="url(#enr-a)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><path d="M4 20h6l5-14 10 28 5-14h6" stroke="#C4CCD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>),
    row: 3, col: 2,
    color: '#9B66FF',
    connectsTo: ['dinero'],
    sendsTo: ['santander', 'bbva', 'inbursa'],
  },
  {
    id: 'pagos',
    name: 'Pagos',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="pag-a" x1="20" y1="6" x2="20" y2="34" gradientUnits="userSpaceOnUse"><stop stopColor="#00D924"/><stop offset="1" stopColor="#00A600"/></linearGradient></defs><rect x="2" y="8" width="36" height="24" rx="4" fill="url(#pag-a)"/><path d="M2 16h36" stroke="white" strokeWidth="3"/><rect x="6" y="24" width="10" height="4" rx="1" fill="white" fillOpacity="0.5"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><rect x="2" y="8" width="36" height="24" rx="4" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><path d="M2 16h36" stroke="#C4CCD8" strokeWidth="1.5"/></svg>),
    row: 1, col: 2,
    color: '#00D924',
    connectsTo: ['tpv', 'qr', 'dashboard'],
    sendsTo: ['dinero'],
  },
  {
    id: 'propinas',
    name: 'Propinas',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="prop-a" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#FFD748"/><stop offset="1" stopColor="#FFC148"/></linearGradient></defs><circle cx="20" cy="20" r="16" fill="url(#prop-a)"/><path d="M20 10v20M26 15h-8a3 3 0 000 6h4a3 3 0 010 6h-8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><circle cx="20" cy="20" r="16" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><path d="M20 10v20M26 15h-8a3 3 0 000 6h4a3 3 0 010 6h-8" stroke="#C4CCD8" strokeWidth="1.5" strokeLinecap="round"/></svg>),
    row: 2, col: 3,
    color: '#FFD748',
    connectsTo: ['tpv', 'qr'],
  },
  {
    id: 'split',
    name: 'Split',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="spl-a" x1="12" y1="8" x2="12" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#9B66FF"/><stop offset="1" stopColor="#6E00F5"/></linearGradient><linearGradient id="spl-b" x1="28" y1="8" x2="28" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#FF5091"/><stop offset="1" stopColor="#E03071"/></linearGradient></defs><circle cx="12" cy="20" r="10" fill="url(#spl-a)" fillOpacity="0.8"/><circle cx="28" cy="20" r="10" fill="url(#spl-b)" fillOpacity="0.8"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><circle cx="12" cy="20" r="10" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><circle cx="28" cy="20" r="10" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/></svg>),
    row: 2, col: 4,
    color: '#9B66FF',
    connectsTo: ['tpv', 'qr'],
  },
  {
    id: 'resenas',
    name: 'Reseñas',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="res-a" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#FFD748"/><stop offset="1" stopColor="#FFC148"/></linearGradient></defs><path d="M20 3l5.5 11 12 1.7-8.7 8.5 2 12L20 31l-10.8 5.2 2-12L2.5 15.7l12-1.7L20 3z" fill="url(#res-a)"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><path d="M20 3l5.5 11 12 1.7-8.7 8.5 2 12L20 31l-10.8 5.2 2-12L2.5 15.7l12-1.7L20 3z" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/></svg>),
    row: 2, col: 5,
    color: '#FFD748',
    connectsTo: ['tpv', 'qr', 'dashboard'],
  },

  // === ROW 3: Banks and Staff ===
  {
    id: 'santander',
    name: 'Santander',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="san-a" x1="20" y1="8" x2="20" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#FF3333"/><stop offset="1" stopColor="#CC0000"/></linearGradient></defs><rect x="2" y="10" width="36" height="20" rx="4" fill="url(#san-a)"/><path d="M10 20h20" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><rect x="2" y="10" width="36" height="20" rx="4" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/></svg>),
    row: 4, col: 1,
    color: '#FF3333',
    connectsTo: ['enrutamiento'],
  },
  {
    id: 'bbva',
    name: 'BBVA',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="bbva-a" x1="20" y1="8" x2="20" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#0073E6"/><stop offset="1" stopColor="#004481"/></linearGradient></defs><rect x="2" y="10" width="36" height="20" rx="4" fill="url(#bbva-a)"/><path d="M10 20h20" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><rect x="2" y="10" width="36" height="20" rx="4" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/></svg>),
    row: 4, col: 2,
    color: '#0073E6',
    connectsTo: ['enrutamiento'],
  },
  {
    id: 'inbursa',
    name: 'Inbursa',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="inb-a" x1="20" y1="8" x2="20" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#0073E6"/><stop offset="1" stopColor="#003366"/></linearGradient></defs><rect x="2" y="10" width="36" height="20" rx="4" fill="url(#inb-a)"/><path d="M10 20h20" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><rect x="2" y="10" width="36" height="20" rx="4" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/></svg>),
    row: 4, col: 3,
    color: '#0073E6',
    connectsTo: ['enrutamiento'],
  },
  {
    id: 'staff',
    name: 'Personal',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="staff-a" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#FF5091"/><stop offset="1" stopColor="#E03071"/></linearGradient></defs><circle cx="14" cy="12" r="6" fill="url(#staff-a)"/><circle cx="28" cy="12" r="5" fill="url(#staff-a)" fillOpacity="0.6"/><path d="M4 36v-4a8 8 0 018-8h8a8 8 0 018 8v4" fill="url(#staff-a)"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><circle cx="14" cy="12" r="6" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><circle cx="28" cy="12" r="5" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/></svg>),
    row: 3, col: 3,
    color: '#FF5091',
    connectsTo: ['tpv', 'dashboard'],
  },
  {
    id: 'turnos',
    name: 'Turnos',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="turn-a" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#FFD748"/><stop offset="1" stopColor="#FF8F17"/></linearGradient></defs><circle cx="20" cy="20" r="16" stroke="url(#turn-a)" strokeWidth="3"/><path d="M20 10v10l6 6" stroke="url(#turn-a)" strokeWidth="3" strokeLinecap="round"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><circle cx="20" cy="20" r="16" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><path d="M20 10v10l6 6" stroke="#C4CCD8" strokeWidth="1.5" strokeLinecap="round"/></svg>),
    row: 3, col: 4,
    color: '#FFD748',
    connectsTo: ['dashboard'],
  },
  {
    id: 'impresora',
    name: 'Impresora',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="imp-a" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#9B66FF"/><stop offset="1" stopColor="#6E00F5"/></linearGradient></defs><rect x="10" y="4" width="20" height="10" rx="2" fill="url(#imp-a)" fillOpacity="0.3"/><rect x="4" y="14" width="32" height="14" rx="3" fill="url(#imp-a)"/><rect x="10" y="28" width="20" height="10" rx="2" fill="url(#imp-a)" fillOpacity="0.3"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><rect x="10" y="4" width="20" height="10" rx="2" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><rect x="4" y="14" width="32" height="14" rx="3" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><rect x="10" y="28" width="20" height="10" rx="2" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/></svg>),
    row: 3, col: 5,
    color: '#9B66FF',
    connectsTo: ['tpv'],
  },

  // === ROW 4: Dashboard and analytics ===
  {
    id: 'analytics',
    name: 'Analytics',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="ana-a" x1="20" y1="6" x2="20" y2="36" gradientUnits="userSpaceOnUse"><stop stopColor="#9B66FF"/><stop offset="1" stopColor="#6E00F5"/></linearGradient></defs><rect x="6" y="20" width="8" height="14" rx="2" fill="url(#ana-a)"/><rect x="16" y="14" width="8" height="20" rx="2" fill="url(#ana-a)"/><rect x="26" y="6" width="8" height="28" rx="2" fill="url(#ana-a)"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><rect x="6" y="20" width="8" height="14" rx="2" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><rect x="16" y="14" width="8" height="20" rx="2" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><rect x="26" y="6" width="8" height="28" rx="2" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/></svg>),
    row: 4, col: 0,
    color: '#9B66FF',
    connectsTo: ['dashboard'],
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <defs>
          <linearGradient id="dash-a" x1="10" y1="2" x2="10" y2="18" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0073E6" />
            <stop offset="1" stopColor="#00299C" />
          </linearGradient>
          <linearGradient id="dash-b" x1="30" y1="2" x2="30" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9B66FF" />
            <stop offset="1" stopColor="#0048E5" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="16" height="16" rx="3" fill="url(#dash-a)" />
        <rect x="22" y="2" width="16" height="10" rx="3" fill="url(#dash-b)" />
        <rect x="22" y="16" width="16" height="22" rx="3" fill="url(#dash-b)" />
        <rect x="2" y="22" width="16" height="16" rx="3" fill="url(#dash-a)" />
      </svg>
    ),
    iconDimmed: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <rect x="2" y="2" width="16" height="16" rx="3" stroke="#C4CCD8" strokeWidth="1.5" fill="none" />
        <rect x="22" y="2" width="16" height="10" rx="3" stroke="#C4CCD8" strokeWidth="1.5" fill="none" />
        <rect x="22" y="16" width="16" height="22" rx="3" stroke="#C4CCD8" strokeWidth="1.5" fill="none" />
        <rect x="2" y="22" width="16" height="16" rx="3" stroke="#C4CCD8" strokeWidth="1.5" fill="none" />
      </svg>
    ),
    row: 5, col: 3,
    color: '#0073E6',
    isPillar: true,
    sendsTo: ['reportes', 'chatbot', 'inventario', 'analytics', 'saldos', 'turnos', 'staff', 'pagos', 'propinas', 'dinero', 'mesas', 'ordenes', 'cocina', 'resenas', 'personal'],
  },
  {
    id: 'saldos',
    name: 'Saldos',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="sal-a" x1="20" y1="8" x2="20" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#00D924"/><stop offset="1" stopColor="#00A600"/></linearGradient></defs><rect x="4" y="10" width="32" height="20" rx="4" fill="url(#sal-a)"/><path d="M4 16h32" stroke="white" strokeWidth="2"/><circle cx="30" cy="24" r="3" fill="white"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><rect x="4" y="10" width="32" height="20" rx="4" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><path d="M4 16h32" stroke="#C4CCD8" strokeWidth="1.5"/></svg>),
    row: 4, col: 4,
    color: '#00D924',
    connectsTo: ['dashboard'],
  },
  {
    id: 'offline',
    name: 'Offline',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="off-a" x1="20" y1="6" x2="20" y2="34" gradientUnits="userSpaceOnUse"><stop stopColor="#11EFE3"/><stop offset="1" stopColor="#21CFE0"/></linearGradient></defs><path d="M6 20a14 14 0 0128 0" stroke="url(#off-a)" strokeWidth="3" strokeLinecap="round"/><path d="M12 25a7 7 0 0116 0" stroke="url(#off-a)" strokeWidth="3" strokeLinecap="round"/><circle cx="20" cy="32" r="3" fill="url(#off-a)"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><path d="M6 20a14 14 0 0128 0" stroke="#C4CCD8" strokeWidth="2" strokeLinecap="round"/><path d="M12 25a7 7 0 0116 0" stroke="#C4CCD8" strokeWidth="2" strokeLinecap="round"/></svg>),
    row: 4, col: 5,
    color: '#11EFE3',
    connectsTo: ['tpv'],
  },
];

// Animated connection
const AnimatedConnection: React.FC<{
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
  fromColor: string;
  toColor: string;
  id: string;
  isActive: boolean;
}> = ({ fromPos, toPos, fromColor, toColor, id, isActive }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  
  // Stripe uses 20px corner radius
  const R = 20;
  
  // Generate Stripe-style L-shaped path with smooth corner
  // Pattern: M start → L before corner → Q control,end → L final
  let path;
  
  // Determine path direction based on relative positions
  if (Math.abs(dy) > Math.abs(dx)) {
    // Primarily VERTICAL - go vertical first, then horizontal
    // Ex: d="M1,1 L1,32 Q1,52 21,52 L142,52"
    const goingDown = dy > 0;
    const goingRight = dx > 0;
    
    // Corner Y is 20px before the end Y
    const cornerY = goingDown ? toPos.y - R : toPos.y + R;
    
    // Path construction
    const qControlX = fromPos.x;
    const qControlY = toPos.y;
    const qEndX = goingRight ? fromPos.x + R : fromPos.x - R;
    const qEndY = toPos.y;
    
    path = `M${fromPos.x},${fromPos.y} L${fromPos.x},${cornerY} Q${qControlX},${qControlY} ${qEndX},${qEndY} L${toPos.x},${toPos.y}`;
  } else {
    // Primarily HORIZONTAL - go horizontal first, then vertical
    const goingRight = dx > 0;
    const goingDown = dy > 0;
    
    // Corner X is 20px before the end X
    const cornerX = goingRight ? toPos.x - R : toPos.x + R;
    
    // Path construction
    const qControlX = toPos.x;
    const qControlY = fromPos.y;
    const qEndX = toPos.x;
    const qEndY = goingDown ? fromPos.y + R : fromPos.y - R;
    
    path = `M${fromPos.x},${fromPos.y} L${cornerX},${fromPos.y} Q${qControlX},${qControlY} ${qEndX},${qEndY} L${toPos.x},${toPos.y}`;
  }

  useEffect(() => {
    if (pathRef.current) setPathLength(pathRef.current.getTotalLength());
  }, [fromPos, toPos]);

  // STRIPE-INSPIRED GRADIENTS
  // Deterministically select a gradient based on the ID string
  const gradients = [
    ['#11EFE3', '#9966FF'], // Cyan -> Purple
    ['#11EFE3', '#0073E6'], // Cyan -> Blue
    ['#0073e6', '#ff80ff'], // Blue -> Pink
    ['#ff5996', '#9966ff'], // Pink -> Purple
    ['#FFD848', '#00D924'], // Yellow -> Green
  ];
  
  // Simple hash function for consistent gradient selection
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const [gradStart, gradEnd] = gradients[hash % gradients.length];

  return (
    <>
      <defs>
        <linearGradient id={`grad-${id}`} gradientUnits="userSpaceOnUse" x1={fromPos.x} y1={fromPos.y} x2={toPos.x} y2={toPos.y}>
          <stop offset="0%" stopColor={gradStart} />
          <stop offset="100%" stopColor={gradEnd} />
        </linearGradient>
      </defs>
      <path 
        ref={pathRef} 
        d={path} 
        fill="none" 
        stroke={`url(#grad-${id})`} 
        strokeWidth="2" 
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: isActive ? 0 : pathLength,
          transition: isActive 
            ? 'stroke-dashoffset 1s ease-out, opacity 0.3s' 
            : 'stroke-dashoffset 0.3s ease-in, opacity 0.2s',
          opacity: isActive ? 0.85 : 0,
        }}
      />
    </>
  );
};

// Product card - Stripe-style hover pattern
const ProductCard: React.FC<{
  product: Product;
  isActive: boolean;
  onHover: (id: string | null) => void;
  gridPos: { x: number; y: number };
}> = ({ product, isActive, onHover, gridPos }) => {
  const size = product.isPillar ? CARD_SIZE + 16 : CARD_SIZE;
  const offset = product.isPillar ? -8 : 0;
  
  return (
    <div
      className={`absolute flex flex-col items-center justify-center rounded-xl transition-all duration-300 cursor-pointer
                 ${isActive 
                   ? 'bg-white shadow-lg border border-gray-200' 
                   : 'bg-white/80 border border-gray-100/80 hover:bg-white hover:shadow-md hover:border-gray-200'}`}
      style={{
        left: gridPos.x + offset,
        top: gridPos.y + offset,
        width: size,
        height: size,
        zIndex: isActive ? 25 : product.isPillar ? 15 : 10,
      }}
      onMouseEnter={() => onHover(product.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Icon - outline when inactive, colorful when active */}
      <div className="flex items-center justify-center transition-all duration-300">
        {isActive ? product.icon : product.iconDimmed}
      </div>
      
      {/* Label - only visible when active */}
      <span 
        className={`text-[10px] font-medium text-center text-gray-700 mt-1.5 transition-all duration-300
                   ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}
      >
        {product.name}
      </span>
    </div>
  );
};

// Main component
export const PaymentRouting: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [autoScrollIndex, setAutoScrollIndex] = useState(0);
  
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const titleOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.1], [30, 0]);
  const gridOpacity = useTransform(scrollYProgress, [0.1, 0.2], [0, 1]);

  const pillars = ['tpv', 'qr', 'dashboard'];
  
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!hoveredCard && latest > 0.2) {
      const idx = Math.floor(((latest - 0.2) / 0.7 * 3) % 3);
      if (idx !== autoScrollIndex) setAutoScrollIndex(idx);
    }
  });

  const activePillar = hoveredCard ? null : pillars[autoScrollIndex];

  // Get connections based on hovered card or active pillar
  const getActiveState = useCallback(() => {
    const activeCards = new Set<string>();
    const connections: { from: string; to: string; fromColor: string; toColor: string }[] = [];

    // Helper to add downstream connections recursively
    const addDownstream = (sourceId: string, sourceProduct: Product) => {
      if (sourceProduct.sendsTo) {
        sourceProduct.sendsTo.forEach(targetId => {
          const targetProduct = PRODUCTS.find(p => p.id === targetId);
          if (targetProduct && !connections.find(c => c.from === sourceId && c.to === targetId)) {
            activeCards.add(targetId);
            connections.push({ from: sourceId, to: targetId, fromColor: sourceProduct.color, toColor: targetProduct.color });
            // Recursively add downstream
            addDownstream(targetId, targetProduct);
          }
        });
      }
    };

    if (hoveredCard) {
      const product = PRODUCTS.find(p => p.id === hoveredCard);
      activeCards.add(hoveredCard);
      
      if (product) {
        if (product.isPillar) {
          // PILLAR hovered - show ONLY downstream (sendsTo) connections
          // This avoids duplicate lines from both directions
          addDownstream(hoveredCard, product);
        } else {
          // FEATURE hovered - show upstream connections (to pillars)
          if (product.connectsTo) {
            product.connectsTo.forEach(targetId => {
              const target = PRODUCTS.find(p => p.id === targetId);
              if (target) {
                activeCards.add(targetId);
                connections.push({ from: hoveredCard, to: targetId, fromColor: product.color, toColor: target.color });
              }
            });
          }
          // Also show downstream for routing chain
          addDownstream(hoveredCard, product);
        }
      }
    } else if (activePillar) {
      const pillar = PRODUCTS.find(p => p.id === activePillar);
      if (pillar) {
        activeCards.add(activePillar);
        // Show ONLY downstream from pillar
        addDownstream(activePillar, pillar);
      }
    }
    return { activeCards, connections };
  }, [hoveredCard, activePillar]);

  const { activeCards, connections } = getActiveState();
  const productMap: Record<string, Product> = {};
  PRODUCTS.forEach(p => { productMap[p.id] = p; });

  const getPixelPos = (p: Product) => ({ x: p.col * (CARD_SIZE + GAP) + CARD_SIZE / 2, y: p.row * (CARD_SIZE + GAP) + CARD_SIZE / 2 });
  const getGridPos = (p: Product) => ({ x: p.col * (CARD_SIZE + GAP), y: p.row * (CARD_SIZE + GAP) });

  return (
    <div ref={containerRef} className="relative h-[300vh]" style={{ backgroundColor: '#f6f9fc' }}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 items-center">
            <div className="space-y-8">
              {/* Header - Compact */}
              <motion.div style={{ opacity: titleOpacity, y: titleY }} className="space-y-2">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: '#1d1d1f', lineHeight: '1.1' }}>
                  Una suite integrada
                </h2>
                <p className="text-lg" style={{ color: '#86868b', fontWeight: 400 }}>
                  Todo lo que necesitas para gestionar tu negocio
                </p>
              </motion.div>

              {/* Tab Navigation - Products */}
              <motion.div style={{ opacity: gridOpacity }}>
                <div className="inline-flex p-1 rounded-lg" style={{ backgroundColor: '#2a2a2a' }}>
                  {pillars.map((p) => {
                    const isActive = hoveredCard === p || (!hoveredCard && activePillar === p);
                    const pillarNames = { tpv: 'TPV Móvil', qr: 'Pagos QR', dashboard: 'Dashboard' };
                    return (
                      <button
                        key={p}
                        onMouseEnter={() => setHoveredCard(p)}
                        onMouseLeave={() => setHoveredCard(null)}
                        className="px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200"
                        style={{
                          backgroundColor: isActive ? '#ffffff' : 'transparent',
                          color: isActive ? '#1d1d1f' : '#a0a0a0',
                        }}
                      >
                        {pillarNames[p as keyof typeof pillarNames]}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
            <motion.div style={{ opacity: gridOpacity }} className="flex justify-center lg:justify-end">
              {/* Responsive scaling container - shrinks on smaller screens */}
              <div 
                className="origin-center lg:origin-top-right"
                style={{ 
                  transform: 'scale(var(--grid-scale, 1))',
                }}
              >
                <style>{`
                  @media (max-width: 1400px) { :root { --grid-scale: 0.9; } }
                  @media (max-width: 1200px) { :root { --grid-scale: 0.8; } }
                  @media (max-width: 1024px) { :root { --grid-scale: 0.7; } }
                  @media (max-width: 768px) { :root { --grid-scale: 0.55; } }
                  @media (max-width: 640px) { :root { --grid-scale: 0.45; } }
                  @media (min-width: 1401px) { :root { --grid-scale: 1; } }
                `}</style>
                <div className="relative" style={{ width: GRID_WIDTH, height: GRID_HEIGHT }}>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }} viewBox={`0 0 ${GRID_WIDTH} ${GRID_HEIGHT}`}>
                    {connections.map((c, i) => {
                      const from = productMap[c.from], to = productMap[c.to];
                      if (!from || !to) return null;
                      return <AnimatedConnection key={`${c.from}-${c.to}-${i}`} id={`${c.from}-${c.to}-${i}`} fromPos={getPixelPos(from)} toPos={getPixelPos(to)} fromColor={c.fromColor} toColor={c.toColor} isActive={true} />;
                    })}
                  </svg>
                  {PRODUCTS.map((p) => <ProductCard key={p.id} product={p} isActive={activeCards.has(p.id)} onHover={setHoveredCard} gridPos={getGridPos(p)} />)}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
