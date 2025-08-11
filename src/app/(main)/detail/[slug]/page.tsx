import { getSinglePost } from "@/actions/posts";
import PostBody from "@/components/Post/postBody";
import Link from "next/link";

interface Params {
  params: Promise<{ slug: string }>;
}

const PostDetailPage = async ({ params }: Params) => {
  const { slug } = await params;
  const data = await getSinglePost(slug);
  console.log(data);

  return (
    <section className="container lg:px-2 px-5 h-screen lg:w-2/5 mx-auto mt-20">
      <h2 className="w-full text-2xl font-medium">{data.title || ""}</h2>
      <div className="border-b-2 w-1/3 mt-1 border-sky-900"></div>
      <span className="text-gray-500">{`投稿日 ${data.date}`}</span>
      <br />
      {data.tags?.map((tag, index) => (
        <p
          key={index}
          className="text-white bg-sky-900 rounded-full font-medium mt-2 mr-2 px-2 py-1 inline-block"
        >
          <Link href={`/posts/tag/${tag}/1`}>{tag}</Link>
        </p>
      ))}
      <PostBody body={data.markdown || ""} />
      <Link href="/">
        <span className="py-10 block mt-3 text-sky-900">←ホームに戻る</span>
      </Link>
    </section>
  );
};

export default PostDetailPage;
