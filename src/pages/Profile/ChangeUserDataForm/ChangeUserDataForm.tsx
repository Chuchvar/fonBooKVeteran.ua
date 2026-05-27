import { TextField } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { authService } from '../../../services/auth.service';
import { IChangeUserData } from '../../../types/user.type';
import styles from './ChangeUserDataForm.module.scss';
import { toast } from 'react-toastify';

const ChangeUserDataForm: React.FC = () => {
	const {
		register: registerProfile,
		handleSubmit: handleSubmitProfile,
		formState: { errors: errorsProfile },
		reset: resetProfile,
	} = useForm<IChangeUserData>({ reValidateMode: 'onSubmit' });

	const {
		register: registerPassword,
		handleSubmit: handleSubmitPassword,
		formState: { errors: errorsPassword },
		reset: resetPassword,
	} = useForm<{ oldPassword?: string; newPassword?: string }>({ reValidateMode: 'onSubmit' });
	const queryClient = useQueryClient();

	const { mutate: mutateProfile } = useMutation({
		mutationKey: ['editUserProfile'],
		mutationFn: (data: Partial<IChangeUserData>) => authService.editUserData(data),
		onSuccess: () => {
			toast.success('Профіль успішно оновлено');
			queryClient.invalidateQueries({ queryKey: ['userData'] });
		},
		onError: (error: unknown) => {
			const err = error as { message?: string };
			toast.error(err.message || 'Помилка при оновленні профілю');
		},
	});

	const { mutate: mutatePassword } = useMutation({
		mutationKey: ['editUserPassword'],
		mutationFn: (data: { currentPassword?: string, newPassword?: string }) => authService.updatePassword(data),
		onSuccess: () => {
			toast.success('Пароль успішно змінено');
		},
		onError: (error: unknown) => {
			const err = error as { message?: string };
			toast.error(err.message || 'Помилка при зміні пароля');
		},
	});

	const onSubmitProfile: SubmitHandler<IChangeUserData> = (data) => {
		const profileData: Record<string, string> = {};
		if (data.name) profileData.name = data.name;
		if (data.phone) profileData.phone = data.phone;
		if (data.email) profileData.email = data.email;

		if (Object.keys(profileData).length > 0) {
			mutateProfile(profileData);
		}
		resetProfile();
	};

	const onSubmitPassword: SubmitHandler<{ oldPassword?: string; newPassword?: string }> = (data) => {
		if (data.oldPassword && data.newPassword) {
			mutatePassword({
				currentPassword: data.oldPassword,
				newPassword: data.newPassword,
			});
			resetPassword();
		} else {
			toast.error('Заповніть обидва поля для зміни пароля');
		}
	};



	return (
		<div className={styles.root}>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
				{/* Форма 1: Особисті дані */}
				<div>
					<p className={styles.edit} style={{ marginBottom: '15px' }}>Особисті дані</p>
					<form onSubmit={handleSubmitProfile(onSubmitProfile)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
						<TextField
							{...registerProfile('name', {
								minLength: {
									value: 3,
									message: "Ім'я має містити щонайменше 3 символи",
								},
								maxLength: {
									value: 50,
									message: 'ПІБ не має перевищувати 50 символів',
								},
								pattern: {
									value: /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s]+$/,
									message: "Ім'я може містити лише літери",
								},
							})}
							error={!!errorsProfile.name}
							helperText={errorsProfile.name?.message}
							id="outlined-basic-name"
							label="ПІБ"
							variant="outlined"
						/>
						<TextField
							{...registerProfile('email', {
								pattern: {
									value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
									message: 'Введіть коректну email адресу',
								},
								maxLength: {
									value: 100,
									message: 'Email не має перевищувати 100 символів',
								},
							})}
							error={!!errorsProfile.email}
							helperText={errorsProfile.email?.message}
							id="outlined-basic-email"
							label="Email"
							variant="outlined"
						/>
						<TextField
							{...registerProfile('phone', {
								pattern: {
									value: /^\+380\d{9}$/,
									message: 'Введіть коректний номер (+380...)',
								},
							})}
							error={!!errorsProfile.phone}
							helperText={errorsProfile.phone?.message}
							id="outlined-phone"
							label="Телефон (+380...)"
							variant="outlined"
						/>
						<div style={{ display: 'flex', alignItems: 'center' }}>
							<button type="submit" style={{ width: '100%' }}>Зберегти дані</button>
						</div>
					</form>
				</div>

				{/* Форма 2: Зміна пароля */}
				<div style={{ borderTop: '1px solid #ccc', paddingTop: '30px' }}>
					<p className={styles.edit} style={{ marginBottom: '15px' }}>Зміна пароля</p>
					<form onSubmit={handleSubmitPassword(onSubmitPassword)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
						<TextField
							{...registerPassword('oldPassword', {
								required: 'Для зміни пароля введіть поточний пароль',
								minLength: {
									value: 8,
									message: 'Пароль має містити щонайменше 8 символів',
								},
								pattern: {
									value: /\d/,
									message: 'Пароль має містити щонайменше одну цифру',
								},
							})}
							error={!!errorsPassword.oldPassword}
							helperText={errorsPassword.oldPassword?.message}
							id="outlined-basic-oldpass"
							label="Поточний пароль"
							variant="outlined"
							type="password"
						/>
						<TextField
							{...registerPassword('newPassword', {
								required: 'Введіть новий пароль',
								minLength: {
									value: 8,
									message: 'Пароль має містити щонайменше 8 символів',
								},
								pattern: {
									value: /\d/,
									message: 'Пароль має містити щонайменше одну цифру',
								},
							})}
							error={!!errorsPassword.newPassword}
							helperText={errorsPassword.newPassword?.message}
							id="outlined-basic-newpass"
							label="Новий пароль"
							variant="outlined"
							type="password"
						/>
						<div style={{ display: 'flex', alignItems: 'center' }}>
							<button type="submit" style={{ width: '100%' }}>Змінити пароль</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ChangeUserDataForm;
