import { ListLayout } from "@/components/ui/ListLayout";

interface Params {
  params: Promise<{ tag: string }>;
}

export default async function Tags({ params }: Params) {
  const { tag } = await params;
  return <ListLayout type="tag" tag={tag} />;
}
