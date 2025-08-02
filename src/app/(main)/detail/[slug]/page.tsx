import Link from "next/link";

interface Params {
  params: { slug: string };
}

const PostDetailPage = async ({ params }: Params) => {
  const { slug } = await params;
  return (
    <div className="flex flex-col">
      {slug}
      <Link href="/" className="text-medium text-2xl">
        Top
      </Link>
    </div>
  );
};

export default PostDetailPage;
