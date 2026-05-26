import { useMutation } from '@tanstack/react-query'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import style from './Auth.module.scss'

import { CircularProgress } from '@mui/material'
import { Link } from 'react-router-dom'
import { authService } from '../../services/auth.service'
import { IUser } from '../../types/user.type'
import { PAGES } from '../../constants/url.constants'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

declare global {
	interface Window {
		google?: unknown;
	}
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const Login: React.FC = () => {
	const navigate = useNavigate()
	const [isLoading, setIsLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [rememberMe, setRememberMe] = useState(true)

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<IUser>({ reValidateMode: 'onSubmit' })

	const { mutate } = useMutation({
		mutationKey: ['login'],
		mutationFn: (data: IUser) => authService.login(data),
		onMutate() {
			setIsLoading(true)
		},
		onSuccess(data) {
			toast.success('Log in Successfully')
			if (data.token) {
			  if (rememberMe) {
			    window.localStorage.setItem("jwt", data.token);
			  } else {
			    window.sessionStorage.setItem("jwt", data.token);
			  }
			}
      		navigate(PAGES.PROFILE)
			reset()
		},
		onError(error: unknown) {
			const err = error as { response?: { data?: { error?: string } } };
			toast.error(err.response?.data?.error || 'Помилка з\'єднання з сервером')
		},
		onSettled() {
			setIsLoading(false)
		},
	})

	const handleGoogleCallback = async (response: { credential?: string }) => {
		try {
			setIsLoading(true)
			const data = await authService.googleLogin(response.credential)
			if (data.token) {
				window.localStorage.setItem("jwt", data.token)
			}
			toast.success('Вхід через Google успішний!')
			navigate(PAGES.PROFILE)
		} catch (error: unknown) {
			const err = error as { response?: { data?: { error?: string } } };
			toast.error(err.response?.data?.error || 'Помилка входу через Google')
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		const script = document.createElement('script')
		script.src = 'https://accounts.google.com/gsi/client'
		script.async = true
		script.defer = true
		script.onload = () => {
			if (window.google && GOOGLE_CLIENT_ID) {
				window.google.accounts.id.initialize({
					client_id: GOOGLE_CLIENT_ID,
					callback: handleGoogleCallback,
				})
				window.google.accounts.id.renderButton(
					document.getElementById('google-signin-btn-login'),
					{ theme: 'filled_black', size: 'large', type: 'standard', shape: 'pill', text: 'signin_with' }
				)
			}
		}
		document.body.appendChild(script)
		return () => {
			document.body.removeChild(script)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const onSubmit = (data: IUser) => {
		mutate(data)
	}

	return (
		<div className={style.authContainer}>
			<div className={style.auth}>
				<div className={style.left}></div>
				<div className={style.right}>
					<div className={style.backButton}>
						<Link to={PAGES.HOME} style={{ textDecoration: 'none', color: '#0d7377', fontWeight: 'bold', fontSize: '18px' }}>
							⟵ На головну
						</Link>
					</div>
					<div className={style.header}>
						<div>
							<p>Don't have an account?</p>
							<Link to='/auth/signup' className={style.login}>
								Sign up
							</Link>
						</div>
					</div>
					<div className={style.wrapper}>
						<h1>Log In to your Account</h1>
						<form onSubmit={handleSubmit(onSubmit)} className={style.form}>
							<div className={style.input_box}>
								<input
									{...register('email', {
										required: 'Email is required',
										pattern: {
											value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
											message: 'Enter a valid email address',
										},
										maxLength: {
											value: 100,
											message: 'Email must not exceed 100 characters',
										},
									})}
									className={style.input_field}
									placeholder=' '
									type='email'
								/>

								<label htmlFor='email' className={style.label}>
									Email
								</label>
							</div>
							<p className={style.error}>
								{errors.email ? errors.email.message : ''}
							</p>

							<div className={style.input_box}>
								<input
									{...register('password', {
										required: 'Password is required',
										minLength: {
											value: 8,
											message: 'Password must be at least 8 characters long',
										},
										pattern: {
											value: /\d/,
											message: 'Password must contain at least one number',
										},
									})}
									className={style.input_field}
									placeholder=' '
									type={showPassword ? 'text' : 'password'}
								/>

								<label htmlFor='password' className={style.label}>
									Password
								</label>
								<div className={style.eye_icon} onClick={() => setShowPassword(!showPassword)}>
									{showPassword ? <FaEyeSlash /> : <FaEye />}
								</div>
							</div>
							<p className={style.error}>
								{errors.password ? errors.password.message : ''}
							</p>

							<label className={style.remember_me}>
								<input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
								Запам'ятати мене
							</label>

							<button
								type='submit'
								className={style.submitButton}
								disabled={isLoading}
							>
								{isLoading ? (
									<CircularProgress size='30px' sx={{ color: '#fff' }} />
								) : (
									'CONTINUE'
								)}
							</button>
						</form>

						<div className={style.or}>
							<div className={style.line} />
							<span className={style.span}>OR</span>
							<div className={style.line} />
						</div>

						<div className={style.googleBtn}>
							<div id="google-signin-btn-login"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Login

