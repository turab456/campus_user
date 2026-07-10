/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#038F78', // Primary Teal/Green
          hover: '#027a66',
          active: '#026655',
          light: '#ccf2eb',
        },
        secondary: {
          DEFAULT: '#00244B', // Secondary Dark Blue
          hover: '#001a36',
          active: '#001021',
          light: '#cce0f5',
        },
        background: '#FAF8F5', // Primary Background
        backgroundSec: '#F5F3EF', // Secondary Background
        card: '#FFFFFF',
        textDark: '#111827', // Text Primary
        textSec: '#4B5563', // Text Secondary
        muted: '#6B7280', // Muted Text
        borderCustom: '#E5E7EB', // Border
        divider: '#F1F5F9', // Divider
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626', // Error
        neutral: {
          50: '#FAF8F5',
        },
      },
      borderRadius: {
        DEFAULT: '0.625rem', // 10px
        lg: '8px', // Buttons
        xl: '12px', // Cards
        '2xl': '16px', // Images / Modals
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(15, 23, 42, 0.06)',
        'premium': '0 2px 10px rgba(15, 23, 42, 0.06)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      spacing: {
        '8': '2rem',
        '16': '4rem',
      },
    },
  },
}

