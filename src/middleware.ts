export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/write/:path*", "/dashboard/:path*", "/profile/edit"],
};
