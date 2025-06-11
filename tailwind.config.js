/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        glass: 'rgba(24, 0, 36, 0.7)',
        purpleGradient: 'linear-gradient(135deg, #7f00ff 0%, #e100ff 100%)',
      },
      backgroundImage: {
        'purple-glass': 'linear-gradient(135deg, #7f00ff 0%, #e100ff 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
