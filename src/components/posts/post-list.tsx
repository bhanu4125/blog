"use client";

import { motion } from "framer-motion";
import { PostCard, type PostCardData } from "@/components/posts/post-card";
import { fadeInUpVariants, staggerContainerVariants } from "@/lib/motion";

type PostListProps = {
  posts: PostCardData[];
};

export function PostList({ posts }: PostListProps) {
  return (
    <motion.div
      role="list"
      initial="hidden"
      animate="visible"
      variants={staggerContainerVariants}
      className="flex flex-col"
    >
      {posts.map((post) => (
        <motion.div key={post.slug} role="listitem" variants={fadeInUpVariants}>
          <PostCard post={post} />
        </motion.div>
      ))}
    </motion.div>
  );
}
