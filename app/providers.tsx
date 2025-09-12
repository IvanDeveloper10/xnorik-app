'use client';

import type { ThemeProviderProps } from 'next-themes';
import * as React from 'react';
import { HeroUIProvider } from '@heroui/system';
import { useRouter } from 'next/navigation';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ToastProvider } from '@heroui/toast';

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module '@react-types/shared' {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>['push']>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        {children}
        <ToastProvider toastProps={{
          timeout: 1000,
          hideIcon: true,
          classNames: {
            closeButton: 'opacity-100 absolute right-4 top-1/2 -translate-y-1/2 text-po',
          },
        }} />
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
