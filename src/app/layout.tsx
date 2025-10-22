import type { Metadata } from 'next'
import { ThemeProvider } from '@/lib/theme'
import './globals.css'
import { getCurrentUser } from '@/lib/supabase/db/auth'
import { getCurrentUserAction } from '@/lib/actions/auth'
import { getStoreWithSettingsAction } from '@/lib/actions/stores'
import { AuthProvider } from '@/lib/provider/AuthContext'
import { getStoreWithSettings } from '@/lib/supabase/db/stores'

export const metadata: Metadata = {
  title: 'محل الهواتف - نظام الإدارة',
  description: 'نظام إدارة شامل لمحل الهواتف المحمولة',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
    const user = await getCurrentUser()
  let store = null
  let settings = null

  if (user?.storeid) {
    const data = await getStoreWithSettings(user.storeid)
    store = data.store
    settings = data.settings
  }
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Prevent transitions during initial load
                document.documentElement.classList.add('no-transitions');
                
                try {
                  const theme = localStorage.getItem('theme');
                  const palette = localStorage.getItem('palette') || 'green';
                  
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                  
                  const palettes = {
                    green: { light: { primary: '#556B2F', accent: '#E28E35' }, dark: { primary: '#6B8E3D', accent: '#F5A259' } },
                    blue: { light: { primary: '#2563EB', accent: '#F59E0B' }, dark: { primary: '#3B82F6', accent: '#FBB040' } },
                    purple: { light: { primary: '#7C3AED', accent: '#EC4899' }, dark: { primary: '#8B5CF6', accent: '#F472B6' } },
                    teal: { light: { primary: '#0D9488', accent: '#F97316' }, dark: { primary: '#14B8A6', accent: '#FB923C' } },
                    red: { light: { primary: '#DC2626', accent: '#FBBF24' }, dark: { primary: '#EF4444', accent: '#FCD34D' } },
                    emerald: {light: { primary: '#059669', accent: '#F97316' },dark: { primary: '#10B981', accent: '#FB923C' }},
                    indigo: { light: { primary: '#4F46E5', accent: '#10B981' }, dark: { primary: '#6366F1', accent: '#34D399' } },
                    orange: { light: { primary: '#EA580C', accent: '#8B5CF6' }, dark: { primary: '#F97316', accent: '#A78BFA' } },
                    pink: { light: { primary: '#DB2777', accent: '#06B6D4' }, dark: { primary: '#EC4899', accent: '#22D3EE' } }
                  };
                  
                  const isDark = theme === 'dark';
                  const colors = palettes[palette] ? palettes[palette][isDark ? 'dark' : 'light'] : palettes.green[isDark ? 'dark' : 'light'];
                  const root = document.documentElement;
                  
                  root.style.setProperty('--color-primary', colors.primary);
                  root.style.setProperty('--color-accent', colors.accent);
                  root.style.setProperty('--color-secondary', isDark ? '#E8E8E8' : '#3A3A3A');
                  root.style.setProperty('--color-bg-primary', isDark ? '#1A1A1A' : '#FFFFFF');
                  root.style.setProperty('--color-bg-secondary', isDark ? '#242424' : '#F5F5F5');
                  root.style.setProperty('--color-bg-light', isDark ? '#2E2E2E' : '#FAFAFA');
                  root.style.setProperty('--color-text-primary', isDark ? '#F5F5F5' : '#1E1E1E');
                  root.style.setProperty('--color-text-secondary', isDark ? '#A8A8A8' : '#6E6E6E');
                  root.style.setProperty('--color-border', isDark ? '#3A3A3A' : '#E5E5E5');
                  root.style.setProperty('--color-hover', isDark ? '#333333' : '#F5F5F5');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <AuthProvider
          initialUser={user}
          initialStore={store}
          initialSettings={settings}
        >
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}