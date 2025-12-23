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
  // Dynamic layout overrides per mode (pillar selection)
  layoutOverrides?: Record<string, { row: number; col: number }>;
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
    row: 0, col: 0,
    color: '#00D924',

    // connectsTo dashboard handled by dashboard sendsTo
    layoutOverrides: {
      dashboard: { row: 0, col: 2 }, // Top Left Outer - Row 0 to clear path
      tpv: { row: 4, col: 1 }, // Bottom Left
    },
  },
  {
    id: 'chatbot',
    name: 'Chatbot IA',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="chat-a" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#9B66FF"/><stop offset="1" stopColor="#6E00F5"/></linearGradient></defs><circle cx="20" cy="20" r="16" fill="url(#chat-a)"/><circle cx="13" cy="17" r="2" fill="white"/><circle cx="20" cy="17" r="2" fill="white"/><circle cx="27" cy="17" r="2" fill="white"/><path d="M13 26c3 3 11 3 14 0" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><circle cx="20" cy="20" r="16" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><circle cx="13" cy="17" r="2" stroke="#C4CCD8" strokeWidth="1" fill="none"/><circle cx="20" cy="17" r="2" stroke="#C4CCD8" strokeWidth="1" fill="none"/><circle cx="27" cy="17" r="2" stroke="#C4CCD8" strokeWidth="1" fill="none"/></svg>),
    row: 0, col: 5,
    color: '#9B66FF',
    // connectsTo dashboard handled by dashboard sendsTo
    layoutOverrides: {
      dashboard: { row: 1, col: 5 }, // Top Right Far
    },
  },
  {
    id: 'inventario',
    name: 'Inventario',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="inv-a" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#00D924"/><stop offset="1" stopColor="#00A600"/></linearGradient><linearGradient id="inv-b" x1="20" y1="15" x2="20" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#11EFE3"/><stop offset="1" stopColor="#21CFE0"/></linearGradient></defs><path d="M20 2l16 9v18l-16 9-16-9V11l16-9z" fill="url(#inv-a)"/><path d="M20 20v18l-16-9V11l16 9z" fill="url(#inv-b)"/><path d="M20 20l16-9" stroke="white" strokeWidth="1" strokeOpacity="0.5"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><path d="M20 2l16 9v18l-16 9-16-9V11l16-9z" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><path d="M20 20v18M4 11l16 9 16-9" stroke="#C4CCD8" strokeWidth="1"/></svg>),
    row: 0, col: 4,
    color: '#00D924',
    // connectsTo tpv/dashboard handled by pillars
    layoutOverrides: {
      dashboard: { row: 0, col: 4 }, // Top Right Outer
      tpv: { row: 1, col: 4 }, // Row 1, Col 4 (Layout Slot 1)
    },
  },

  // === ROW 1: TPV and related ===
  {
    id: 'mesas',
    name: 'Mesas',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="mesa-a" x1="20" y1="10" x2="20" y2="20" gradientUnits="userSpaceOnUse"><stop stopColor="#11EFE3"/><stop offset="1" stopColor="#21CFE0"/></linearGradient></defs><rect x="4" y="12" width="32" height="6" rx="2" fill="url(#mesa-a)"/><path d="M10 18v14M30 18v14" stroke="#0073E6" strokeWidth="3" strokeLinecap="round"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><rect x="4" y="12" width="32" height="6" rx="2" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><path d="M10 18v14M30 18v14" stroke="#C4CCD8" strokeWidth="2" strokeLinecap="round"/></svg>),
    row: 1, col: 0,
    color: '#11EFE3',
    // connectsTo tpv handled by tpv sendsTo
    layoutOverrides: {
      tpv: { row: 1, col: 1 }, // Row 1, Col 1
    },
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
    sendsTo: ['pagos', 'mesas', 'ordenes', 'inventario', 'offline', 'staff'],
    layoutOverrides: {
      tpv: { row: 0, col: 3 }, // Top Center Root
    },
  },
  {
    id: 'ordenes',
    name: 'Órdenes',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="ord-a" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#FF8F17"/><stop offset="1" stopColor="#FF6B00"/></linearGradient></defs><path d="M14 8H10a4 4 0 00-4 4v20a4 4 0 004 4h20a4 4 0 004-4V12a4 4 0 00-4-4h-4" stroke="url(#ord-a)" strokeWidth="2.5"/><rect x="14" y="4" width="12" height="8" rx="2" fill="url(#ord-a)"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><path d="M14 8H10a4 4 0 00-4 4v20a4 4 0 004 4h20a4 4 0 004-4V12a4 4 0 00-4-4h-4" stroke="#C4CCD8" strokeWidth="1.5"/><rect x="14" y="4" width="12" height="8" rx="2" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/></svg>),
    row: 1, col: 3,
    color: '#FF8F17',
    // connectsTo tpv/dashboard handled by pillars/logic
    connectsTo: ['mesas'],
    sendsTo: ['cocina', 'impresora'],
    layoutOverrides: {
      tpv: { row: 2, col: 5 }, // Row 2, Col 5 (Pushed Down)
    },
  },
  {
    id: 'cocina',
    name: 'Cocina',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="coc-a" x1="20" y1="6" x2="20" y2="34" gradientUnits="userSpaceOnUse"><stop stopColor="#FF5091"/><stop offset="1" stopColor="#E03071"/></linearGradient></defs><rect x="4" y="10" width="32" height="20" rx="4" fill="url(#coc-a)"/><circle cx="12" cy="20" r="3" fill="white"/><circle cx="20" cy="20" r="3" fill="white"/><circle cx="28" cy="20" r="3" fill="white"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><rect x="4" y="10" width="32" height="20" rx="4" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><circle cx="12" cy="20" r="3" stroke="#C4CCD8" strokeWidth="1" fill="none"/><circle cx="20" cy="20" r="3" stroke="#C4CCD8" strokeWidth="1" fill="none"/><circle cx="28" cy="20" r="3" stroke="#C4CCD8" strokeWidth="1" fill="none"/></svg>),
    row: 1, col: 4,
    color: '#FF5091',
    connectsTo: ['ordenes'],
    layoutOverrides: {
      tpv: { row: 3, col: 5 }, // Under Ordenes
    },
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
    layoutOverrides: {
      tpv: { row: 3, col: 3 }, // Direct under Pagos
    },
  },
  {
    id: 'enrutamiento',
    name: 'Enrutamiento',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="enr-a" x1="4" y1="20" x2="36" y2="20" gradientUnits="userSpaceOnUse"><stop stopColor="#9B66FF"/><stop offset="1" stopColor="#0073E6"/></linearGradient></defs><path d="M4 20h6l5-14 10 28 5-14h6" stroke="url(#enr-a)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><path d="M4 20h6l5-14 10 28 5-14h6" stroke="#C4CCD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>),
    row: 3, col: 2,
    color: '#9B66FF',
    connectsTo: ['pagos'],
    sendsTo: ['clabe_a', 'clabe_b', 'clabe_c'],
    layoutOverrides: {
      tpv: { row: 4, col: 3 }, // Under Dinero
    },  },
  {
    id: 'pagos',
    name: 'Pagos',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="pag-a" x1="20" y1="6" x2="20" y2="34" gradientUnits="userSpaceOnUse"><stop stopColor="#00D924"/><stop offset="1" stopColor="#00A600"/></linearGradient></defs><rect x="2" y="8" width="36" height="24" rx="4" fill="url(#pag-a)"/><path d="M2 16h36" stroke="white" strokeWidth="3"/><rect x="6" y="24" width="10" height="4" rx="1" fill="white" fillOpacity="0.5"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><rect x="2" y="8" width="36" height="24" rx="4" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><path d="M2 16h36" stroke="#C4CCD8" strokeWidth="1.5"/></svg>),
    row: 1, col: 2,
    color: '#00D924',
    connectsTo: ['tpv', 'qr'], // Dashboard link removed per request
    sendsTo: ['dinero', 'propinas'],
    layoutOverrides: {
      dashboard: { row: 5, col: 3 }, // Bottom of Dashboard
      tpv: { row: 2, col: 3 }, // Row 2, Col 3 (Pushed Down)
    },
  },
  {
    id: 'propinas',
    name: 'Propinas',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="prop-a" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#FFD748"/><stop offset="1" stopColor="#FFC148"/></linearGradient></defs><circle cx="20" cy="20" r="16" fill="url(#prop-a)"/><path d="M20 10v20M26 15h-8a3 3 0 000 6h4a3 3 0 010 6h-8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><circle cx="20" cy="20" r="16" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><path d="M20 10v20M26 15h-8a3 3 0 000 6h4a3 3 0 010 6h-8" stroke="#C4CCD8" strokeWidth="1.5" strokeLinecap="round"/></svg>),
    row: 2, col: 3,
    color: '#FFD748',
    connectsTo: ['pagos'],
    layoutOverrides: {
      tpv: { row: 3, col: 2 }, // Left of Dinero
    },
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
    connectsTo: ['tpv', 'qr'],
  },
  {
    id: 'clientes',
    name: 'Clientes',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="cli-a" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#0073E6"/><stop offset="1" stopColor="#00299C"/></linearGradient></defs><circle cx="20" cy="14" r="6" fill="url(#cli-a)"/><path d="M8 32c0-6 6-10 12-10s12 4 12 10" stroke="url(#cli-a)" strokeWidth="3" strokeLinecap="round"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><circle cx="20" cy="14" r="6" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><path d="M8 32c0-6 6-10 12-10s12 4 12 10" stroke="#C4CCD8" strokeWidth="1.5" strokeLinecap="round"/></svg>),
    row: 2, col: 0,
    color: '#0073E6',
    // connectsTo dashboard handled by dashboard sendsTo
    layoutOverrides: {
      dashboard: { row: 3, col: 5 }, // Far Right
      tpv: { row: 1, col: 4 }, // Row 1, Col 4 (Inventario slot?)
    },
  },
  {
    id: 'promos',
    name: 'Promos',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="pro-a" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#FF5091"/><stop offset="1" stopColor="#E03071"/></linearGradient></defs><path d="M20 4l4 8 8 2-6 6 2 9-8-4-8 4 2-9-6-6 8-2 4-8z" fill="url(#pro-a)"/><rect x="14" y="14" width="12" height="12" rx="2" fill="white" fillOpacity="0.3"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><path d="M20 4l4 8 8 2-6 6 2 9-8-4-8 4 2-9-6-6 8-2 4-8z" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/></svg>),
    row: 2, col: 1,
    color: '#FF5091',
    // connectsTo dashboard handled by dashboard sendsTo
    layoutOverrides: {
      dashboard: { row: 2, col: 1 }, // Top Left Diagonal
    },
  },

  // === ROW 3: Banks and Staff ===
  {
    id: 'clabe_a',
    name: 'Cuenta Clabe "A"',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><rect x="4" y="8" width="32" height="24" rx="4" fill="#FF4444"/><text x="20" y="25" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">A</text></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><rect x="4" y="8" width="32" height="24" rx="4" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><text x="20" y="25" fill="#C4CCD8" fontSize="12" fontWeight="bold" textAnchor="middle">A</text></svg>),
    row: 4, col: 1,
    color: '#FF4444',
    connectsTo: ['enrutamiento'],
    layoutOverrides: {
      tpv: { row: 5, col: 2 }, // Row 5, Col 2
    },
  },
  {
    id: 'clabe_b',
    name: 'Cuenta Clabe "B"',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><rect x="4" y="8" width="32" height="24" rx="4" fill="#0073E6"/><text x="20" y="25" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">B</text></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><rect x="4" y="8" width="32" height="24" rx="4" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><text x="20" y="25" fill="#C4CCD8" fontSize="12" fontWeight="bold" textAnchor="middle">B</text></svg>),
    row: 4, col: 2,
    color: '#0073E6',
    connectsTo: ['enrutamiento'],
    layoutOverrides: {
      tpv: { row: 5, col: 3 }, // Row 5, Col 3 (Center)
    },
  },
  {
    id: 'clabe_c',
    name: 'Cuenta Clabe "C"',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><rect x="4" y="8" width="32" height="24" rx="4" fill="#00D924"/><text x="20" y="25" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">C</text></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><rect x="4" y="8" width="32" height="24" rx="4" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><text x="20" y="25" fill="#C4CCD8" fontSize="12" fontWeight="bold" textAnchor="middle">C</text></svg>),
    row: 4, col: 3,
    color: '#00D924',
    connectsTo: ['enrutamiento'],
    layoutOverrides: {
      tpv: { row: 5, col: 4 }, // Row 5, Col 4
    },
  },
  {
    id: 'staff',
    name: 'Personal',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="staff-a" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#FF5091"/><stop offset="1" stopColor="#E03071"/></linearGradient></defs><circle cx="14" cy="12" r="6" fill="url(#staff-a)"/><circle cx="28" cy="12" r="5" fill="url(#staff-a)" fillOpacity="0.6"/><path d="M4 36v-4a8 8 0 018-8h8a8 8 0 018 8v4" fill="url(#staff-a)"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><circle cx="14" cy="12" r="6" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><circle cx="28" cy="12" r="5" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/></svg>),
    row: 3, col: 3,
    color: '#FF5091',
    connectsTo: ['tpv'],
    layoutOverrides: {
      dashboard: { row: 3, col: 1 }, // Left Inner
      tpv: { row: 1, col: 0 }, // Row 1, Col 0
    },
  },
  {
    id: 'turnos',
    name: 'Turnos',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="turn-a" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#FFD748"/><stop offset="1" stopColor="#FF8F17"/></linearGradient></defs><circle cx="20" cy="20" r="16" stroke="url(#turn-a)" strokeWidth="3"/><path d="M20 10v10l6 6" stroke="url(#turn-a)" strokeWidth="3" strokeLinecap="round"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><circle cx="20" cy="20" r="16" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><path d="M20 10v10l6 6" stroke="#C4CCD8" strokeWidth="1.5" strokeLinecap="round"/></svg>),
    row: 3, col: 4,
    color: '#FFD748',
    // connectsTo dashboard handled by dashboard sendsTo
    layoutOverrides: {
      dashboard: { row: 5, col: 2 }, // Bottom Left Outer
    },
  },
  {
    id: 'impresora',
    name: 'Impresora',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="imp-a" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#9B66FF"/><stop offset="1" stopColor="#6E00F5"/></linearGradient></defs><rect x="10" y="4" width="20" height="10" rx="2" fill="url(#imp-a)" fillOpacity="0.3"/><rect x="4" y="14" width="32" height="14" rx="3" fill="url(#imp-a)"/><rect x="10" y="28" width="20" height="10" rx="2" fill="url(#imp-a)" fillOpacity="0.3"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><rect x="10" y="4" width="20" height="10" rx="2" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><rect x="4" y="14" width="32" height="14" rx="3" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><rect x="10" y="28" width="20" height="10" rx="2" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/></svg>),
    row: 3, col: 5,
    color: '#9B66FF',
    connectsTo: ['ordenes'],
    layoutOverrides: {
      tpv: { row: 3, col: 4 }, // Left of Cocina
    },
  },

  // === ROW 4: Dashboard and analytics ===
  {
    id: 'analytics',
    name: 'Analytics',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="ana-a" x1="20" y1="6" x2="20" y2="36" gradientUnits="userSpaceOnUse"><stop stopColor="#9B66FF"/><stop offset="1" stopColor="#6E00F5"/></linearGradient></defs><rect x="6" y="20" width="8" height="14" rx="2" fill="url(#ana-a)"/><rect x="16" y="14" width="8" height="20" rx="2" fill="url(#ana-a)"/><rect x="26" y="6" width="8" height="28" rx="2" fill="url(#ana-a)"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><rect x="6" y="20" width="8" height="14" rx="2" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><rect x="16" y="14" width="8" height="20" rx="2" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><rect x="26" y="6" width="8" height="28" rx="2" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/></svg>),
    row: 4, col: 0,
    color: '#9B66FF',
    // connectsTo dashboard handled by dashboard sendsTo
    layoutOverrides: {
      dashboard: { row: 1, col: 1 }, // Top Left Inner
    },
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
    sendsTo: ['reportes', 'chatbot', 'inventario', 'analytics', 'saldos', 'turnos', 'staff', 'resenas', 'pagos', 'clientes', 'promos', 'personal'],
    layoutOverrides: {
      dashboard: { row: 3, col: 3 }, // Center
    },
  },
  {
    id: 'saldos',
    name: 'Saldos',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="sal-a" x1="20" y1="8" x2="20" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#00D924"/><stop offset="1" stopColor="#00A600"/></linearGradient></defs><rect x="4" y="10" width="32" height="20" rx="4" fill="url(#sal-a)"/><path d="M4 16h32" stroke="white" strokeWidth="2"/><circle cx="30" cy="24" r="3" fill="white"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><rect x="4" y="10" width="32" height="20" rx="4" stroke="#C4CCD8" strokeWidth="1.5" fill="none"/><path d="M4 16h32" stroke="#C4CCD8" strokeWidth="1.5"/></svg>),
    row: 4, col: 4,
    color: '#00D924',
    // connectsTo dashboard handled by dashboard sendsTo
    layoutOverrides: {
      dashboard: { row: 5, col: 4 }, // Bottom Right Outer
    },
  },
  {
    id: 'offline',
    name: 'Offline',
    icon: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><defs><linearGradient id="off-a" x1="20" y1="6" x2="20" y2="34" gradientUnits="userSpaceOnUse"><stop stopColor="#11EFE3"/><stop offset="1" stopColor="#21CFE0"/></linearGradient></defs><path d="M6 20a14 14 0 0128 0" stroke="url(#off-a)" strokeWidth="3" strokeLinecap="round"/><path d="M12 25a7 7 0 0116 0" stroke="url(#off-a)" strokeWidth="3" strokeLinecap="round"/><circle cx="20" cy="32" r="3" fill="url(#off-a)"/></svg>),
    iconDimmed: (<svg viewBox="0 0 40 40" fill="none" className="w-6 h-6"><path d="M6 20a14 14 0 0128 0" stroke="#C4CCD8" strokeWidth="2" strokeLinecap="round"/><path d="M12 25a7 7 0 0116 0" stroke="#C4CCD8" strokeWidth="2" strokeLinecap="round"/></svg>),
    row: 4, col: 5,
    color: '#11EFE3',
    connectsTo: ['tpv'],
    layoutOverrides: {
      tpv: { row: 1, col: 2 }, // Row 1, Col 2
    },
  },
];



// Product card - Stripe-style hover pattern
const ProductCard: React.FC<{
  product: Product;
  isActive: boolean;
  onHover: (id: string | null) => void;
  gridPos: { x: number; y: number };
}> = ({ product, isActive, onHover, gridPos }) => {
  const isPillar = product.isPillar;
  const size = isPillar ? CARD_SIZE + 16 : CARD_SIZE;
  const offset = isPillar ? -8 : 0;
  
  // Custom styles for Pillars (TPV, QR, Dashboard) to make them stand out
  const pillarStyles = isPillar && isActive ? {
    boxShadow: `0 10px 25px -5px ${product.color}30, 0 8px 10px -6px ${product.color}20`, // Colored glow
    borderColor: product.color,
  } : {};

  return (
    <div
      className={`absolute flex flex-col items-center justify-center rounded-2xl transition-all duration-300 cursor-pointer
                 ${isActive 
                   ? isPillar 
                      ? 'bg-[#1a1a1a] border-2 shadow-2xl' // Pillars: Black BG, Thicker border
                      : 'bg-white shadow-lg border border-gray-200' 
                   : 'bg-white/80 border border-gray-100/80 hover:bg-white hover:shadow-md hover:border-gray-200'}`}
      style={{
        left: gridPos.x + offset,
        top: gridPos.y + offset,
        width: size,
        height: size,
        zIndex: isActive ? 30 : isPillar ? 25 : 10,
        ...pillarStyles
      }}
      onMouseEnter={() => onHover(product.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Icon - outline when inactive, colorful when active */}
      <div className={`flex items-center justify-center transition-all duration-300 ${isPillar && isActive ? 'scale-110' : ''}`}>
        {isActive ? product.icon : product.iconDimmed}
      </div>
      
      {/* Label - only visible when active */}
      <span 
        className={`text-[10px] font-medium text-center mt-1.5 transition-all duration-300
                   ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
                   ${isPillar ? 'font-bold text-xs text-white' : 'text-gray-700'} `} 
      >
        {product.name}
      </span>
    </div>
  );
};

// --- SMART ROUTING LOGIC ---
interface GridPoint { row: number; col: number }

const findSmartPath = (start: GridPoint, end: GridPoint, obstacles: GridPoint[]): GridPoint[] => {
  // 1. Setup Grid
  const rows = 6;
  const cols = 6;
  const obstacleMap = new Set<string>();
  obstacles.forEach(p => obstacleMap.add(`${p.row},${p.col}`));
  
  // Remove start/end from obstacles to allow movement out/in
  obstacleMap.delete(`${start.row},${start.col}`);
  obstacleMap.delete(`${end.row},${end.col}`);

  // 2. BFS
  const queue: { pos: GridPoint; path: GridPoint[] }[] = [{ pos: start, path: [start] }];
  const visited = new Set<string>();
  visited.add(`${start.row},${start.col}`);

  while (queue.length > 0) {
    const { pos, path } = queue.shift()!;

    if (pos.row === end.row && pos.col === end.col) {
      return path;
    }

    const directions = [
      { r: 0, c: 1 },  // Right
      { r: 0, c: -1 }, // Left
      { r: 1, c: 0 },  // Down
      { r: -1, c: 0 }  // Up
    ];

    for (const d of directions) {
      const next: GridPoint = { row: pos.row + d.r, col: pos.col + d.c };
      const key = `${next.row},${next.col}`;

      // Check bounds
      if (next.row >= 0 && next.row < rows && next.col >= 0 && next.col < cols) {
        // Check obstacles and visited
        if (!obstacleMap.has(key) && !visited.has(key)) {
          visited.add(key);
          queue.push({ pos: next, path: [...path, next] });
        }
      }
    }
  }

  // Fallback: Direct line (Manhattan) if no path found (shouldn't happen in valid layouts)
  return [start, { row: start.row, col: end.col }, end];
};

// Animated connection with SMART ROUTING
const AnimatedConnection: React.FC<{
  fromGrid: GridPoint;
  toGrid: GridPoint;
  obstacles: GridPoint[];
  fromColor: string;
  toColor: string;
  id: string;
  isActive: boolean;
}> = ({ fromGrid, toGrid, obstacles, fromColor, toColor, id, isActive }) => {
  // Solve Path
  const gridPath = findSmartPath(fromGrid, toGrid, obstacles);

  // Convert Grid Points to SVG Path
  const R = 15; // Corner radius
  let d = '';

  if (gridPath.length < 2) return null;

  const getPixel = (p: GridPoint) => ({
    x: p.col * (CARD_SIZE + GAP) + CARD_SIZE / 2,
    y: p.row * (CARD_SIZE + GAP) + CARD_SIZE / 2
  });
  
  // Calculate clipped start/end points (stop at card edge)
  const fullStart = getPixel(gridPath[0]);
  const fullEnd = getPixel(gridPath[gridPath.length - 1]);
  
  // Only trim if path actually moves
  // Unit vector for first segment
  const startNext = getPixel(gridPath[1] || gridPath[0]);
  const dxs = startNext.x - fullStart.x;
  const dys = startNext.y - fullStart.y;
  const lenS = Math.sqrt(dxs*dxs + dys*dys);
  
  // Trim start by radius (approx 45px) + slight gap
  const TRIM = 48;
  const start = lenS > 0 ? {
    x: fullStart.x + (dxs/lenS) * TRIM,
    y: fullStart.y + (dys/lenS) * TRIM
  } : fullStart;

  // Unit vector for last segment
  const endPrev = getPixel(gridPath[gridPath.length - 2] || gridPath[gridPath.length - 1]);
  const dxE = fullEnd.x - endPrev.x;
  const dyE = fullEnd.y - endPrev.y;
  const lenE = Math.sqrt(dxE*dxE + dyE*dyE);
  
  // Trim end by radius
  // Note: we want point BEFORE fullEnd
  const end = lenE > 0 ? {
      x: fullEnd.x - (dxE/lenE) * TRIM, 
      y: fullEnd.y - (dyE/lenE) * TRIM
  } : fullEnd;
  
  // Reconstruct path with trimmed endpoints
  // If only 2 points, just draw straight line from trimmed start to trimmed end
  if (gridPath.length === 2) {
      d = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  } else {
      d = `M ${start.x} ${start.y}`;
      // Draw intermediate points normally
      // But for smooth Q curves, we need the logic.
      // Easiest: Treat 'start' as the end of segment 0? No.
      // We essentially just replace the first 'M' and the last 'L' with new coords.
      // But the loop iterates 1..length.
      
      // Let's modify the loop logic to handle end trim?
      // Or easier: Build standard path string, then regex replace? No, tedious.
      
      // Better: Just use the smoothing loop but override first/last
      
      for (let i = 1; i < gridPath.length - 1; i++) {
        // ... (Same smoothing logic) ...
        const prev = i===1 ? start : getPixel(gridPath[i-1]); // Use trimmed start if i=1? 
        // Wait, the loop uses 'curr', 'prev', 'next'.
        // If i=1, prev is gridPath[0]. 
        // We want the line to come FROM 'start'.
        
        const curr = getPixel(gridPath[i]);
        const next = getPixel(gridPath[i+1]);
        
        // Incoming vector
        // If i=1, we draw line from START (trimmed) to ... curve start.
        
        // Let's simplify:
        // Just draw lines to corners.
        // M start
        // L ...
        // L end
        
        // Reset d
      }
      
      // Let's rewrite the smoothing loop to be robust with trimmed points
      d = `M ${start.x} ${start.y}`;
      
      // Safer loop for path construction
      for (let i = 1; i < gridPath.length - 1; i++) {
          const curr = getPixel(gridPath[i]);
          const next = getPixel(gridPath[i+1]);
          const prev = getPixel(gridPath[i-1]);

          // Vector incoming
          const vx1 = curr.x - prev.x;
          const vy1 = curr.y - prev.y;
          // Vector outgoing
          const vx2 = next.x - curr.x;
          const vy2 = next.y - curr.y;

          // Check if turn
          const isTurn = (vx1 !== 0 && vy2 !== 0) || (vy1 !== 0 && vx2 !== 0);

          if (isTurn) {
               const len1 = Math.sqrt(vx1*vx1 + vy1*vy1);
               const len2 = Math.sqrt(vx2*vx2 + vy2*vy2);
               
               if (len1 === 0 || len2 === 0) {
                 d += ` L ${curr.x} ${curr.y}`;
                 continue;
               }

               const r1 = Math.min(R, len1/2);
               const r2 = Math.min(R, len2/2);

               const bx = curr.x - (vx1/len1)*r1;
               const by = curr.y - (vy1/len1)*r1;
               
               const ax = curr.x + (vx2/len2)*r2;
               const ay = curr.y + (vy2/len2)*r2;

               d += ` L ${bx} ${by} Q ${curr.x} ${curr.y} ${ax} ${ay}`;
          } else {
             d += ` L ${curr.x} ${curr.y}`;
          }
      }
      // Add final segment to trimmed end
      d += ` L ${end.x} ${end.y}`;

  }
  
  // Smoothing Logic (Refined)
  // If we have A -> B -> C forming a 90deg turn, we modify the L to B to be L (B-r) Q B (B+r).
  if (gridPath.length > 2) {
    d = `M ${start.x} ${start.y}`;
    for (let i = 1; i < gridPath.length - 1; i++) {
        const prev = getPixel(gridPath[i-1]);
        const curr = getPixel(gridPath[i]);
        const next = getPixel(gridPath[i+1]);
        
        // Incoming vector
        const vx1 = curr.x - prev.x;
        const vy1 = curr.y - prev.y;
        
        // Outgoing vector
        const vx2 = next.x - curr.x;
        const vy2 = next.y - curr.y;
        
        // Normalize for checks (moves are always axis aligned)
        // If direction changes, curve.
        const isTurn = (vx1 !== 0 && vy2 !== 0) || (vy1 !== 0 && vx2 !== 0);
        
        if (isTurn) {
            // Stop R pixels before curr
            // incoming len
            const len1 = Math.sqrt(vx1*vx1 + vy1*vy1);
            const r1 = Math.min(R, len1/2);
            
            // Point before turn
            const bx = curr.x - (vx1/len1)*r1;
            const by = curr.y - (vy1/len1)*r1;
            
            d += ` L ${bx} ${by}`;
            
            // Point after turn
            const len2 = Math.sqrt(vx2*vx2 + vy2*vy2);
            const r2 = Math.min(R, len2/2);
            const ax = curr.x + (vx2/len2)*r2;
            const ay = curr.y + (vy2/len2)*r2;
            
            d += ` Q ${curr.x} ${curr.y} ${ax} ${ay}`;
        } else {
            // Straight through
             d += ` L ${curr.x} ${curr.y}`;
        }
    }
    // Final segment
    const last = getPixel(gridPath[gridPath.length-1]);
    d += ` L ${last.x} ${last.y}`;
  }

  // STRIPE-INSPIRED GRADIENTS
  const gradients = [
    ['#11EFE3', '#9966FF'], // Cyan -> Purple
    ['#11EFE3', '#0073E6'], // Cyan -> Blue
    ['#0073e6', '#ff80ff'], // Blue -> Pink
    ['#ff5996', '#9966ff'], // Pink -> Purple
    ['#FFD848', '#00D924'], // Yellow -> Green
  ];
  
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const [gradStart, gradEnd] = gradients[hash % gradients.length];

  return (
    <>
      <defs>
        <linearGradient id={`grad-${id}`} gradientUnits="userSpaceOnUse" x1={start.x} y1={start.y} x2={getPixel(gridPath[gridPath.length-1]).x} y2={getPixel(gridPath[gridPath.length-1]).y}>
          <stop offset="0%" stopColor={gradStart} />
          <stop offset="100%" stopColor={gradEnd} />
        </linearGradient>
        <style>{`
          @keyframes dash-flow-loop {
            to { stroke-dashoffset: -60px; }
          }
        `}</style>
      </defs>
      <motion.path 
        d={d} 
        fill="none" 
        stroke={`url(#grad-${id})`} 
        strokeWidth="4" 
        opacity={isActive ? 0.3 : 0}
        animate={{ d }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      {/* Animated flow */}
      <motion.path 
        d={d} 
        fill="none" 
        stroke={`url(#grad-${id})`} 
        strokeWidth="4" 
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ d }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          strokeDasharray: '20 40',
          animation: isActive ? `dash-flow-loop 1.5s linear infinite` : 'none',
          opacity: isActive ? 1 : 0,
        }}
      />
    </>
  );
};
  
// Main component
export const PaymentRouting: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedPillar, setSelectedPillar] = useState('todo'); // Default to 'todo'
  const [autoScrollIndex, setAutoScrollIndex] = useState(0); // Kept for types but unused for logic
  
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const titleOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.1], [30, 0]);
  const gridOpacity = useTransform(scrollYProgress, [0.1, 0.2], [0, 1]);

  const pillars = ['todo', 'tpv', 'qr', 'dashboard'];
  
  // Removed auto-scroll rotation to respect user choice "Todo" as default
  
  // Logic: hoveredCard overrides selection
  const activePillar = hoveredCard ? null : selectedPillar;

  // Get connections based on hovered card or active pillar
  const getActiveState = useCallback(() => {
    const activeCards = new Set<string>();
    const connections: { from: string; to: string; fromColor: string; toColor: string }[] = [];

    // Helper to add downstream connections recursively
    const addDownstream = (sourceId: string, sourceProduct: Product) => {
      if (sourceProduct.sendsTo) {
        sourceProduct.sendsTo.forEach(targetId => {
          // EXCLUSION LOGIC:
          // If in 'dashboard' view, exclude internal routing nodes (Enrutamiento, CLABEs)
          const isExcluded = selectedPillar === 'dashboard' && 
                             ['enrutamiento', 'clabe_a', 'clabe_b', 'clabe_c'].includes(targetId);

          if (isExcluded) return;

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

    } else if (activePillar === 'todo') {
       // Show EVERYTHING
       PRODUCTS.forEach(p => {
         activeCards.add(p.id);
         // Add connections for everything
         addDownstream(p.id, p);
       });
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

  // Dynamic Layout Logic
  const getLayout = useCallback((p: Product) => {
    if (p.layoutOverrides && selectedPillar && p.layoutOverrides[selectedPillar]) {
      return p.layoutOverrides[selectedPillar];
    }
    return { row: p.row, col: p.col };
  }, [selectedPillar]);

  const getPixelPos = useCallback((p: Product) => {
    const { row, col } = getLayout(p);
    return { x: col * (CARD_SIZE + GAP) + CARD_SIZE / 2, y: row * (CARD_SIZE + GAP) + CARD_SIZE / 2 };
  }, [getLayout]);

  const getGridPos = useCallback((p: Product) => {
    const { row, col } = getLayout(p);
    return { x: col * (CARD_SIZE + GAP), y: row * (CARD_SIZE + GAP) };
  }, [getLayout]);

  // SCROLL-BASED SELECTION
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Only auto-select if user isn't hovering
    if (!hoveredCard) {
      if (latest < 0.3) {
        if (selectedPillar !== 'tpv') setSelectedPillar('tpv');
      } else if (latest < 0.6) {
        if (selectedPillar !== 'qr') setSelectedPillar('qr');
      } else {
        if (selectedPillar !== 'dashboard') setSelectedPillar('dashboard');
      }
    }
  });

  // SMART ROUTING: Calculate all obstacles (visible cards)
  const currentObstacles = React.useMemo(() => {
    return PRODUCTS.filter(p => {
       const isActive = activeCards.has(p.id);
       // Visible if 'todo' OR isActive is true
       return selectedPillar === 'todo' || isActive;
    }).map(p => getLayout(p));
  }, [getLayout, activeCards, selectedPillar]);

  // Dynamic scale based on viewport - like Square does
  const [dynamicScale, setDynamicScale] = React.useState(1);
  
  React.useEffect(() => {
    const calculateScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      
      // Available height for diagram: viewport - navbar (80px) - header text (~120px) - padding
      const availableHeight = vh - 80 - 140 - 40; // navbar + header + margins
      const isTightDesktop = vw >= 1024 && vw < 1280;
      const availableWidth = vw < 1024 ? vw - 32 : (vw - 64) * (isTightDesktop ? 0.6 : 0.62); // Accounting for PR-8 padding
      
      // Calculate scale to fit both dimensions
      const scaleForHeight = Math.min(1, availableHeight / GRID_HEIGHT);
      const scaleForWidth = Math.min(1, availableWidth / GRID_WIDTH);
      
      // Use the smaller scale to ensure it fits both ways
      let scale = Math.min(scaleForHeight, scaleForWidth);
      
      // Clamp between 0.25 and 0.95 to avoid edge-to-edge look
      scale = Math.max(0.25, Math.min(0.95, scale));
      
      setDynamicScale(scale);
    };
    
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  // Pillars
  tpv: "Terminal Punto de Venta potente y flexible. Cobra con tarjeta, efectivo y vales desde cualquier dispositivo.",
  qr: "Genera códigos QR dinámicos para cobros sin contacto. Seguro, rápido y sin hardware adicional.",
  dashboard: "Tu centro de comando. Gestiona ventas, personal, inventario y clientes desde una sola pantalla.",
  
  // Features
  reportes: "Analítica en tiempo real. Entiende qué vendes más, cuándo y quiénes son tus mejores clientes.",
  chatbot: "Asistente IA 24/7 que resuelve dudas de tu staff y te ayuda a configurar tu sistema.",
  inventario: "Control de stock inteligente. Recibe alertas de productos bajos y gestiona proveedores.",
  mesas: "Plano visual de tu restaurante. Asigna mesas, une cuentas y gestiona zonas fácilmente.",
  ordenes: "Sistema de comandas unificado. Envía pedidos a cocina instantáneamente sin errores.",
  cocina: "KDS (Kitchen Display System) para optimizar el flujo de trabajo en tu cocina.",
  pagos: "Acepta todas las tarjetas, billeteras digitales y vales de despensa con las mejores tasas.",
  propinas: "Gestión transparente de propinas. Calcula y reparte automáticamente entre tu personal.",
  dinero: "Flujo de caja claro. conciliación automática y depósitos rápidos a tu cuenta.",
  enrutamiento: "Control total. Tú eliges en la terminal a qué cuenta enviar cada pago (Socios, Gastos, Ahorro) al momento de cobrar.",
  personal: "Control de asistencia, roles y permisos granulares para cada miembro de tu equipo.",
  impresora: "Configura impresoras de tickets para barra, cocina y caja de forma inalámbrica.",
  offline: "Nunca dejes de vender. Modo offline que guarda transacciones y sincroniza al volver la conexión.",
  clabe_a: "Cuenta CLABE Principal. Recibe fondos operativos generales.",
  clabe_b: "Cuenta Secundaría. Separa ingresos para socios o proveedores específicos.",
  clabe_c: "Cuenta de Reserva. Automatiza el ahorro o fondos para gastos fijos.",
  split: "Divide la cuenta fácilmente por personas, montos o items específicos.",
  resenas: "Recopila feedback de clientes y mejora tu servicio con encuestas integradas.",
  saldos: "Consulta tus saldos disponibles y movimientos en tiempo real.",
  turnos: "Apertura y cierre de caja simplificado con reportes por turno.",
};

  // Track mobile state
  const [isMobile, setIsMobile] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState<string | null>(null);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile(); // Check on mount
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update description when hover/select changes
  React.useEffect(() => {
    if (hoveredCard) {
      setSelectedDescription(FEATURE_DESCRIPTIONS[hoveredCard] || "Gestiona tu negocio con esta funcionalidad integrada.");
    } else if (activePillar && !hoveredCard) {
       // Show pillar description or general text
       setSelectedDescription(FEATURE_DESCRIPTIONS[activePillar] || "Selecciona una función para ver más detalles.");
    }
  }, [hoveredCard, activePillar]);


  return (
    <div ref={containerRef} className="relative h-auto lg:h-[250vh] z-0" style={{ backgroundColor: '#f6f9fc' }}>
      <div className="relative lg:sticky top-0 lg:top-16 h-auto lg:h-[calc(100vh-4rem)] flex items-start lg:items-center z-10 py-8 lg:py-0">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 w-full h-full flex flex-col">
          <div className="flex flex-col lg:grid lg:grid-cols-[35%_65%] gap-2 lg:gap-8 items-start lg:items-center flex-1 h-full">
            <div className="space-y-2 lg:space-y-8 w-full flex-shrink-0">
              {/* Header - Compact on mobile/tablet */}
              <motion.div style={{ opacity: titleOpacity, y: titleY }} className="space-y-1 lg:space-y-2">
                <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold tracking-tight" style={{ color: '#1d1d1f', lineHeight: '1.1' }}>
                  Una suite integrada
                </h2>
                <p className="text-sm lg:text-lg" style={{ color: '#86868b', fontWeight: 400 }}>
                  Todo lo que necesitas para gestionar tu negocio
                </p>
              </motion.div>

              {/* Tab Navigation - Pill Style */}
              <motion.div style={{ opacity: gridOpacity }}>
                <div className="inline-flex p-1 rounded-full border border-white/10" style={{ backgroundColor: '#1a1a1a' }}>
                  {pillars.map((p) => {
                    const isActive = hoveredCard === p || (!hoveredCard && activePillar === p);
                    const pillarNames = { todo: 'Todo', tpv: 'TPV', qr: 'QR', dashboard: 'Dashboard' };
                    const pillarNamesLong = { todo: 'Todo', tpv: 'TPV Móvil', qr: 'Pagos QR', dashboard: 'Dashboard' };
                    return (
                      <button
                        key={p}
                        onClick={() => setSelectedPillar(p)} // Click to select
                        onMouseEnter={() => setHoveredCard(p === 'todo' ? null : p)}
                        onMouseLeave={() => setHoveredCard(null)}
                        className="px-4 py-2 lg:px-6 lg:py-2.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-300"
                        style={{
                          backgroundColor: isActive ? '#ffffff' : 'transparent',
                          color: isActive ? '#000000' : '#888888',
                          boxShadow: isActive ? '0 2px 10px rgba(0,0,0,0.2)' : 'none',
                        }}
                      >
                        <span className="lg:hidden">{pillarNames[p as keyof typeof pillarNames]}</span>
                        <span className="hidden lg:inline">{pillarNamesLong[p as keyof typeof pillarNamesLong]}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
            
            {/* MOBILE/TABLET: Split Screen Layout */}
            {isMobile ? (
              <motion.div style={{ opacity: gridOpacity }} className="w-full flex-1 flex flex-col min-h-0">
                {/* Top: Grid (scrollable if needed, max height limited) */}
                <div className="flex-shrink-0 w-full p-2">
                  <div className="grid grid-cols-4 md:grid-cols-5 gap-3 md:gap-4 p-2">
                    {PRODUCTS.filter(p => activeCards.has(p.id) || !hoveredCard && !activePillar).map((p) => {
                      const isActive = activeCards.has(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => setHoveredCard(p.id)}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 relative group aspect-square
                            ${isActive ? 'bg-white shadow-[0_12px_24px_rgba(0,0,0,0.08)] ring-1 ring-black/5 transform scale-105 z-10' : 'bg-gray-50 hover:bg-white hover:shadow-sm'}
                          `}
                        >
                          <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mb-2 transition-transform duration-300 ${isActive ? 'scale-110' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                            {p.icon}
                          </div>
                          <span 
                            className={`text-[10px] md:text-xs font-semibold text-center leading-tight tracking-tight line-clamp-2 px-1
                                ${isActive ? 'text-black' : 'text-gray-500'}
                            `}
                          >
                            {p.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom: Details Panel (Streamlined) */}
                <div className="flex-1 bg-white border border-gray-100 p-6 md:p-8 flex flex-col justify-center gap-8 z-20 min-h-0 rounded-3xl mx-4 mb-4 shadow-xl">
                  <div className="flex items-start gap-5">
                     {/* Large Icon Preview */}
                     <div className="w-16 h-16 p-3 bg-gray-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                        {hoveredCard && PRODUCTS.find(p => p.id === hoveredCard)?.icon || 
                         PRODUCTS.find(p => p.id === activePillar)?.icon}
                     </div>
                     <div className="flex-1 min-w-0">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-2">
                            {hoveredCard ? PRODUCTS.find(p => p.id === hoveredCard)?.name : 
                             activePillar === 'tpv' ? 'TPV Móvil' : 
                             activePillar === 'qr' ? 'Pagos QR' : 'Dashboard'}
                        </h3>
                        <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                            {selectedDescription}
                        </p>
                     </div>
                  </div>
                  

                </div>
              </motion.div>
            ) : (
              /* DESKTOP: Full grid with connections */
              <motion.div style={{ opacity: gridOpacity }} className="flex justify-end w-full lg:pr-8">
                <div 
                  className="origin-top-right transition-transform duration-200"
                  style={{ 
                    transform: `scale(${dynamicScale})`,
                  }}
                >
                  <div className="relative" style={{ width: GRID_WIDTH, height: GRID_HEIGHT }}>
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }} viewBox={`0 0 ${GRID_WIDTH} ${GRID_HEIGHT}`}>
                      {connections.map((c, i) => {
                        const from = productMap[c.from], to = productMap[c.to];
                        if (!from || !to) return null;
                        const fromSize = from.isPillar ? CARD_SIZE + 16 : CARD_SIZE;
                        const toSize = to.isPillar ? CARD_SIZE + 16 : CARD_SIZE;
                        return <AnimatedConnection 
                          key={`${c.from}-${c.to}-${i}`} 
                          id={`${c.from}-${c.to}-${i}`} 
                          fromGrid={getLayout(from)} 
                          toGrid={getLayout(to)} 
                          obstacles={currentObstacles}
                          fromColor={c.fromColor} 
                          toColor={c.toColor} 
                          isActive={true} 
                        />;
                      })}
                    </svg>
                    {PRODUCTS.map((p) => {
                      const isActive = activeCards.has(p.id);
                      // If 'Todo' is selected: show all (dim inactive).
                      // If Filter selected: Hide completely if not active.
                      const isVisible = selectedPillar === 'todo' || isActive;
                      
                      return (
                        <motion.div 
                           key={p.id}
                           layout="position"
                           transition={{ type: "spring", stiffness: 300, damping: 30 }}
                           style={{ 
                             position: 'absolute', // Ensure absolute so layout prop works with transform
                             opacity: isVisible ? 1 : 0, 
                             zIndex: 20, // Ensure cards are ABOVE svg lines (zIndex 5)
                             pointerEvents: isVisible ? 'auto' : 'none',
                             x: getGridPos(p).x,
                             y: getGridPos(p).y,
                           }}
                        >
                          {/* ProductCard component content handles pure visual */}
                          <ProductCard product={p} isActive={isActive} onHover={setHoveredCard} gridPos={{ x:0, y:0 }} />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
