export type ResourceProps = {
  category: string;
  name: string;
  url: string;
  description: string;
};

export async function getResources(): Promise<ResourceProps[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/resources`,
      { next: { revalidate: 60 } },
    );
    const data = await response.json();
    return data.resources || [];
  } catch (error) {
    console.error("Error fetching resources:", error);
    return [];
  }
}
