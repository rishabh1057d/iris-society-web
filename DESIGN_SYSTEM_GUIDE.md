# IRIS Society Website - Design System Guide

## 🎨 Color Palette

### Primary Colors
- **Primary Blue**: `#3b82f6` (rgb(59, 130, 246))
- **Primary Purple**: `#8b5cf6` (rgb(139, 92, 246))
- **Indigo**: `#6366f1` (for accents)

### Gradient Combinations
- **Primary Gradient** (Buttons, CTAs): `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
  - Alternative: `from-blue-600 to-purple-600`
  - Hover: `from-blue-700 to-purple-700`

- **Background Mesh Gradient**:
  - Layer 1: `from-blue-900/20 via-purple-900/15 to-indigo-900/25`
  - Layer 2: `from-black/30 via-transparent to-transparent`
  - Base: `linear-gradient(135deg, rgb(0, 51, 102), rgb(0, 0, 0))`

- **Text Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
  - Applied with: `bg-clip-text` and `text-transparent`

### Text Colors
- **Primary Text**: `#ffffff` (white)
- **Secondary Text**: `#d1d5db` (gray-300)
- **Muted Text**: `#9ca3af` (gray-400)
- **Blue Accent Text**: `#93c5fd` (blue-300)
- **Purple Accent Text**: `#c4b5fd` (purple-300)

### Glassmorphism Colors
- **Glass Background**: `rgba(30, 41, 59, 0.4)` (slate-800 with 40% opacity)
- **Glass Border**: `rgba(255, 255, 255, 0.1)` (white with 10% opacity)
- **Glass Hover**: `rgba(30, 41, 59, 0.5)` (slightly more opaque)
- **Glass Nav**: `rgba(15, 23, 42, 0.9)` (slate-900 with 90% opacity)

### Accent Colors
- **Success**: `#10b981` (green-500)
- **Error/Warning**: `#ef4444` (red-500)
- **Info**: `#3b82f6` (blue-500)

---

## 🎭 Design Patterns

### 1. Glassmorphism (Frosted Glass Effect)
**Core Pattern**: Translucent backgrounds with backdrop blur

```css
.glass-card {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}
```

**Variations**:
- **Light Glass**: `bg-white/10` with `backdrop-blur-xl`
- **Dark Glass**: `bg-black/50` with `backdrop-blur-md`
- **Nav Glass**: `bg-slate-900/90` with `backdrop-blur-20px`

### 2. Gradient Mesh Background
**Layered Approach**:
1. Base gradient (dark blue to black)
2. Overlay gradients (purple/blue/indigo at low opacity)
3. Floating orbs (blurred gradient circles for depth)

```css
/* Base */
background: linear-gradient(135deg, rgb(0, 51, 102), rgb(0, 0, 0));

/* Overlay layers */
bg-gradient-to-br from-blue-900/20 via-purple-900/15 to-indigo-900/30
bg-gradient-to-t from-black/30 via-transparent to-transparent

/* Floating orbs */
bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl
```

### 3. Shine Animation (Card Hover Effect)
**Pattern**: Light sweep across cards on hover

```css
.card::before {
  content: "";
  position: absolute;
  top: 0;
  left: -75%;
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, 
    rgba(255, 255, 255, 0) 0%, 
    rgba(255, 255, 255, 0.3) 100%);
  transform: skewX(-25deg);
  transition: all 0.75s;
}

.card:hover::before {
  animation: shine 0.75s ease-out;
}

@keyframes shine {
  100% { left: 125%; }
}
```

### 4. Gradient Underlines & Dividers
**Pattern**: Animated gradient lines

```css
/* Underline */
bg-gradient-to-r from-blue-400/60 via-purple-400/40 to-blue-500/60

/* Divider */
h-[1px] md:h-[2px] bg-gradient-to-r from-blue-400/60 via-purple-400/40 to-blue-500/60
```

---

## 🔤 Typography

### Font Family
- **Primary**: `Inter` (with fallbacks: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto"`)
- **Features**: `font-feature-settings: "cv02", "cv03", "cv04", "cv11"`
- **Numeric**: `font-variant-numeric: oldstyle-nums`

### Font Sizes (Fluid/Responsive)
Using CSS clamp for responsive scaling:

```css
--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
--text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
--text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
--text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
--text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
--text-2xl: clamp(1.5rem, 1.3rem + 1vw, 2rem);
--text-3xl: clamp(1.875rem, 1.6rem + 1.375vw, 2.5rem);
--text-4xl: clamp(2.25rem, 1.9rem + 1.75vw, 3rem);
--text-5xl: clamp(3rem, 2.5rem + 2.5vw, 4rem);
```

### Font Weights
- **Headings**: `700` (bold)
- **Body**: `400` (regular)
- **Medium**: `500` (for emphasis)
- **Semibold**: `600` (buttons, CTAs)

### Letter Spacing
- **Headings**: `-0.025em` (tighter)
- **Body**: `0.01em` (normal)
- **Buttons**: `0.025em` (slightly wider)

### Line Heights
- **Headings**: `1.2`
- **Body**: `1.6-1.7`

---

## 🎯 Component Styles

### Buttons

#### Primary Button
```css
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  transition: all 0.3s;
  min-height: 48px;
}

.btn-primary:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #60a5fa;
  transform: translateY(-1px) scale(1.02);
}
```

### Cards

#### Glass Card
```css
.glass-card {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  transition: all 0.3s;
}

.glass-card:hover {
  background: rgba(30, 41, 59, 0.5);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}
```

### Navigation Links
```css
.nav-link {
  color: #d1d5db;
  padding: 0.5rem 0.75rem;
  position: relative;
  transition: all 0.3s;
}

.nav-link::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transform: translateX(-50%);
  transition: width 0.3s;
}

.nav-link:hover::before,
.nav-link.active::before {
  width: 80%;
}
```

---

## 📐 Spacing System

### CSS Variables
```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;     /* 8px */
--spacing-md: 1rem;       /* 16px */
--spacing-lg: 1.5rem;     /* 24px */
--spacing-xl: 2rem;       /* 32px */
--spacing-2xl: 3rem;      /* 48px */
```

### Usage
- **Small gaps**: `gap-2` (0.5rem)
- **Medium gaps**: `gap-4` (1rem)
- **Large gaps**: `gap-6` (1.5rem)
- **Section padding**: `py-12 md:py-16` (3rem/4rem)

---

## 🎬 Animations & Transitions

### Standard Transitions
- **Duration**: `0.3s` for most interactions
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out)
- **Hover Scale**: `1.02-1.05`
- **Hover Translate**: `translateY(-1px to -2px)`

### Keyframe Animations
```css
/* Fade In Up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Pulse (for orbs) */
animate-pulse with delays: 0s, 2s, 4s
```

### Scroll Animations
- **Fade in on scroll**: Using Framer Motion `useInView`
- **Parallax effects**: `useScroll` and `useTransform`
- **Stagger children**: `0.1s` delay between items

---

## 🎨 Visual Effects

### Shadows
- **Card Shadow**: `0 8px 32px rgba(0, 0, 0, 0.2)`
- **Hover Shadow**: `0 12px 40px rgba(0, 0, 0, 0.3)`
- **Button Shadow**: `0 4px 12px rgba(59, 130, 246, 0.4)`
- **Text Shadow**: `0 2px 8px rgba(0, 0, 0, 0.5)`

### Blur Effects
- **Backdrop Blur**: `blur(16px)` to `blur(20px)`
- **Orb Blur**: `blur-3xl` (64px)
- **Glow Blur**: `blur-2xl` (40px)

### Border Radius
- **Small**: `0.5rem` (8px)
- **Medium**: `0.75rem` (12px)
- **Large**: `1rem` (16px)
- **Full**: `9999px` (pill shape)

---

## 📱 Responsive Breakpoints

### Tailwind Defaults
- **sm**: `640px`
- **md**: `768px`
- **lg**: `1024px`
- **xl**: `1280px`
- **2xl**: `1400px`

### Custom Breakpoint
- **xs**: `475px` (defined in tailwind.config)

### Mobile-First Approach
- Base styles for mobile
- Progressive enhancement for larger screens
- Touch targets: minimum `44px` height

---

## 🌈 Background Patterns

### Floating Orbs Pattern
```css
/* Multiple blurred gradient circles */
.orb-1 {
  width: 24rem;
  height: 24rem;
  background: linear-gradient(to right, 
    rgba(59, 130, 246, 0.1), 
    rgba(139, 92, 246, 0.1));
  border-radius: 50%;
  filter: blur(64px);
  animation: pulse 4s ease-in-out infinite;
}
```

### Mesh Gradient Layers
1. **Base**: Dark blue to black diagonal gradient
2. **Overlay 1**: Purple-blue-indigo at 15-30% opacity
3. **Overlay 2**: Black fade from bottom
4. **Orbs**: 3-4 floating blurred circles with pulse animation

---

## 🎯 Accessibility Features

### Focus States
```css
:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 0.5rem;
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Touch Targets
- Minimum: `44px` height
- Recommended: `48px` for buttons
- Spacing: `8px` minimum between touch targets

---

## 🛠️ Implementation Tips

### 1. Use CSS Variables
Define colors and spacing as CSS variables for easy theming:
```css
:root {
  --primary-blue: #3b82f6;
  --primary-purple: #8b5cf6;
  --glass-bg: rgba(30, 41, 59, 0.4);
}
```

### 2. Hardware Acceleration
For smooth animations:
```css
.hardware-accelerated {
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
}
```

### 3. Backdrop Filter Fallback
Always provide a fallback for backdrop-filter:
```css
background: rgba(30, 41, 59, 0.6); /* Fallback */
backdrop-filter: blur(16px);
-webkit-backdrop-filter: blur(16px);
```

### 4. Gradient Text
```css
.gradient-text {
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 📋 Quick Reference

### Color Classes (Tailwind)
- `text-blue-300` - Light blue text
- `text-purple-300` - Light purple text
- `text-gray-300` - Secondary text
- `bg-blue-600` - Primary blue background
- `bg-purple-600` - Primary purple background
- `border-blue-400/20` - Blue border at 20% opacity

### Utility Classes
- `glass-card` - Glassmorphism card
- `btn-primary` - Primary button
- `btn-secondary` - Secondary button
- `gradient-text` - Gradient text effect
- `hardware-accelerated` - GPU acceleration

### Common Patterns
- **Card Grid**: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6`
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6`
- **Section Padding**: `py-12 md:py-16 lg:py-20`

---

## 🎨 Design Philosophy

1. **Dark Theme First**: Deep backgrounds with light text
2. **Glassmorphism**: Translucent, blurred surfaces for depth
3. **Gradient Accents**: Blue-to-purple gradients throughout
4. **Smooth Animations**: Subtle, purposeful motion
5. **Layered Depth**: Multiple gradient layers and floating elements
6. **Accessibility**: High contrast, large touch targets, focus states
7. **Responsive**: Mobile-first with fluid typography
8. **Performance**: Hardware acceleration, will-change optimization

---

This design system creates a modern, premium feel with a dark, tech-forward aesthetic perfect for creative/tech organizations.

