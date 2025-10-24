import { Providers } from './providers'

export const metadata = {
  title: '居宅サービス計画書作成支援システム',
  description: '居宅サービス計画書作成支援システム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
