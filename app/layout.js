import "./globals.css";

export const metadata = {
  title: "LLM Status",
  description: "Official LLM provider status with model and timezone views."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
