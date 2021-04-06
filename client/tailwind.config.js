const plugin = require('tailwindcss/plugin');

module.exports = {
  purge: [],
  darkMode: 'class', // false or 'media' or 'class'
  theme: {
    extend: {
      screens: {
        xsm: '400px',
      },
      colors: {
        'primary': 'var(--primary-color)',
        'secondary': 'var(--secondary-color)',
        'primary-shade': 'var(--primary-color-shade)',
        'secondary-shade': 'var(--secondary-color-shade)',
        'background': 'var(--background-color)',
        'background-inverse': 'var(--background-color-inverse)',
        'background-shade': 'var(--background-color-shade)',
        'success': 'var(--success-color)',
        'text-heading': 'var(--text-heading-color)',
        'text-paragraph': 'var(--text-paragraph-color)',
        'text-heading-inverse': 'var(--text-heading-color-inverse)',
        'text-paragraph-inverse': 'var(--text-paragraph-color-inverse)',
      },
    },
  },
  variants: {
    extend: {
      strokeWidth: ['hover'],
    },
  },
  plugins: [
    plugin(function ({ addUtilities, variants }) {
      const ioniconUtilities = {
        '.ionicon-stroke-16': {
          '--ionicon-stroke-width': '1rem',
        },
        '.ionicon-stroke-32': {
          '--ionicon-stroke-width': '2rem',
        },
        '.ionicon-stroke-48': {
          '--ionicon-stroke-width': '3rem',
        },
        '.ionicon-stroke-64': {
          '--ionicon-stroke-width': '4rem',
        },
      };

      addUtilities(ioniconUtilities, ['hover', 'group-hover']);
    }),
  ],
};
