
// src/app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The parent RootLayout's <main> has flex-grow.
  // This layout ensures its children can utilize that full space 
  // without the default container padding/margins, allowing for a full-screen editor feel.
  return <div className="flex flex-col w-full h-full">{children}</div>;
}
