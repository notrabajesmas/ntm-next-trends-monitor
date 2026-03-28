import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SharedReportView } from "./client-view";

// Página pública para ver reportes compartidos
export default async function SharedReportPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // Buscar el reporte por código
  const report = await db.sharedReport.findUnique({
    where: { shareCode: code },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  });

  if (!report) {
    notFound();
  }

  // Verificar si expiró
  if (report.expiresAt && new Date() > report.expiresAt) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Reporte Expirado</h1>
          <p className="text-slate-400">Este reporte ya no está disponible.</p>
        </div>
      </div>
    );
  }

  // Incrementar contador de vistas (async, no bloquea)
  db.sharedReport.update({
    where: { id: report.id },
    data: { viewCount: { increment: 1 } }
  }).catch(() => {});

  // Parsear contenido
  const content = JSON.parse(report.content);

  return (
    <SharedReportView 
      report={{
        ...report,
        content,
        userName: report.user?.name || 'Usuario NTM'
      }}
    />
  );
}

// Generar metadata para SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const report = await db.sharedReport.findUnique({
    where: { shareCode: code },
    select: { title: true, reportType: true }
  });

  if (!report) {
    return { title: "Reporte no encontrado - NTM" };
  }

  return {
    title: `${report.title} - NTM Report`,
    description: `Reporte de ${report.reportType} generado con Next Trends Monitor`,
    openGraph: {
      title: report.title,
      description: `Reporte de análisis digital`,
      type: "article",
    }
  };
}
