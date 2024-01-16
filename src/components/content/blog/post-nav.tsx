import Link from "next/link";
import { Post } from "@/lib/types";

export const PostNavigation = ({
  previous,
  next,
}: {
  previous?: Post;
  next?: Post;
}) => {
  return (
    <div className={Container}>
      <div className={PostNavBefore}>
        {previous ? (
          <Link className={PostNavLink} href={`/blog/${previous.slug}`}>
            <div>← Older</div>
            {previous.title}
          </Link>
        ) : null}
      </div>

      <div className={PostNavAfter}>
        {next ? (
          <Link className={PostNavLink} href={`/blog/${next.slug}`}>
            <div>Newer →</div>
            {next.title}
          </Link>
        ) : null}
      </div>
    </div>
  );
};

const Container = `flex justify-between w-100`;

const PostNavBefore = `flex mr-2 text-left`;
const PostNavAfter = `flex ml-2 text-right`;

const PostNavLink = `border border-gray-400 hover:border-amber-300 hover:underline hover:text-amber-300 px-8 py-4 mb-4`;
