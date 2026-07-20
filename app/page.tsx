import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="bg-black text-white border-b-4 border-orange-500">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <img src="https://res.cloudinary.com/doedqs4f5/image/upload/q_auto/f_auto/v1777760646/Group_481425_f2ofnt.png" alt="Logo" className="h-8 w-9" />
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-black to-gray-900 px-4">
        <div className="text-center"><img src="https://res.cloudinary.com/doedqs4f5/image/upload/q_auto/f_auto/v1777761053/Group_481425_smh4p0.png" className='mx-auto mb-8  h-32 w-32' alt="" />
          <h1 className="text-5xl font-bold text-white">Welcome to Auth App</h1>
          <p className="mt-4 text-xl text-orange-400">
            A simple authentication system with signup, signin, and dashboard
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="rounded-lg bg-orange-600 px-8 py-3 font-medium text-white hover:bg-orange-700 transition shadow-lg hover:shadow-orange-500/50"
            >
              Signup
            </Link>
            <Link
              href="/signin"
              className="rounded-lg bg-orange-600 px-8 py-3 font-medium text-white hover:bg-orange-700 transition shadow-lg hover:shadow-orange-500/50"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-800 p-6 shadow-lg border border-orange-500">
             <div className="flex items-center justify-center">
  <div className="text-3xl font-bold text-orange-500">
    <img
      className="text-3xl"
      src="https://res.cloudinary.com/doedqs4f5/image/upload/q_auto/f_auto/v1776381361/verify_u5axg3.png"
      alt=""
    />
  </div>
</div>
              <h3 className="mt-4 font-semibold text-white">Secure</h3>
              <p className="mt-2 text-gray-400">Password hashing and JWT tokens</p>
            </div>
            <div className="rounded-lg bg-gray-800 p-6 shadow-lg border border-orange-500">
              <div className="flex items-center justify-center">
  <div className="text-3xl font-bold text-orange-500">
    <img
      className="text-3xl"
      src="https://res.cloudinary.com/doedqs4f5/image/upload/q_auto/f_auto/v1776381361/verify_u5axg3.png"
      alt=""
    />
  </div>
</div>
              <h3 className="mt-4 font-semibold text-white">Easy to Use</h3>
              <p className="mt-2 text-gray-400">Simple signup and signin forms</p>
            </div>
            <div className="rounded-lg bg-gray-800 p-6 shadow-lg border border-orange-500">
              <div className="flex items-center justify-center">
  <div className="text-3xl font-bold text-orange-500">
    <img
      className="text-3xl"
      src="https://res.cloudinary.com/doedqs4f5/image/upload/q_auto/f_auto/v1776381361/verify_u5axg3.png"
      alt=""
    />
  </div>
</div>
              <h3 className="mt-4 font-semibold text-white">MongoDB</h3>
              <p className="mt-2 text-gray-400">Backed by MongoDB database</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
