import Link from "next/link";

interface TagProps {
  tag: string;
}

const Tag = ({ tag }: TagProps) => {
  return (
    <Link
      // href={`/posts/tag/${tag}/1`}
      href="/"
      className="bg-sky-900 dark:bg-sky-300 rounded-full cursor-pointer font-medium"
      style={{ padding: "0 10px" }}
    >
      {tag}
    </Link>
  );
};

export default Tag;
