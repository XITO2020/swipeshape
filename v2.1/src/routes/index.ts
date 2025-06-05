
export const routes = {
    home: "/",
    login: "/login",
    register: "/register",
    dashboard: "/dashboard",
    programs: "/programs",
    program: (id: string) => `/programs/${id}`,
    blog: '/blog',
    blogPost: (slug: string) => `/blog/${slug}`,
    admin: {
      index: "/admin",
      articles: "/admin/articles",
      videos: "/admin/videos",
      users: "/admin/users",
      comments: "/admin/comments",
      upload: "/admin/upload",
    },
    profile: "/profile",
    terms: "/terms",
    privacy: "/privacy",
    notFound: "/404",
  }
  