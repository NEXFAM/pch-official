import './globals.css'
import WinnerBar from '@/components/WinnerBar'
import WhatsAppButton from '@/components/WhatsAppButton'

export const metadata = {
  title: 'PCH Official — Official Prize Claim Headquarters',
  description: 'Enter the PCH Official giveaway and claim your prize at the Official Prize Claim Headquarters.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">
        <WinnerBar />
        <div className="pt-10">{children}</div>
        <WhatsAppButton />
      </body>
    </html>
  )
}
