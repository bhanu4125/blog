import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/write/:path*",
    "/dashboard/:path*",
    "/profile/edit",
    "/bookmarks",
  ],
};
