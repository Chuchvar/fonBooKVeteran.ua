import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PAGES } from '../../constants/url.constants';
import { bookingService } from '../../services/booking.service';
import { authService } from '../../services/auth.service';
import { ISanatorium } from '../../services/sanatoriums.service';
import styles from './BookingForm.module.scss';

interface BookingFormProps {
    sanatoriumId: number;
    sanatoriumName: string;
    sanatorium?: ISanatorium;
}

const PACKAGE_DESCRIPTIONS = {
    STANDARD: "Базове проживання, 3-разове харчування та 1-2 лікувальні процедури на день.",
    PREMIUM: "Покращена кімната, спеціалізоване меню та необмежений пакет індивідуальних процедур.",
    REHABILITATION: "Інтенсивна терапія, супровід лікаря-реабілітолога 24/7 та профільне медичне обладнання."
};

const BookingForm: React.FC<BookingFormProps> = ({ sanatoriumId, sanatoriumName, sanatorium }) => {
    const navigate = useNavigate();
    const isAuthenticated = localStorage.getItem('jwt');

    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [message, setMessage] = useState('');
    const [packageType, setPackageType] = useState<'STANDARD' | 'PREMIUM' | 'REHABILITATION'>('STANDARD');
    const [guestsCount, setGuestsCount] = useState(1);
    
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (sanatorium) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (sanatorium.hasStandardPackage !== false) setPackageType('STANDARD');
            else if (sanatorium.hasPremiumPackage !== false) setPackageType('PREMIUM');
            else if (sanatorium.hasRehabilitationPackage !== false) setPackageType('REHABILITATION');
        }
    }, [sanatorium]);

    const { data: userData } = useQuery({
        queryKey: ['userData'],
        queryFn: () => authService.getUserData(),
        enabled: !!isAuthenticated,
    });

    const { mutate: submitBooking, isPending, error } = useMutation({
        mutationFn: (formData: FormData) => bookingService.createBooking(formData),
        onSuccess: () => {
            setSuccess(true);
            toast.success('Заявку на бронювання успішно подано!');
        },
        onError: (err: Error) => {
            toast.error(err?.message || 'Помилка при поданні заявки');
        }
    });

    const calculatePricing = () => {
        let pricePerDay = sanatorium?.standardPackagePrice || 500;
        if (packageType === 'PREMIUM') pricePerDay = sanatorium?.premiumPackagePrice || 800;
        if (packageType === 'REHABILITATION') pricePerDay = sanatorium?.rehabilitationPackagePrice || 1200;

        let days = 1;
        if (checkInDate && checkOutDate) {
            const start = new Date(checkInDate);
            const end = new Date(checkOutDate);
            days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
            if (days <= 0) days = 1;
        }

        const basePrice = days * pricePerDay * guestsCount;
        const isVerified = userData?.user?.verificationStatus === 'APPROVED';
        const discountPercentage = isVerified ? (sanatorium?.discountPercentage || 0) : 0;
        let finalPrice = basePrice * (1 - (discountPercentage / 100));
        if (finalPrice < 0) finalPrice = 0;

        return {
            basePrice,
            finalPrice,
            discountPercentage,
            days,
            guestsCount
        };
    };

    const pricing = calculatePricing();

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (sanatorium?.availableRooms !== undefined && sanatorium.availableRooms <= 0) {
            toast.error('На жаль, усі кімнати зайняті.');
            return;
        }

        if (!checkInDate || !checkOutDate) {
            toast.error('Вкажіть дати заїзду та виїзду');
            return;
        }

        if (new Date(checkInDate) >= new Date(checkOutDate)) {
            toast.error('Дата виїзду має бути пізніше дати заїзду');
            return;
        }

        const formData = new FormData();
        formData.append('sanatoriumId', sanatoriumId.toString());
        formData.append('checkInDate', checkInDate);
        formData.append('checkOutDate', checkOutDate);
        formData.append('packageType', packageType);
        formData.append('guestsCount', guestsCount.toString());
        if (message) formData.append('message', message);

        submitBooking(formData);
    };

    if (!isAuthenticated) {
        return (
            <div className={styles.formSection}>
                <div className={styles.loginPrompt}>
                    <p>Щоб подати заявку на бронювання, увійдіть до акаунту</p>
                    <button
                        className={styles.loginButton}
                        onClick={() => navigate(PAGES.LOGIN)}
                    >
                        Увійти
                    </button>
                </div>
            </div>
        );
    }


    if (success) {
        return (
            <div className={styles.formSection}>
                <div className={styles.successMessage}>
                    <h4>✓ Заявку успішно подано!</h4>
                    <p>Ваша заявка на бронювання в «{sanatoriumName}» прийнята та розглядається.</p>
                    <p>Ваш обраний пакет: {packageType}. Орієнтовна вартість: {pricing.finalPrice > 0 ? `${pricing.finalPrice} ₴` : 'БЕЗКОШТОВНО (Пільга)'}</p>
                    <p>Після підтвердження адміністратором ви зможете оплатити бронювання в особистому кабінеті.</p>
                    <button
                        className={styles.loginButton}
                        onClick={() => navigate(PAGES.PROFILE)}
                        style={{ marginTop: '20px' }}
                    >
                        Перейти в кабінет
                    </button>
                </div>
            </div>
        );
    }

    const outOfRooms = sanatorium?.availableRooms !== undefined && sanatorium.availableRooms <= 0;

    return (
        <div className={styles.formSection}>
            <h3 className={styles.formTitle}>Подати заявку на бронювання</h3>
            <p className={styles.formSubtitle}>Заповніть форму, щоб подати заявку на відпочинок у цьому санаторії</p>

            {userData && userData.user && userData.user.verificationStatus !== 'APPROVED' && (
                <div className={`${styles.loginPrompt} ${styles.warningPrompt}`} style={{ marginBottom: '20px' }}>
                    <p className={styles.warningTitle}>⚠️ Акаунт не верифіковано</p>
                    <p style={{ marginTop: '10px' }}>Ви можете забронювати номер за повну вартість. Щоб отримати пільги та знижки, пройдіть верифікацію ветерана.</p>
                    <button
                        className={styles.loginButton}
                        onClick={(e) => { e.preventDefault(); navigate(PAGES.PROFILE); }}
                        style={{ marginTop: '15px' }}
                    >
                        Пройти верифікацію
                    </button>
                </div>
            )}

            {sanatorium?.availableRooms !== undefined && (
                <div className={`${styles.roomsLeft} ${outOfRooms ? styles.outOfRooms : ''}`}>
                    Залишилося кімнат: {sanatorium.availableRooms}
                </div>
            )}

            <form className={styles.form} onSubmit={handleFormSubmit}>
                <div className={styles.row}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Дата заїзду</label>
                        <input
                            type="date"
                            className={styles.fieldInput}
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                            disabled={outOfRooms}
                        />
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Дата виїзду</label>
                        <input
                            type="date"
                            className={styles.fieldInput}
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            min={checkInDate || new Date().toISOString().split('T')[0]}
                            required
                            disabled={outOfRooms}
                        />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Оберіть пакет послуг</label>
                        <div className={styles.packageSelector}>
                            <select 
                                className={styles.fieldInput} 
                                value={packageType} 
                                onChange={(e) => setPackageType(e.target.value as 'STANDARD' | 'PREMIUM' | 'REHABILITATION')}
                                disabled={outOfRooms || (!sanatorium?.hasStandardPackage && !sanatorium?.hasPremiumPackage && !sanatorium?.hasRehabilitationPackage)}
                            >
                                {sanatorium?.hasStandardPackage !== false && (
                                    <option value="STANDARD">Стандарт ({sanatorium?.standardPackagePrice || 500} грн/день)</option>
                                )}
                                {sanatorium?.hasPremiumPackage !== false && (
                                    <option value="PREMIUM">Преміум ({sanatorium?.premiumPackagePrice || 800} грн/день)</option>
                                )}
                                {sanatorium?.hasRehabilitationPackage !== false && (
                                    <option value="REHABILITATION">Реабілітація ({sanatorium?.rehabilitationPackagePrice || 1200} грн/день)</option>
                                )}
                            </select>
                            <p className={styles.packageDescription}>{PACKAGE_DESCRIPTIONS[packageType]}</p>
                        </div>
                    </div>
                    
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Кількість гостей</label>
                        <select
                            className={styles.fieldInput}
                            value={guestsCount}
                            onChange={(e) => setGuestsCount(Number(e.target.value))}
                            disabled={outOfRooms}
                        >
                            <option value={1}>1 людина</option>
                            <option value={2}>2 людини</option>
                            <option value={3}>3 людини</option>
                            <option value={4}>4 людини</option>
                            <option value={5}>5 людей</option>
                        </select>
                    </div>
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Коментар (необов'язково)</label>
                    <textarea
                        className={styles.textarea}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Побажання, особливі потреби, питання..."
                        disabled={outOfRooms}
                    />
                </div>

                <div className={styles.pricingSection}>
                    <div className={styles.priceRow}>
                        <span>Днів: {pricing.days}</span>
                        <span>Гостей: {pricing.guestsCount}</span>
                    </div>
                    
                    {pricing.discountPercentage > 0 && (
                        <div className={styles.discountRow}>
                            Вам застосована {pricing.discountPercentage}% знижка як ветерану!
                            <span className={styles.oldPrice}>{pricing.basePrice} ₴</span>
                        </div>
                    )}
                    
                    <div className={styles.priceDisplay}>
                        <span>Орієнтовна вартість:</span>
                        {pricing.finalPrice > 0 ? (
                            <span className={styles.finalPrice}>{pricing.finalPrice} ₴</span>
                        ) : (
                            <span className={styles.freeBadge}>БЕЗКОШТОВНО</span>
                        )}
                    </div>
                </div>

                {error && (
                    <div className={styles.errorMessage}>
                        {(error as Error)?.message || 'Виникла помилка'}
                    </div>
                )}

                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isPending || outOfRooms}
                >
                    {outOfRooms ? 'Немає вільних кімнат' : (isPending ? 'Надсилається...' : 'Подати заявку')}
                </button>
            </form>
        </div>
    );
};

export default BookingForm;
