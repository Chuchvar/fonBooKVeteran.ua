import { useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { authService } from "../../services/auth.service";
import style from "./Auth.module.scss";
import { CircularProgress } from "@mui/material";
import { FaEnvelopeOpenText } from "react-icons/fa";

interface IVerification {
  verification_code: string;
}

interface SignupCompleteProps {
  email: string;
}

export const SignupComplete: React.FC<SignupCompleteProps> = ({ email }) => {
  const navigate = useNavigate();

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setCode((prevCode) => {
      const newCode = prevCode.split("");
      newCode[index] = value;
      return newCode.join("");
    });

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const {
    handleSubmit,
  } = useForm<IVerification>();

  const { mutate } = useMutation({
    mutationKey: ["verifySignup"],
    mutationFn: (data: { email: string, verification_code: string }) =>
      authService.signupComplete(data.email, data.verification_code),
    onSuccess(data) {
      toast.success("Account created and verified successfully");
      window.localStorage.setItem("jwt", data.token);
      navigate("/");
    },
    onError(error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "An error occurred");
    },
    onSettled() {
      setLoading(false);
    },
  });

  const onSubmit: SubmitHandler<IVerification> = () => {
    if (code.length !== 6) {
      toast.error("Verification code must be exactly 6 digits");
      return;
    }
    mutate({ email, verification_code: code });
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && index > 0 && !e.currentTarget.value) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "Enter") {
      if (code.length === 6) {
        setLoading(true);
        toast.success("Verification code submitted successfully");
        handleSubmit(onSubmit)();
      } else {
        toast.error("Please enter a valid 6-digit code");
      }
    }
  };

  return (
    <div className={style.complete}>
      <div className={style.iconWrapper}>
        <FaEnvelopeOpenText className={style.icon} />
      </div>
      <h1>Check your Email</h1>
      <p className={style.subtitle}>
        Ми надіслали 6-значний код на <br />
        <strong>{email}</strong>
      </p>

      <form className={style.form} onSubmit={handleSubmit(onSubmit)}>
        <div className={style.inputs_row}>
          {[...new Array(6)].map((_, index) => (
            <input
              key={index}
              value={code[index] || ""}
              onChange={(e) => handleInputChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              maxLength={1}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
            />
          ))}
        </div>

        <button type="submit" className={style.submitCodeBtn} disabled={loading || code.length !== 6}>
          {loading ? (
            <CircularProgress size="24px" sx={{ color: "#fff" }} />
          ) : (
            "Verify Account"
          )}
        </button>
      </form>
    </div>
  );
};

export default SignupComplete;
