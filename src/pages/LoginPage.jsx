import { Link } from "react-router-dom";
import login from "../assets/Images/login.jpeg";
export function SignIn() {
  return (
    <section className="m-8  flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Sign In</h2>
          <p className="text-lg font-normal text-gray-500">Enter your email and password to Sign In.</p>
        </div>
        <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
          <div className="mb-1 flex flex-col gap-6">
            <label className="text-sm text-gray-500 font-medium mb-3">
              Your email
              <input
                type="email"
                placeholder="name@mail.com"
                className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
              />
            </label>
            <label className="text-sm text-gray-500 font-medium mb-3">
              Password
              <input
                type="password"
                placeholder="********"
                className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
              />
            </label>
          </div>
          <label className="flex items-center space-x-2 -ml-2.5">
            <input type="checkbox" className="form-checkbox" />
            <span className="text-sm text-gray-500 font-medium">
              I agree to the&nbsp;
              <a href="#" className="text-black underline hover:text-gray-900">Terms and Conditions</a>
            </span>
          </label>
          {/* come back and change when official into button */}
          {/* <button className="mt-6 w-full py-2 bg-lime-500 text-white rounded-lg">Sign In</button> */}
          <Link to="/homepage" className="mt-6 w-full py-2 bg-lime-500 text-white rounded-lg block text-center">
            Sign In
            </Link>

          <div className="flex items-center justify-between gap-2 mt-6">
            <label className="flex items-center space-x-2 -ml-2.5">
              <input type="checkbox" className="form-checkbox" />
              <span className="text-sm text-gray-500 font-medium">
                Subscribe me to newsletter
              </span>
            </label>
            <a href="#" className="text-sm text-gray-900 font-medium underline">Forgot Password</a>
          </div>
          <p className="text-center text-gray-500 mt-4">
            Not registered? 
            <Link to="/auth/sign-up" className="text-gray-900 ml-1">Create account
            </Link>
          </p>
          <div className="h-40">
            {/* gap for asthetics*/}
          </div>
        </form>

      </div>
      <div className="w-2/5 h-128 ">
        <img src={login} className="h-full w-full object-cover rounded-3xl" alt="" />
      </div>

    </section>
  );
}

export default SignIn;
