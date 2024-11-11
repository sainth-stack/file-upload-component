"use client"
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import React from 'react';
import { Provider as StyletronProvider } from 'styletron-react';
import { LightTheme, BaseProvider } from 'baseui';
import { Client as Styletron } from 'styletron-engine-atomic';

const engine = new Styletron();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body          >
        <StyletronProvider value={engine}>
          <BaseProvider theme={LightTheme}>
            {children}
          </BaseProvider>
        </StyletronProvider>
      </body>
    </html>

  );
}
