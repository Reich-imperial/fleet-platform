/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#185FA5',
          light: '#E7F0F8',
          dark: '#124B83',
        },
        danger: {
          DEFAULT: '#A32D2D',
          light: '#F6E8E8',
        },
        warning: {
          DEFAULT: '#854F0B',
          light: '#F5EBDD',
        },
        success: {
          DEFAULT: '#27500A',
          light: '#E8F0E0',
        },
        page: '#F4F4F2',
        surface: '#FFFFFF',
        ink: '#1A1A1A',
        muted: '#6B6B68',
        line: '#E5E5E3',
        steel: '#F8F8F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
      },
      borderRadius: {
        badge: '4px',
        input: '6px',
        card: '8px',
      },
    },
  },
  plugins: [],
};
