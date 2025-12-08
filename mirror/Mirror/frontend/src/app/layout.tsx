import "./global.css"
import "the-new-css-reset/css/reset.css";
import '@fontsource-variable/nunito-sans';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
