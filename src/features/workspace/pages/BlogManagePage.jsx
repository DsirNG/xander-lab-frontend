import React from 'react';
import BlogManagePanel from '@features/profile/components/BlogManagePanel';

const BlogManagePage = () => (
  <div className="flex h-screen flex-col bg-surface">
    <main className="mx-auto flex h-full w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <BlogManagePanel />
    </main>
  </div>
);

export default BlogManagePage;
