import { fontFamily } from 'tailwindcss/defaultTheme'
import containerQueryPlugin from '@tailwindcss/container-queries'

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ['class'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	safelist: ['dark'],
	plugins: [containerQueryPlugin, require('@tailwindcss/typography')],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border) / <alpha-value>)',
				input: 'hsl(var(--input) / <alpha-value>)',
				ring: 'hsl(var(--ring) / <alpha-value>)',
				background: 'hsl(var(--background) / <alpha-value>)',
				foreground: 'hsl(var(--foreground) / <alpha-value>)',
				primary: {
					DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
					foreground: 'hsl(var(--primary-foreground) / <alpha-value>)'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
					foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
					foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
					foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
					foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
					foreground: 'hsl(var(--popover-foreground) / <alpha-value>)'
				},
				card: {
					DEFAULT: 'hsl(var(--card) / <alpha-value>)',
					foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: [...fontFamily.sans]
			},
      typography: {
        DEFAULT: {
          css: {
            color: 'inherit',
            maxWidth: 'auto',
            a: {
              color: 'rgb(var(--global-color-primary-400))'
            },
            p: {
              marginTop: '4px',
              marginBottom: '0px'
            },
            strong: {
              color: 'inherit'
            },
            h1: {
              color: 'inherit',
              fontWeight: '800',
              marginBottom: '8px'
            },
            'h1 strong': {
              fontWeight: '900',
              color: 'inherit',
              marginBottom: '8px'
            },
            h2: {
              color: 'inherit',
              fontWeight: '700',
              marginBottom: '8px',
              marginTop: '8px'
            },
            'h2 strong': {
              fontWeight: '800',
              color: 'inherit',
              marginBottom: '8px'
            },
            h3: {
              color: 'inherit',
              fontWeight: '600',
              marginBottom: '8px'
            },
            'h3 strong': {
              fontWeight: '700',
              color: 'inherit',
              marginBottom: '8px'
            },
            h4: {
              color: 'inherit',
              fontWeight: '600',
              marginBottom: '8px'
            }
          }
        },
        lg: {
          p: {
            marginTop: '0px',
            marginBottom: '0px'
          }
        }
      }
		}
	}
}

export default config
