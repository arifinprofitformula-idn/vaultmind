---
name: Cyber Shimmer
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dbe7'
  primary: '#e1fdff'
  on-primary: '#00363a'
  primary-container: '#00f2ff'
  on-primary-container: '#006a71'
  inverse-primary: '#00696f'
  secondary: '#c3c6d3'
  on-secondary: '#2c303a'
  secondary-container: '#454953'
  on-secondary-container: '#b5b8c5'
  tertiary: '#f6f7ff'
  on-tertiary: '#263143'
  tertiary-container: '#d0dbf3'
  on-tertiary-container: '#556074'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#74f5ff'
  primary-fixed-dim: '#00dbe7'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#dfe2ef'
  secondary-fixed-dim: '#c3c6d3'
  on-secondary-fixed: '#181c25'
  on-secondary-fixed-variant: '#434751'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  container-max: 1280px
---

## Brand & Style
The design system embodies a high-tech, futuristic aesthetic that blends the precision of **minimalism** with the depth of **glassmorphism**. It is designed to evoke a sense of advanced security and digital sophistication, specifically targeting developers, crypto-enthusiasts, and tech-forward professionals. 

The visual narrative is defined by "solid shimmer"—a technique where static elements appear dynamic through subtle angle-dependent gradients and hairline-thin glowing strokes. The interface feels like a physical piece of illuminated hardware, utilizing a deep midnight foundation to allow neon accents to provide maximum functional contrast.

## Colors
This design system uses a strictly dark palette to maintain its futuristic atmosphere. 

- **Primary:** A vibrant neon Cyan (#00F2FF) used for critical actions, active states, and glowing accents.
- **Secondary (Background):** A deep, saturated charcoal-navy (#10141D) that provides the "infinite space" feel.
- **Tertiary (Surfaces):** A lighter slate (#1E293B) used for glassmorphic containers and card surfaces.
- **Neutral:** Muted grays used for secondary text and borders to prevent visual fatigue.

Functional colors like success (Green), warning (Amber), and error (Red) should be desaturated but high-brightness to ensure they pop against the dark background.

## Typography
The typography strategy pairs geometric futurism with technical precision. 

- **Space Grotesk** is used for headlines to provide a sharp, architectural feel. 
- **Geist** serves as the primary body font, chosen for its exceptional legibility in dark mode and clean, Swiss-inspired character. 
- **JetBrains Mono** is reserved for labels, metadata, and micro-copy, reinforcing the "system-level" technical narrative. 

Maintain high contrast by using pure white or primary cyan for headlines, and neutral slates for body copy.

## Layout & Spacing
The design system employs a **fluid grid** based on a 4px baseline unit. 

- **Desktop:** A 12-column grid with 24px gutters. Elements should align strictly to these columns to maintain a "blueprint" feel.
- **Mobile:** A 4-column grid with 16px margins. 
- **Rhythm:** Spacing between sections should be generous (80px+) to allow the glassmorphic elements to "breathe" against the dark background. 

Padding within glass containers should be consistent (e.g., 32px for cards) to emphasize the structural integrity of the UI.

## Elevation & Depth
Depth is created through **glassmorphism** and **tonal layering** rather than traditional drop shadows.

1.  **Background:** Pure secondary color.
2.  **Mid-ground (Planes):** Semi-transparent surfaces (10-20% opacity) with a `backdrop-filter: blur(12px)`. 
3.  **Borders:** Hairline 1px borders using a linear gradient (Primary color at 40% opacity to 10% opacity) to simulate a light source hitting the edge.
4.  **Shimmer:** Important containers feature a subtle diagonal linear gradient shimmer that moves slowly or responds to mouse hover, creating a "solid" but energetic surface.
5.  **Glow:** High-priority elements use a `box-shadow` with a large spread (20px+) and very low opacity (15%) of the primary neon color to simulate an ambient glow.

## Shapes
Shapes in this design system are disciplined and "Soft-Sharp." 

Standard components use a **0.25rem (4px)** radius to maintain a modern, technical appearance that avoids the playfulness of fully rounded corners. Larger cards may use **0.75rem (12px)** to distinguish them as primary content containers. Interactive elements like buttons should remain consistent with the 4px standard to ensure they feel like precisely machined components.

## Components

- **Buttons:** Primary buttons are solid Primary Cyan with black text for maximum contrast. Secondary buttons are outlined with the "shimmer border" and feature Cyan text.
- **Input Fields:** Darker than the container background to create a "recessed" feel. On focus, the border glows cyan and the shimmer effect intensifies.
- **Chips:** Monospaced text inside a subtle glass pill. Use for tags or status indicators.
- **Cards:** The hallmark of the system. Must feature the `backdrop-blur` and the 1px gradient border. Titles should be in `label-caps`.
- **Progress Bars:** Thin, glowing neon lines. Avoid thick blocks; use "energy levels" as a metaphor.
- **Lists:** Separated by low-opacity neutral lines. Hover states should trigger a subtle background tint change (translucent white at 5%).