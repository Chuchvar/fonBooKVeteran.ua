import { TextField } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { authService } from '../../../services/auth.service';
import { IChangeUserData } from '../../../types/user.type';
import styles from './ChangeUserDataForm.module.scss';
import { toast } from 'react-toastify';

const ChangeUserDataForm: React.FC = () => {
	const queryClient = useQueryClient();

	const { mutate: mutateProfile } = useMutation({
		mutationKey: ['editUserProfile'],
		mutationFn: (data: Partial<IChangeUserData>) => authService.editUserData(data),
		onSuccess: () => {
			toast.success('Дані успішно оновлено');
			queryClient.invalidateQueries({ queryKey: ['userData'] });
		},
		onError: (error: unknown) => {
			const err = error as { message?: string };
			toast.error(err.message || 'Помилка при оновленні даних');
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

	const { register: regName, handleSubmit: hsName, formState: { errors: errName } } = useForm<{name: string}>({ reValidateMode: 'onSubmit' });
	const { register: regPhone, handleSubmit: hsPhone, formState: { errors: errPhone } } = useForm<{phone: string}>({ reValidateMode: 'onSubmit' });
	const { register: regEmail, handleSubmit: hsEmail, formState: { errors: errEmail } } = useForm<{email: string}>({ reValidateMode: 'onSubmit' });
	const { register: regPass, handleSubmit: hsPass, formState: { errors: errPass }, reset: resetPass, watch: watchPass } = useForm<{oldPassword?: string; newPassword?: string; confirmNewPassword?: string}>({ reValidateMode: 'onSubmit' });

	const newPasswordVal = watchPass('newPassword');

	const onSubmitName: SubmitHandler<{name: string}> = (data) => {
		if (data.name) mutateProfile({ name: data.name });
	};

	const onSubmitPhone: SubmitHandler<{phone: string}> = (data) => {
		if (data.phone) mutateProfile({ phone: data.phone });
	};

	const onSubmitEmail: SubmitHandler<{email: string}> = (data) => {
		if (data.email) mutateProfile({ email: data.email });
	};

	const onSubmitPassword: SubmitHandler<{ oldPassword?: string; newPassword?: string }> = (data) => {
		if (data.oldPassword && data.newPassword) {
			mutatePassword({
				currentPassword: data.oldPassword,
				newPassword: data.newPassword,
			});
			resetPass();
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
					
					<form onSubmit={hsName(onSubmitName)} style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
						<TextField
							{...regName('name', {
								required: 'Введіть нове ім\'я',
								minLength: { value: 3, message: "Ім'я має містити щонайменше 3 символи" },
								maxLength: { value: 50, message: 'ПІБ не має перевищувати 50 символів' },
								pattern: { value: /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s]+$/, message: "Ім'я може містити лише літери" },
							})}
							error={!!errName.name}
							helperText={errName.name?.message}
							label="Нове ПІБ"
							variant="outlined"
							style={{ flex: 1 }}
						/>
						<button type="submit" style={{ padding: '0 20px', whiteSpace: 'nowrap', height: '56px' }}>Зберегти ПІБ</button>
					</form>

					<form onSubmit={hsEmail(onSubmitEmail)} style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
						<TextField
							{...regEmail('email', {
								required: 'Введіть новий email',
								pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: 'Введіть коректну email адресу' },
								maxLength: { value: 100, message: 'Email не має перевищувати 100 символів' },
							})}
							error={!!errEmail.email}
							helperText={errEmail.email?.message}
							label="Новий Email"
							variant="outlined"
							style={{ flex: 1 }}
						/>
						<button type="submit" style={{ padding: '0 20px', whiteSpace: 'nowrap', height: '56px' }}>Зберегти Email</button>
					</form>

					<form onSubmit={hsPhone(onSubmitPhone)} style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
						<TextField
							{...regPhone('phone', {
								required: 'Введіть новий номер',
								pattern: { value: /^\+380\d{9}$/, message: 'Введіть коректний номер (+380...)' },
							})}
							error={!!errPhone.phone}
							helperText={errPhone.phone?.message}
							label="Новий телефон (+380...)"
							variant="outlined"
							style={{ flex: 1 }}
						/>
						<button type="submit" style={{ padding: '0 20px', whiteSpace: 'nowrap', height: '56px' }}>Зберегти телефон</button>
					</form>
				</div>

				<div style={{ borderTop: '1px solid #ccc', paddingTop: '30px' }}>
					<p className={styles.edit} style={{ marginBottom: '15px' }}>Зміна пароля</p>
					<form onSubmit={hsPass(onSubmitPassword)} style={{ display: 'flex', gap: '15px' }}>
						<TextField
							{...regPass('oldPassword', {
								required: 'Введіть поточний пароль',
								minLength: { value: 8, message: 'Щонайменше 8 символів' },
								pattern: { value: /\d/, message: 'Щонайменше одна цифра' },
							})}
							error={!!errPass.oldPassword}
							helperText={errPass.oldPassword?.message}
							label="Поточний пароль"
							variant="outlined"
							type="password"
							style={{ flex: 1 }}
						/>
						<TextField
							{...regPass('newPassword', {
								required: 'Введіть новий пароль',
								minLength: { value: 8, message: 'Щонайменше 8 символів' },
								pattern: { value: /\d/, message: 'Щонайменше одна цифра' },
							})}
							error={!!errPass.newPassword}
							helperText={errPass.newPassword?.message}
							label="Новий пароль"
							variant="outlined"
							type="password"
							style={{ flex: 1 }}
						/>
						<TextField
							{...regPass('confirmNewPassword', {
								required: 'Підтвердіть новий пароль',
								validate: (value) => value === newPasswordVal || 'Паролі не співпадають',
							})}
							error={!!errPass.confirmNewPassword}
							helperText={errPass.confirmNewPassword?.message}
							label="Підтвердження пароля"
							variant="outlined"
							type="password"
							style={{ flex: 1 }}
						/>
						<button type="submit" style={{ padding: '0 20px', whiteSpace: 'nowrap', height: '56px' }}>Змінити пароль</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ChangeUserDataForm;
