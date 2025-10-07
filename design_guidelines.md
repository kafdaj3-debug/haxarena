# HaxArena V6 Real Soccer - Design Guidelines

## Design Approach
**Reference-Based Hybrid**: Gaming community aesthetic inspired by Discord, Twitch, and modern gaming platforms, combined with systematic component design for the complex admin and forum features.

**Core Principles**:
- Dark, immersive gaming environment that reduces eye strain during extended use
- High contrast elements for quick scanning and action
- Clear information hierarchy for complex admin and league management features
- Turkish-first design with appropriate typography and spacing for Turkish characters

---

## Color Palette

**Dark Mode (Primary)**:
- Background Base: `0 0% 8%` (near black)
- Background Elevated: `0 0% 12%` (cards, panels)
- Background Hover: `0 0% 16%` (interactive surfaces)
- Primary Accent: `192 66% 57%` (#4cadd0 - cyan/turquoise for all buttons)
- Primary Accent Hover: `192 66% 47%` (darker cyan on hover)
- Text Primary: `0 0% 95%` (high contrast white)
- Text Secondary: `0 0% 70%` (muted gray for labels)
- Text Muted: `0 0% 50%` (disabled/placeholder)
- Border: `0 0% 20%` (subtle divisions)
- Success: `142 71% 45%` (approvals, online status)
- Warning: `38 92% 50%` (pending states)
- Danger: `0 72% 51%` (rejections, delete actions)

**VIP Badge Colors** (as accent highlights):
- Silver VIP: `0 0% 75%` (cool silver)
- Gold VIP: `45 93% 58%` (gold)
- Diamond VIP: `193 82% 75%` (diamond blue)

---

## Typography

**Font Families**:
- Primary: 'Inter', 'Segoe UI', system-ui, sans-serif (clean, gaming-appropriate)
- Headings: 'Rajdhana', 'Inter', sans-serif (bold, gaming aesthetic for Turkish characters)
- Monospace: 'JetBrains Mono', 'Consolas', monospace (stats, codes)

**Type Scale**:
- Hero Title: text-5xl md:text-6xl font-bold (HaxArena V6 welcome)
- Page Heading: text-3xl md:text-4xl font-bold
- Section Heading: text-2xl font-semibold
- Card Title: text-xl font-semibold
- Body: text-base (16px)
- Small: text-sm
- Label: text-xs font-medium uppercase tracking-wide

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16 for consistent rhythm
- Component padding: p-4, p-6, p-8
- Section spacing: py-12, py-16, py-20
- Card gaps: gap-4, gap-6, gap-8
- Container max-width: max-w-7xl

**Grid Systems**:
- Admin dashboard: 12-column grid for complex layouts
- Forum posts: Single column max-w-4xl for readability
- Active rooms: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- VIP packages: grid-cols-1 md:grid-cols-3
- Stats tables: Full-width responsive tables with horizontal scroll

---

## Component Library

### Navigation
- **Main Header**: Fixed top, dark background with subtle border-bottom, logo left, Discord link right, primary nav center
- **Sidebar** (Admin Panel): Collapsible left sidebar 256px width, icon + label navigation, active state with cyan accent
- **Footer**: Dark background, 3-column layout (links, admin roster preview, online users count)

### Cards & Containers
- **Active Room Card**: Elevated background, cyan border-left-4, match name bold, link button cyan, hover lift effect
- **VIP Package Card**: Elevated bg, VIP tier icon, feature list with checkmarks, price prominent, Shopier link button
- **Forum Post Card**: Border-bottom divider, avatar left, post content right, timestamp muted text
- **Admin Application Card**: Two-column layout, Q&A pairs, approve/reject buttons at bottom

### Forms
- **Input Fields**: Dark bg-elevated, cyan focus ring, white text, muted placeholder
- **Text Areas**: Min-height 120px for admin messages, 200px for applications
- **Dropdowns**: Dark dropdown menu with hover states
- **File Upload**: Drag-drop zone for team logos (PNG), preview thumbnail
- **Buttons**: 
  - Primary: bg-cyan (#4cadd0), white text, rounded-lg, hover:brightness-90
  - Secondary: border-cyan, text-cyan, bg-transparent, hover:bg-cyan/10
  - Danger: bg-red, white text (delete, reject actions)
  - Ghost: text-cyan, hover:bg-cyan/10 (cancel, back actions)

### Tables & Lists
- **League Standings**: Alternating row bg, team logo 32px, rank bold, stats columns right-aligned
- **Top 10 Lists**: Numbered list, player name left, stats right, top 3 highlighted with subtle gradient
- **Admin Roster**: Role badges with distinct colors, names as tags, editable inline
- **Fixture Table**: Match pairs in rows, date/time left, teams center, edit icon right

### Modals & Overlays
- **Approval Dialog**: Centered modal, dark backdrop blur, admin message textarea, dual action buttons
- **Confirmation Dialog**: Small centered card, warning icon, clear action buttons
- **Toast Notifications**: Top-right, auto-dismiss, color-coded by type (success/warning/error)

### Forum Specific
- **Category Header**: Cyan accent border-left, category icon, post count badge
- **Post Composer**: Full-width textarea, formatting toolbar (bold, link), character count, post button cyan
- **Thread View**: Nested replies with indent, OP badge, admin badge, archived state with lock icon
- **Archive Indicator**: Muted background, lock icon, "Arşivlendi" label

### Admin Panel
- **Dashboard Cards**: Stats widgets with icons, numbers prominent, trend indicators
- **Action Tables**: Bulk selection, filter bar, action dropdown per row
- **Edit Panels**: Side drawer 400px, form fields stacked, save/cancel sticky footer

---

## Special Features

### Active Rooms Display
- Grid layout with room cards
- Match name as heading (e.g., "Beşiktaş vs Trabzonspor")
- Live indicator (green dot) if room active
- HaxBall link button prominent, cyan color
- Admin edit icon (pencil) top-right corner for authorized users

### VIP System
- Three-tier showcase with visual hierarchy (Silver → Gold → Diamond)
- Feature lists with icon bullets
- Price display: Large TL amount, "Satın Al" button
- Discord ticket reminder alert below Diamond package
- Hover card effect with subtle lift and glow

### League Management
- Fixture calendar view with week navigation
- Drag-drop match rescheduling (admin only)
- Auto-calculated standings with goal difference, points
- Team logo + name in all views
- Top 10 statistics with podium highlighting (1st gold, 2nd silver, 3rd bronze accent)

### Online Users
- Compact list in footer or sidebar
- Avatar thumbnails 24px
- Username truncated if needed
- Role badge (admin, VIP tier) as colored dot
- "Çevrimiçi: X kullanıcı" header

---

## Images

**Hero Section**: Full-width background image (1920x600px) showing HaxBall gameplay or stadium atmosphere with dark overlay for text readability. Welcome message "HaxArena V6 Real Soccer'e Hoş Geldiniz" overlaid center with cyan accent underline.

**VIP Package Icons**: Use icon library (Heroicons) for tier badges - shield for Silver, star for Gold, gem for Diamond. No custom SVG needed.

**Team Logos**: User-uploaded PNG files, displayed at 48px (list view) and 96px (detail view), with fallback placeholder if missing.

**Background Patterns**: Subtle grid or hex pattern overlay on dark backgrounds for depth, 5% opacity.

---

## Responsive Behavior
- Mobile: Stack all multi-column layouts, collapsible sidebar becomes bottom nav or hamburger menu
- Tablet: 2-column grid for rooms/VIP, single column forum
- Desktop: Full multi-column layouts, fixed sidebar, expanded tables

---

## Accessibility & Turkish Language
- High contrast text (WCAG AAA for body text)
- Focus indicators always visible (cyan ring)
- Keyboard navigation for all interactive elements
- Proper Turkish character support in all fonts
- Form labels in Turkish with clear validation messages
- Screen reader labels for icon-only buttons