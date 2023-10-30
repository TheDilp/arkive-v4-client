import { StytchLogin } from "@stytch/react";
import { Products } from "@stytch/vanilla-js";

const REDIRECT_URL = "http://localhost:5173/sign-in";
const config = {
  products: [Products.passwords],
  passwordOptions: {
    loginExpirationMinutes: 120,
    loginRedirectURL: "http://localhost:5173/projects",
    resetPasswordExpirationMinutes: 120,
    resetPasswordRedirectURL: REDIRECT_URL,
  },
};

export function SignIn() {
  // const [data, setData] = useState({ email: "", password: "", passwordConfirm: "" });
  // const [step, setStep] = useState(0);
  // function changeStep() {
  //   if (step === 0 && data.email) setStep(1);
  // }
  // function isDisabled() {
  //   if (step === 0 && !data.email) return true;
  //   if (step === 1 && (!data.password || !data.passwordConfirm || data.password !== data.passwordConfirm)) return true;
  //   return false;
  // }

  // const { handleChange } = useHandleChange({ data, setData });
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <StytchLogin config={config} />
    </div>
  );

  // return (
  //   <div className="flex h-screen w-screen items-center justify-center">
  //     <div className="flex w-1/4 min-w-[20rem] flex-col gap-y-2 rounded bg-zinc-800 p-4 shadow-md">
  //       <h2 className="text-center font-merriweather text-2xl">Sign up or Sign in</h2>
  //       <div>
  //         <Input name="email" onChange={handleChange} placeholder="Email" type="email" value={data?.email} />
  //       </div>
  //       {step === 1 ? (
  //         <>
  //           <div>
  //             <Input name="password" onChange={handleChange} placeholder="Password" type="password" value={data?.password} />
  //           </div>
  //           <div>
  //             <Input
  //               name="passwordConfirm"
  //               onChange={handleChange}
  //               placeholder="Confirm password"
  //               type="password"
  //               value={data?.passwordConfirm}
  //             />
  //           </div>
  //         </>
  //       ) : null}
  //       <div>
  //         <Button isDisabled={isDisabled()} label="Next" onClick={changeStep} variant="primary" />
  //       </div>
  //     </div>
  //   </div>
  // );
}
