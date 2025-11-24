import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"]
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  title: "Violens - AI Violence Detection System",
  description: "Advanced AI-powered violence detection for real-time monitoring and video analysis",
  keywords: ["AI", "violence detection", "security", "monitoring", "deep learning"],
  authors: [{ name: "Violens Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Navigation */}


        {/* Main Content */}
        <main className="pt-24">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Violens AI</p>
                  <p className="text-xs text-slate-400">Advanced Violence Detection</p>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm text-slate-400">
                <span>© 2024 Violens AI. All rights reserved.</span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">Powered by Deep Learning</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
