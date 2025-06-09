/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily : {
        'tonic':['tonic'],
        'svelte':['svelte'],
        'agile':[''],
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)', background: 'purple', color: 'white', opacity: 1  },
          '50%': { transform: 'scale(1.02)', background:'hotpink', color:'lemonchiffon', opacity:0.6  },
        },
      },
      animation: {
        heartbeat: 'heartbeat 1.4s infinite',
      },
    },
  },
  plugins: [],
};
