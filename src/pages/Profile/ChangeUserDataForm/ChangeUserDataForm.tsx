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
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<IChangeUserData>({ reValidateMode: 'onSubmit' });
	const queryClient = useQueryClient();

	const { mutate } = useMutation({
		mutationKey: ['editUserData'],
		mutationFn: (data: IChangeUserData) => authService.editUserData(data),
		onSuccess: () => {
			toast.success('Your data was changed successfully');
			queryClient.invalidateQueries({ queryKey: ['userData'] });
		},
		onError: (error: unknown) => {
			const err = error as { message?: string };
			toast.error(err.message || 'An error occurred');
		},
	});
	
	

	const onSubmit: SubmitHandler<IChangeUserData> = (data) => {
		const editUserData = {
			name: data.name,
			email: data.email,
			currentPassword: data.oldPassword,
			newPassword: data.newPassword,
		};
		// @ts-expect-error This is needed because the types might not match exactly
		mutate(editUserData);
		reset();
	};



	return (
		<div className={styles.root}>
			<p className={styles.edit}>Edit your data</p>
			<form onSubmit={handleSubmit(onSubmit)}>
				<TextField
					{...register('name', {
						minLength: {
							value: 3,
							message: 'Name must be at least 3 characters long',
						},
						maxLength: {
							value: 50,
							message: 'Full name must not exceed 50 characters',
						},
						pattern: {
							value: /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s]+$/,
							message: 'Full name can only include letters',
						},
					})}
					error={!!errors.name}
					helperText={errors.name?.message}
					id="outlined-basic"
					label="Full name"
					variant="outlined"
				/>
				<TextField
					{...register('email', {
						pattern: {
							value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
							message: 'Enter a valid email address',
						},
						maxLength: {
							value: 100,
							message: 'Email must not exceed 100 characters',
						},
					})}
					error={!!errors.email}
					helperText={errors.email?.message}
					id="outlined-basic"
					label="Email"
					variant="outlined"
				/>
				<TextField
					{...register('oldPassword', {
						required: 'To change data enter your current password',
						minLength: {
							value: 8,
							message: 'Password must be at least 8 characters long',
						},
						pattern: {
							value: /\d/,
							message: 'Password must contain at least one number',
						},
					})}
					error={!!errors.oldPassword}
					helperText={errors.oldPassword?.message}
					id="outlined-basic"
					label="Current password"
					variant="outlined"
					type="password"
				/>
				<TextField
					{...register('newPassword', {
						minLength: {
							value: 8,
							message: 'Password must be at least 8 characters long',
						},
						pattern: {
							value: /\d/,
							message: 'Password must contain at least one number',
						},
					})}
					error={!!errors.newPassword}
					helperText={errors.newPassword?.message}
					id="outlined-basic"
					label="New password"
					variant="outlined"
					type="password"
				/>
				<button type="submit">Edit data</button>
			</form>
		</div>
	);
};

export default ChangeUserDataForm;
