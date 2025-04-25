import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Shuttle Royale - Badminton Tournament",
  description: "The ultimate badminton showdown",
  generator: 'v0.dev',
  icons:{
    icon: "/favicon.ico"
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        {/* If you're using a PNG or SVG: */}
        {/* <link rel="icon" type="image/png" href="/favicon.png" /> */}
        {/* <link rel="icon" type="image/svg+xml" href="/favicon.svg" /> */}
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
