import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ctrlC - Editor & Desenho",
  description: "Editor de código com blocos nomeados e área de desenho tipo Whimsical/Miro.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>{children}</>
  );
}
