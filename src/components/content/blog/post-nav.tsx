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

const Container = `flex justify-between gap-4 w-full mt-16`;

const PostNavBefore = `flex mr-2 text-left`;
const PostNavAfter = `flex ml-2 text-right`;

const PostNavLink = `border border-taupe hover:border-teak hover:text-teak px-6 py-4 mb-4 text-sm`;
