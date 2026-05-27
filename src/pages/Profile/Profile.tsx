import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { PAGES } from '../../constants/url.constants'
import { authService } from '../../services/auth.service'
import { bookingService } from '../../services/booking.service'
import { verificationService } from '../../services/verification.service'
import axios from '../../utils/axios'

import { CiBookmarkCheck, CiUser, CiCircleCheck } from 'react-icons/ci'

import avatar from '../../assets/profile/user-avatar.png'
import styles from './Profile.module.scss'
import ChangeUserDataForm from './ChangeUserDataForm/ChangeUserDataForm'

interface IBookingData {
    id: number;
    sanatorium?: { name?: string; region?: string; };
    status: string;
    checkInDate: string;
    checkOutDate: string;
    message?: string;
    totalPrice?: number;
    packageType?: string;
    rejectionReason?: string;
}

const Profile: React.FC = () => {
	const [section, setSection] = useState(1)
	const navigate = useNavigate()

	const { mutate: logout } = useMutation({
		mutationKey: ['logout'],
		mutationFn: () => authService.logout(),
		onSuccess: () => {
			localStorage.removeItem('jwt')
			toast.success('Ви успішно вийшли з акаунту')
			navigate(PAGES.HOME)
		},
		onError: () => {
			toast.error('Помилка при виході. Спробуйте ще раз')
		},
	})

	const { data: userData, isLoading: isUserDataLoading } = useQuery({
		queryKey: ['userData'],
		queryFn: () => authService.getUserData(),
		retry: false,
	})

	const { data: userBookings, isLoading: isBookingsLoading } = useQuery({
		queryKey: ['userBookings'],
		queryFn: () => bookingService.getUserBookings(),
		retry: false,
	})

	const { data: userPhotoUrl } = useQuery({
		queryKey: ['userPhoto', userData?.user?.email],
		queryFn: async () => {
			try {
				const response = await axios.get('/api/user/photo', { responseType: 'blob' })
				return URL.createObjectURL(response.data)
			} catch {
				return null
			}
		},
		enabled: !!userData?.user?.verificationStatus && userData.user.verificationStatus !== 'UNVERIFIED',
	})

	const getFormattedDate = () => {
		const options: Intl.DateTimeFormatOptions = {
			weekday: 'long',
			day: '2-digit',
			month: 'long',
			year: 'numeric',
		}
		return new Date().toLocaleDateString('uk-UA', options)
	}

	const [photo, setPhoto] = useState<File | null>(null)
	const [document, setDocument] = useState<File | null>(null)

	const queryClient = useQueryClient();

	const { mutate: verifyAccount, isPending: isVerifying } = useMutation({
		mutationFn: (formData: FormData) => verificationService.submitVerification(formData),
		onSuccess: () => {
			toast.success('Документи успішно відправлені на перевірку!')
			queryClient.invalidateQueries({ queryKey: ['userData'] })
			setPhoto(null)
			setDocument(null)
		},
		onError: (err: unknown) => {
			const error = err as { message?: string };
			toast.error(error?.message || 'Помилка при відправці документів')
		}
	})

	const handleVerificationSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!photo || !document) {
			toast.error('Будь ласка, завантажте фото та документ')
			return
		}

		const formData = new FormData()
		formData.append('photo', photo)
		formData.append('document', document)

		verifyAccount(formData)
	}

	const [isEditingPhone, setIsEditingPhone] = useState(false)
	const [newPhone, setNewPhone] = useState('')

	const { mutate: updateProfile } = useMutation({
		mutationFn: (data: { phone: string }) => authService.editUserData(data),
		onSuccess: () => {
			toast.success('Телефон успішно змінено')
			queryClient.invalidateQueries({ queryKey: ['userData'] })
			setIsEditingPhone(false)
		},
		onError: () => {
			toast.error('Помилка при зміні телефону')
		}
	})

	const [payingBookingId, setPayingBookingId] = useState<number | null>(null)
	const [cardNumber, setCardNumber] = useState('')
	const [cardExpiry, setCardExpiry] = useState('')
	const [cardCvv, setCardCvv] = useState('')
	const [isSimulatingPayment, setIsSimulatingPayment] = useState(false)

	const { mutate: payBooking } = useMutation({
		mutationFn: (bookingId: number) => bookingService.payBooking(bookingId),
		onSuccess: () => {
			toast.success('Оплату успішно здійснено!')
			queryClient.invalidateQueries({ queryKey: ['userBookings'] })
			setPayingBookingId(null)
			setCardNumber('')
			setCardExpiry('')
			setCardCvv('')
			setIsSimulatingPayment(false)
		},
		onError: (err: unknown) => {
			const error = err as { message?: string };
			toast.error(error?.message || 'Помилка при оплаті')
			setIsSimulatingPayment(false)
		}
	})

	const handlePaymentSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (cardNumber.length !== 16) {
			toast.error('Номер картки повинен містити 16 цифр')
			return
		}
		if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
			toast.error('Термін дії повинен бути у форматі MM/YY')
			return
		}
		const month = parseInt(cardExpiry.split('/')[0])
		if (month < 1 || month > 12) {
			toast.error('Місяць повинен бути від 01 до 12')
			return
		}
		if (cardCvv.length !== 3) {
			toast.error('CVV повинен містити 3 цифри')
			return
		}
		if (!payingBookingId) return
		setIsSimulatingPayment(true)
		setTimeout(() => {
			payBooking(payingBookingId)
		}, 1500)
	}

	const getStatusLabel = (status: string) => {
		switch (status) {
			case 'PENDING': return 'Розглядається'
			case 'CONFIRMED': return 'Очікує оплати'
			case 'PAID': return 'Оплачено'
			case 'REJECTED': return 'Відхилено'
			case 'CANCELLED': return 'Скасовано'
			default: return status
		}
	}

	const getStatusClass = (status: string) => {
		switch (status) {
			case 'PENDING': return styles.statusPending
			case 'CONFIRMED': return styles.statusConfirmed
			case 'PAID': return styles.statusPaid
			case 'REJECTED': return styles.statusRejected
			case 'CANCELLED': return styles.statusCancelled
			default: return ''
		}
	}

	if (isUserDataLoading || isBookingsLoading) {
		return (
			<div className={styles.loading}>
				<p>Завантаження...</p>
			</div>
		)
	}

	if (!userData || !userData.user) {
		return (
			<div className={styles.loading}>
				<p>Помилка: Не вдалося завантажити профіль користувача. Перевірте з'єднання або увійдіть знову.</p>
			</div>
		)
	}

	return (
		<div className={styles.root}>
			<div className={styles.bg}>
				<div className={styles.wrapper}>
					<div className={styles.text__wrapper}>
						<p className={styles.text1}>Особистий кабінет</p>
						<div className={styles.links}>
							<Link to={PAGES.HOME}>ГОЛОВНА</Link>
							<span>&gt;</span>
							<p>КАБІНЕТ</p>
						</div>
					</div>
				</div>
			</div>
			<div className={styles.content}>
				<div className={styles.left}>
					<div onClick={() => setSection(1)} className={`${styles.sidebarItem} ${section === 1 ? styles.active : ''}`}>
						<CiUser className={styles.icon} color='#0d7377' size={24} />
						<span className={styles.sidebarText}>Мій Профіль</span>
					</div>
					<div onClick={() => setSection(2)} className={`${styles.sidebarItem} ${section === 2 ? styles.active : ''}`}>
						<CiBookmarkCheck className={styles.icon} color='#0d7377' size={24} />
						<span className={styles.sidebarText}>Мої Заявки</span>
					</div>
					<div onClick={() => setSection(3)} className={`${styles.sidebarItem} ${section === 3 ? styles.active : ''}`}>
						<CiCircleCheck className={styles.icon} color='#0d7377' size={24} />
						<span className={styles.sidebarText}>Верифікація</span>
					</div>
				</div>
				<div className={styles.right}>
					{section === 1 ? (
						<>
							<p className={styles.welcome}>Вітаємо, {userData.user.name}</p>
							<p className={styles.date}>{getFormattedDate()}</p>
							<div>
								<div className={styles.info}>
									<div className={styles.info__left}>
										<div className={styles.avatar}>
											<div className={styles.avatar__left}>
												<img 
													className={styles.avatar__icon} 
													src={userData?.user?.photoPath ? `http://localhost:8080/${userData.user.photoPath.replace(/\\/g, '/')}` : (userPhotoUrl || avatar)} 
													alt='avatar' 
													style={(userData?.user?.photoPath || userPhotoUrl) ? { objectFit: 'cover', width: '64px', height: '64px', borderRadius: '50%' } : {}}
												/>
											</div>
											<div className={styles.avatar__right}>
												<p className={styles.name}>{userData.user.name}</p>
												<p className={styles.email}>{userData.user.email}</p>
												<div style={{ marginTop: '10px' }}>
													{isEditingPhone ? (
														<div style={{ display: 'flex', gap: '10px' }}>
															<input 
																type="text" 
																value={newPhone} 
																onChange={e => setNewPhone(e.target.value)}
																placeholder="+380..."
																style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
															/>
															<button onClick={() => updateProfile({ phone: newPhone })} style={{ background: '#0d7377', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Зберегти</button>
															<button onClick={() => setIsEditingPhone(false)} style={{ background: '#ccc', color: 'black', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Скасувати</button>
														</div>
													) : (
														<p style={{ color: '#666' }}>
															{userData.user.phone || 'Телефон не вказано'}
															<span style={{ marginLeft: '10px', color: '#0d7377', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }} onClick={() => { setIsEditingPhone(true); setNewPhone(userData.user.phone || ''); }}>Змінити</span>
														</p>
													)}
												</div>
											</div>
										</div>
									</div>
									<div className={styles.info__right}>
										<button 
											style={{
												background: 'linear-gradient(135deg, #0a5c5f, #0d7377, #14a3a8)', 
												color: 'white', 
												border: 'none', 
												padding: '10px 20px', 
												cursor: 'pointer',
												fontFamily: 'Cormorant Garamond, serif',
												fontSize: '16px',
												textTransform: 'uppercase',
												borderRadius: '50px'
											}} 
											onClick={() => logout()}
										>
											Вийти з акаунту
										</button>
									</div>
								</div>
							</div>
							<div style={{ marginTop: '30px' }}>
								<ChangeUserDataForm />
							</div>
						</>
					) : section === 2 ? (
						<>
							<p className={styles.welcome}>Мої заявки</p>
							<div className={styles.bookingsList}>
								{userBookings && userBookings.length > 0 ? (
									userBookings.map((booking: IBookingData) => (
										<div className={styles.bookingCard} key={booking.id}>
											<div className={styles.bookingHeader}>
												<h4 className={styles.bookingSanatorium}>
													{booking.sanatorium?.name || 'Санаторій'}
												</h4>
												<span className={`${styles.bookingStatus} ${getStatusClass(booking.status)}`}>
													{getStatusLabel(booking.status)}
												</span>
											</div>
											<div className={styles.bookingInfo}>
												<p>
													<span className={styles.bookingLabel}>Заїзд:</span> {booking.checkInDate}
												</p>
												<p>
													<span className={styles.bookingLabel}>Виїзд:</span> {booking.checkOutDate}
												</p>
												{booking.sanatorium?.region && (
													<p>
														<span className={styles.bookingLabel}>Регіон:</span> {booking.sanatorium.region}
													</p>
												)}
												{booking.message && (
													<p>
														<span className={styles.bookingLabel}>Коментар:</span> {booking.message}
													</p>
												)}
												{booking.totalPrice != null && (
													<p>
														<span className={styles.bookingLabel}>Вартість:</span> {booking.totalPrice > 0 ? `${booking.totalPrice} ₴` : 'Безкоштовно'}
													</p>
												)}
												{booking.packageType && (
													<p>
														<span className={styles.bookingLabel}>Пакет:</span> {booking.packageType === 'STANDARD' ? 'Стандарт' : booking.packageType === 'PREMIUM' ? 'Преміум' : 'Реабілітація'}
													</p>
												)}
												{booking.status === 'REJECTED' && booking.rejectionReason && (
													<div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#ffebee', borderLeft: '4px solid #c62828', color: '#c62828', fontSize: '14px' }}>
														<strong>Причина відмови:</strong><br/>
														{booking.rejectionReason}
													</div>
												)}
												{booking.status === 'CONFIRMED' && booking.totalPrice !== undefined && booking.totalPrice > 0 && (
													<div style={{ marginTop: '12px' }}>
														{payingBookingId === booking.id ? (
															<form onSubmit={handlePaymentSubmit} style={{ background: '#f5f9ff', padding: '15px', borderRadius: '8px', border: '1px solid #bbdefb' }}>
																<p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#0d47a1' }}>Безпечна Оплата — {booking.totalPrice} ₴</p>
																<div style={{ marginBottom: '8px' }}>
																	<label style={{ fontSize: '12px', textTransform: 'uppercase', color: '#666', fontWeight: 'bold' }}>Номер картки</label>
																	<input type="text" placeholder="0000 0000 0000 0000" maxLength={16} value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px', boxSizing: 'border-box' }} />
																</div>
																<div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
																	<div style={{ flex: 1 }}>
																		<label style={{ fontSize: '12px', textTransform: 'uppercase', color: '#666', fontWeight: 'bold' }}>Термін дії</label>
																		<input type="text" placeholder="MM/YY" maxLength={5} value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px', boxSizing: 'border-box' }} />
																	</div>
																	<div style={{ flex: 1 }}>
																		<label style={{ fontSize: '12px', textTransform: 'uppercase', color: '#666', fontWeight: 'bold' }}>CVV</label>
																		<input type="password" placeholder="•••" maxLength={3} value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px', boxSizing: 'border-box' }} />
																	</div>
																</div>
																<div style={{ display: 'flex', gap: '10px' }}>
																	<button type="button" onClick={() => setPayingBookingId(null)} disabled={isSimulatingPayment} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>Скасувати</button>
																	<button type="submit" disabled={isSimulatingPayment} style={{ flex: 2, padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'linear-gradient(135deg, #0a5c5f, #0d7377)', color: 'white', fontWeight: 'bold' }}>{isSimulatingPayment ? 'Обробка платежу...' : `Оплатити ${booking.totalPrice} ₴`}</button>
																</div>
															</form>
														) : (
															<button onClick={() => setPayingBookingId(booking.id)} style={{ background: 'linear-gradient(135deg, #0a5c5f, #0d7377)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', width: '100%' }}>💳 Оплатити {booking.totalPrice} ₴</button>
														)}
													</div>
												)}
											</div>
										</div>
									))
								) : (
									<div className={styles.emptyBookings}>
										<p>У вас ще немає заявок на бронювання.</p>
										<button 
											className={styles.browseButton} 
											onClick={() => navigate(PAGES.HOME)}
										>
											Переглянути санаторії
										</button>
									</div>
								)}
							</div>
						</>
					) : (
						<>
							<p className={styles.welcome}>Верифікація акаунту</p>
							<div className={styles.bookingsList} style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', marginTop: '20px' }}>
								
								{userData.user.verificationStatus === 'APPROVED' && (
									<div style={{ textAlign: 'center', padding: '30px' }}>
										<CiCircleCheck size={60} color="#00897b" />
										<h3 style={{ color: '#00897b', marginTop: '15px' }}>Ваш акаунт успішно верифіковано!</h3>
										<p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Тепер ви можете вільно бронювати санаторії.</p>
									</div>
								)}

								{userData.user.verificationStatus === 'PENDING' && (
									<div style={{ textAlign: 'center', padding: '30px' }}>
										<h3 style={{ color: '#f57c00' }}>Заявка на перевірці</h3>
										<p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Ваші документи розглядаються адміністратором. Це може зайняти деякий час.</p>
									</div>
								)}

								{(userData.user.verificationStatus === 'UNVERIFIED' || userData.user.verificationStatus === 'REJECTED') && (
									<div>
										{userData.user.verificationStatus === 'REJECTED' && (
											<div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#ffebee', borderLeft: '4px solid #c62828', color: '#c62828' }}>
												<strong>Вашу попередню заявку було відхилено.</strong>
												{userData.user.verificationMessage && (
													<p style={{ marginTop: '5px' }}>Причина: {userData.user.verificationMessage}</p>
												)}
												<p style={{ marginTop: '5px' }}>Будь ласка, завантажте коректні документи.</p>
											</div>
										)}
										
										<p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>
											Для того, щоб бронювати санаторії, вам необхідно одноразово підтвердити свою особу та статус ветерана.
										</p>
										
										<form onSubmit={handleVerificationSubmit}>
											<div style={{ marginBottom: '20px' }}>
												<label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-main)' }}>Фото (селфі) *</label>
												<input 
													type="file" 
													accept="image/*" 
													onChange={(e) => setPhoto(e.target.files?.[0] || null)}
													style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '5px', width: '100%', color: 'var(--text-main)', backgroundColor: 'var(--input-bg)' }}
												/>
												<small style={{ color: 'var(--text-muted)' }}>Завантажте ваше актуальне фото.</small>
											</div>

											<div style={{ marginBottom: '20px' }}>
												<label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-main)' }}>Скан-копія УБД або Довідка *</label>
												<input 
													type="file" 
													accept="image/*,.pdf" 
													onChange={(e) => setDocument(e.target.files?.[0] || null)}
													style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '5px', width: '100%', color: 'var(--text-main)', backgroundColor: 'var(--input-bg)' }}
												/>
												<small style={{ color: 'var(--text-muted)' }}>Завантажте якісну фотографію або PDF-скан вашого документу.</small>
											</div>

											<button 
												type="submit" 
												disabled={isVerifying}
												style={{
													background: '#0d7377', 
													color: 'white', 
													border: 'none', 
													padding: '12px 24px', 
													cursor: 'pointer',
													fontSize: '16px',
													borderRadius: '5px',
													width: '100%',
													fontWeight: 'bold'
												}} 
											>
												{isVerifying ? 'Відправка...' : 'Надіслати на перевірку'}
											</button>
										</form>
									</div>
								)}

							</div>
						</>
					)}
				</div>
			</div>
		</div>
	)
}

export default Profile
