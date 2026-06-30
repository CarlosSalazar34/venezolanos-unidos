import type { Estadisticas } from "@/components/DashboardContent";

export async function getStats(): Promise<Estadisticas | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/estadisticas`,
      { next: { revalidate: 60 } },
    );

    if (!response.ok) return null;

    return response.json();
  } catch (error) {
    console.error("Error fetching stats:", error);
    return null;
  }
}
