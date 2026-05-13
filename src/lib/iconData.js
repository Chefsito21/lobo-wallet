import * as Icons from 'lucide-react';

const FALLBACK_ICON = Icons.CircleHelp;

const LEGACY_ICON_MAP = {
  Milk: 'GlassWater',
  Cross: 'Plus',
  Plane: 'PlaneTakeoff',
  Bus: 'BusFront',
  Train: 'TrainFront',
  Ship: 'Sailboat',
  Library: 'BookMarked',
  Projector: 'Presentation'
};

const getIcon = (iconName) => {
  const normalizedName = LEGACY_ICON_MAP[iconName] || iconName;
  return Icons[normalizedName] || FALLBACK_ICON;
};
export const COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
  '#f43f5e',
  '#64748b',
  '#78716c',
  '#000000',
  '#ffffff'
];

export const ICON_CATEGORIES = {
  Finanzas: [
    { id: 'Wallet' },
    { id: 'Banknote' },
    { id: 'PiggyBank' },
    { id: 'CreditCard' },
    { id: 'Coins' },
    { id: 'Landmark' },
    { id: 'TrendingUp' },
    { id: 'TrendingDown' },
    { id: 'Receipt' },
    { id: 'DollarSign' },
    { id: 'PieChart' },
    { id: 'Briefcase' }
  ],

  Transporte: [
    { id: 'Car' },
    { id: 'BusFront' },
    { id: 'TrainFront' },
    { id: 'PlaneTakeoff' },
    { id: 'Bike' },
    { id: 'Sailboat' },
    { id: 'Truck' },
    { id: 'Fuel' },
    { id: 'Navigation' },
    { id: 'Map' },
    { id: 'Compass' },
    { id: 'MapPin' }
  ],

  Compras: [
    { id: 'ShoppingCart' },
    { id: 'ShoppingBag' },
    { id: 'Store' },
    { id: 'Tag' },
    { id: 'Barcode' },
    { id: 'QrCode' },
    { id: 'Gift' },
    { id: 'Package' },
    { id: 'Shirt' },
    { id: 'ShoppingBasket' }
  ],

  'Comida y Bebida': [
    { id: 'Utensils' },
    { id: 'Coffee' },
    { id: 'Pizza' },
    { id: 'Apple' },
    { id: 'Wine' },
    { id: 'Beer' },
    { id: 'GlassWater' },
    { id: 'ChefHat' },
    { id: 'Carrot' }
  ],

  'Hogar y Mantenimiento': [
    { id: 'Home' },
    { id: 'Sofa' },
    { id: 'Bed' },
    { id: 'Bath' },
    { id: 'Hammer' },
    { id: 'Wrench' },
    { id: 'PaintBucket' },
    { id: 'Lightbulb' },
    { id: 'Fan' },
    { id: 'Key' },
    { id: 'DoorOpen' }
  ],

  'Salud y Belleza': [
    { id: 'HeartPulse' },
    { id: 'Stethoscope' },
    { id: 'Pill' },
    { id: 'Syringe' },
    { id: 'Activity' },
    { id: 'Plus' },
    { id: 'Bandage' },
    { id: 'Thermometer' },
    { id: 'Brain' },
    { id: 'Sparkles' },
    { id: 'Smile' },
    { id: 'Droplet' },
    { id: 'Scissors' }
  ],

  Entretenimiento: [
    { id: 'Tv' },
    { id: 'Gamepad2' },
    { id: 'Film' },
    { id: 'Ticket' },
    { id: 'Music' },
    { id: 'Headphones' },
    { id: 'Speaker' },
    { id: 'Mic' },
    { id: 'Clapperboard' },
    { id: 'Radio' },
    { id: 'Presentation' }
  ],

  'Servicios y Facturas': [
    { id: 'FileText' },
    { id: 'FileInvoice' },
    { id: 'Zap' },
    { id: 'Flame' },
    { id: 'Wifi' },
    { id: 'Phone' },
    { id: 'Smartphone' },
    { id: 'Monitor' },
    { id: 'Mail' }
  ],

  'Educación y Rutina': [
    { id: 'GraduationCap' },
    { id: 'BookOpen' },
    { id: 'Pencil' },
    { id: 'BookMarked' },
    { id: 'School' },
    { id: 'Backpack' },
    { id: 'Calculator' },
    { id: 'Calendar' },
    { id: 'Clock' },
    { id: 'Bell' },
    { id: 'Sun' },
    { id: 'Moon' },
    { id: 'CheckCircle' }
  ],

  'Familia, Granja y Otros': [
    { id: 'Users' },
    { id: 'Baby' },
    { id: 'Heart' },
    { id: 'PawPrint' },
    { id: 'Bird' },
    { id: 'Tractor' },
    { id: 'Star' }
  ]
};

export const FLAT_ICONS = Object.values(ICON_CATEGORIES)
  .flat()
  .reduce((acc, { id }) => {
    acc[id] = getIcon(id);
    return acc;
  }, {});

export { getIcon };

