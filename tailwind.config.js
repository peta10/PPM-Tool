/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  	extend: {
  		colors: {
  			// Legacy colors - keeping for backward compatibility
  			'snow-white': '#F5F9FC',
  			'alpine-blue': {
  				'50': '#E6F0FF',
  				'100': '#B3D4FF',
  				'200': '#80B8FF',
  				'300': '#4D9CFF',
  				'400': '#1A80FF',
  				'500': '#0057B7',
  				'600': '#004A9E',
  				'700': '#003D85',
  				'800': '#00306C',
  				'900': '#002353'
  			},
  			'summit-green': {
  				'50': '#E8F5F0',
  				'100': '#C7E6D6',
  				'200': '#A6D7BC',
  				'300': '#85C8A2',
  				'400': '#64B988',
  				'500': '#2E8B57',
  				'600': '#267549',
  				'700': '#1E5F3B',
  				'800': '#16492D',
  				'900': '#0E331F'
  			},
  			midnight: {
  				'50': '#F2F4F6',
  				'100': '#D9DEE4',
  				'200': '#B3BCC8',
  				'300': '#8D9AAC',
  				'400': '#677890',
  				'500': '#415674',
  				'600': '#304158',
  				'700': '#1F2C3C',
  				'800': '#0B1E2D',
  				'900': '#081621'
  			},
  			
  			// New premium design system
  			'primary': {
  				'50': '#f0f9ff',
  				'100': '#e0f2fe',
  				'200': '#bae6fd',
  				'300': '#7dd3fc',
  				'400': '#38bdf8',
  				'500': '#0ea5e9',
  				'600': '#0284c7',
  				'700': '#0369a1',
  				'800': '#075985',
  				'900': '#0c4a6e',
  				'950': '#082f49'
  			},
  			'secondary': {
  				'50': '#f8fafc',
  				'100': '#f1f5f9',
  				'200': '#e2e8f0',
  				'300': '#cbd5e1',
  				'400': '#94a3b8',
  				'500': '#64748b',
  				'600': '#475569',
  				'700': '#334155',
  				'800': '#1e293b',
  				'900': '#0f172a',
  				'950': '#020617'
  			},
  			'accent': {
  				'50': '#fdf4ff',
  				'100': '#fae8ff',
  				'200': '#f5d0fe',
  				'300': '#f0abfc',
  				'400': '#e879f9',
  				'500': '#d946ef',
  				'600': '#c026d3',
  				'700': '#a21caf',
  				'800': '#86198f',
  				'900': '#701a75',
  				'950': '#4a044e'
  			},
  			'success': {
  				'50': '#f0fdf4',
  				'100': '#dcfce7',
  				'200': '#bbf7d0',
  				'300': '#86efac',
  				'400': '#4ade80',
  				'500': '#22c55e',
  				'600': '#16a34a',
  				'700': '#15803d',
  				'800': '#166534',
  				'900': '#14532d',
  				'950': '#052e16'
  			},
  			'warning': {
  				'50': '#fffbeb',
  				'100': '#fef3c7',
  				'200': '#fde68a',
  				'300': '#fcd34d',
  				'400': '#fbbf24',
  				'500': '#f59e0b',
  				'600': '#d97706',
  				'700': '#b45309',
  				'800': '#92400e',
  				'900': '#78350f',
  				'950': '#451a03'
  			},
  			'error': {
  				'50': '#fef2f2',
  				'100': '#fee2e2',
  				'200': '#fecaca',
  				'300': '#fca5a5',
  				'400': '#f87171',
  				'500': '#ef4444',
  				'600': '#dc2626',
  				'700': '#b91c1c',
  				'800': '#991b1b',
  				'900': '#7f1d1d',
  				'950': '#450a0a'
  			},
  			
  			// Shadcn/ui color system
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		
  		// Premium gradients
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  			'gradient-premium': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  			'gradient-aurora': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  			'gradient-cosmic': 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
  			'gradient-oceanic': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  			'gradient-sunset': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
  			'gradient-forest': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  			'mesh-purple': 'radial-gradient(at 40% 20%, hsla(28,100%,74%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(340,100%,76%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(22,100%,77%,1) 0px, transparent 50%), radial-gradient(at 80% 100%, hsla(242,100%,70%,1) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(343,100%,76%,1) 0px, transparent 50%)',
  		},
  		
  		// Enhanced animation system
  		animation: {
  			'fade-in': 'fadeIn 0.5s ease-in-out',
  			'fade-in-up': 'fadeInUp 0.5s ease-out',
  			'fade-in-down': 'fadeInDown 0.5s ease-out',
  			'slide-in-right': 'slideInRight 0.3s ease-out',
  			'slide-in-left': 'slideInLeft 0.3s ease-out',
  			'scale-in': 'scaleIn 0.2s ease-out',
  			'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
  			'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
  			'shimmer': 'shimmer 2s linear infinite',
  			'float': 'float 3s ease-in-out infinite',
  			'gradient-x': 'gradient-x 15s ease infinite',
  			'gradient-y': 'gradient-y 15s ease infinite',
  			'gradient-xy': 'gradient-xy 15s ease infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		
  		keyframes: {
  			fadeIn: {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' }
  			},
  			fadeInUp: {
  				'0%': { opacity: '0', transform: 'translateY(30px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' }
  			},
  			fadeInDown: {
  				'0%': { opacity: '0', transform: 'translateY(-30px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' }
  			},
  			slideInRight: {
  				'0%': { opacity: '0', transform: 'translateX(30px)' },
  				'100%': { opacity: '1', transform: 'translateX(0)' }
  			},
  			slideInLeft: {
  				'0%': { opacity: '0', transform: 'translateX(-30px)' },
  				'100%': { opacity: '1', transform: 'translateX(0)' }
  			},
  			scaleIn: {
  				'0%': { opacity: '0', transform: 'scale(0.9)' },
  				'100%': { opacity: '1', transform: 'scale(1)' }
  			},
  			bounceSubtle: {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-5px)' }
  			},
  			pulseGlow: {
  				'0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
  				'50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)' }
  			},
  			shimmer: {
  				'0%': { transform: 'translateX(-100%)' },
  				'100%': { transform: 'translateX(100%)' }
  			},
  			float: {
  				'0%, 100%': { transform: 'translateY(0px)' },
  				'50%': { transform: 'translateY(-10px)' }
  			},
  			'gradient-x': {
  				'0%, 100%': {
  					'background-size': '200% 200%',
  					'background-position': 'left center'
  				},
  				'50%': {
  					'background-size': '200% 200%',
  					'background-position': 'right center'
  				}
  			},
  			'gradient-y': {
  				'0%, 100%': {
  					'background-size': '200% 200%',
  					'background-position': 'center top'
  				},
  				'50%': {
  					'background-size': '200% 200%',
  					'background-position': 'center bottom'
  				}
  			},
  			'gradient-xy': {
  				'0%, 100%': {
  					'background-size': '400% 400%',
  					'background-position': 'left center'
  				},
  				'50%': {
  					'background-size': '200% 200%',
  					'background-position': 'right center'
  				}
  			},
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			}
  		},
  		
  		// Enhanced typography
  		fontFamily: {
  			sans: ['Inter', 'system-ui', 'sans-serif'],
  			display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
  			mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace']
  		},
  		
  		// Glassmorphism and modern effects
  		backdropBlur: {
  			xs: '2px',
  		},
  		
  		// Enhanced shadows
  		boxShadow: {
  			'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  			'glass-lg': '0 15px 35px rgba(31, 38, 135, 0.2)',
  			'neon': '0 0 20px rgba(59, 130, 246, 0.6)',
  			'neon-pink': '0 0 20px rgba(236, 72, 153, 0.6)',
  			'neon-green': '0 0 20px rgba(34, 197, 94, 0.6)',
  			'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
  			'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.04)',
  			'large': '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.04)',
  			'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  		},
  		
  		screens: {
  			sm: '640px',
  			md: '768px',
  			lg: '1024px',
  			xl: '1280px',
  			'2xl': '1536px',
  			mobile: { max: '1023px' },
  			desktop: '1024px'
  		},
  		
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
