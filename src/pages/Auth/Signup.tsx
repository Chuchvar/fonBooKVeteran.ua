import { useMutation } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import style from "./Auth.module.scss";

import { CircularProgress } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import type { IUser } from "../../types/user.type";
import SignupComplete from "./SignupComplete";
import { PAGES } from "../../constants/url.constants";
import { FaEye, FaEyeSlash } from "react-icons/fa";

declare global {
  interface Window {
    google?: unknown;
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const Signup: React.FC = () => {
  const [complete, setComplete] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<IUser>({ reValidateMode: "onSubmit" });

  const { mutate } = useMutation({
    mutationKey: ["register"],
    mutationFn: (data: IUser) => authService.signup(data),
    onMutate() {
      setIsLoading(true);
    },
    onSuccess(data, variables) {
      setRegisteredEmail(variables.email);
      setComplete(true);
      toast.success(data.message || "Успішна реєстрація! Перевірте email.");
    },
    onError(error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      const message = err.response?.data?.error || "Помилка мережі або CORS";
      toast.error(message);
      console.error("Деталі помилки:", err);
    },
    onSettled() {
      setIsLoading(false);
    },
  });

  const handleGoogleCallback = async (response: { credential?: string }) => {
    try {
      setIsLoading(true);
      const data = await authService.googleLogin(response.credential);
      if (data.token) {
        window.localStorage.setItem("jwt", data.token);
      }
      toast.success("Реєстрація через Google успішна!");
      navigation(PAGES.PROFILE);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Помилка реєстрації через Google");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn-signup'),
          { theme: 'filled_black', size: 'large', type: 'standard', shape: 'pill', text: 'signup_with' }
        );
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIsChecked(checked);
    setValue("termsAccepted", checked);
  };

  const onSubmit = (data: IUser) => {
    mutate(data);
  };

  return (
    <div className={style.authContainer}>
      <div className={style.auth}>
        <div className={style.left}></div>
        <div className={style.right}>
          {complete ? (
            <SignupComplete email={registeredEmail} />
          ) : (
            <>
              <div className={style.backButton}>
                <Link to={PAGES.HOME} style={{ textDecoration: 'none', color: '#0d7377', fontWeight: 'bold', fontSize: '18px' }}>
                  ⟵ На головну
                </Link>
              </div>
              <div className={style.header}>
                <div>
                  <p>Already have an account?</p>
                  <Link to="/auth/login" className={style.login}>
                    Log in
                  </Link>
                </div>
              </div>
              <div className={style.wrapper}>
                <h1>Create an account</h1>
                <form onSubmit={handleSubmit(onSubmit)} className={style.form}>
                  <div className={style.input_box}>
                    <input
                      {...register("name", {
                        required: "Name is required",
                        minLength: {
                          value: 3,
                          message: "Name must be at least 3 characters long",
                        },
                        maxLength: {
                          value: 50,
                          message: "Full name must not exceed 50 characters",
                        },
                        pattern: {
                          value: /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s]+$/,
                          message: "Full name can only include letters",
                        },
                      })}
                      className={style.input_field}
                      placeholder=" "
                      type="text"
                    />

                    <label htmlFor="name" className={style.label}>
                      Name
                    </label>
                  </div>
                  <p className={style.error}>
                    {errors.name ? errors.name.message : ""}
                  </p>

                  <div className={style.input_box}>
                    <input
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value:
                            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                          message: "Enter a valid email address",
                        },
                        maxLength: {
                          value: 100,
                          message: "Email must not exceed 100 characters",
                        },
                      })}
                      className={style.input_field}
                      placeholder=" "
                      type="email"
                    />

                    <label htmlFor="email" className={style.label}>
                      Email
                    </label>
                  </div>
                  <p className={style.error}>
                    {errors.email ? errors.email.message : ""}
                  </p>

                  <div className={style.input_box}>
                    <input
                      {...register("phone", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^\+380\d{9}$/,
                          message: "Phone must start with +380 and contain 9 extra digits",
                        },
                      })}
                      className={style.input_field}
                      placeholder=" "
                      type="tel"
                    />

                    <label htmlFor="phone" className={style.label}>
                      Phone (+380...)
                    </label>
                  </div>
                  <p className={style.error}>
                    {errors.phone ? errors.phone.message : ""}
                  </p>

                  <div className={style.input_box}>
                    <input
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message:
                            "Password must be at least 8 characters long",
                        },
                        pattern: {
                          value: /\d/,
                          message: "Password must contain at least one number",
                        },
                      })}
                      className={style.input_field}
                      placeholder=" "
                      type={showPassword ? "text" : "password"}
                    />

                    <label htmlFor="password" className={style.label}>
                      Password
                    </label>
                    <div className={style.eye_icon} onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </div>
                  </div>
                  <p className={style.error}>
                    {errors.password ? errors.password.message : ""}
                  </p>

                  <div className={style.terms}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={handleCheckboxChange}
                    />
                    <p>
                      By creating an account, I agree to our{" "}
                      <span>Terms of use</span> and <span>Privacy Policy</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    className={`${
                      isChecked ? style.submitButton : style.disabled
                    }`}
                    disabled={!isChecked || isLoading}
                  >
                    {isLoading ? (
                      <CircularProgress size="30px" sx={{ color: "#fff" }} />
                    ) : (
                      "Get started"
                    )}
                  </button>
                </form>

                <div className={style.or}>
                  <div className={style.line} />
                  <span className={style.span}>OR</span>
                  <div className={style.line} />
                </div>

                <div className={style.googleBtn}>
                  <div id="google-signin-btn-signup"></div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;

