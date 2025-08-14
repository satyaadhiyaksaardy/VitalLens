import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

// Protect all routes except auth and API auth routes
export const config = {
  matcher: ['/((?!api/auth|auth/signin|_next/static|_next/image|favicon.ico).*)']
}