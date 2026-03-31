/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'sk-primary': '#0f766e',
        'sk-primary-dark': '#134e4a',
        'sk-primary-med': '#14b8a6',
        'sk-primary-light': '#5eead4',
        'link-color': '#134e4a',
        'link-color-hover': '#14b8a6',
      },
      typography: {
        DEFAULT: {
          css: {
            a: {
              color: '#134e4a',
              '&:hover': { color: '#14b8a6' },
            },
            code: {
              backgroundColor: '#f1f5f9',
              color: '#334155',
              padding: '0.2rem 0.4rem',
              borderRadius: '0.25rem',
              fontWeight: '400',
              fontSize: '0.85em',
            },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
            pre: {
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              padding: '1rem 1.25rem',
              fontSize: '0.875rem',
              lineHeight: '1.7',
              overflow: 'auto',
            },
            'pre code': {
              backgroundColor: 'transparent',
              color: 'inherit',
              padding: '0',
              borderRadius: '0',
              fontSize: 'inherit',
            },
            img: {
              borderRadius: '0.375rem',
            },
            table: {
              fontSize: '0.875rem',
            },
            'th, td': {
              padding: '0.5rem 0.75rem',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
