import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { sanatoriumsService } from '../../services/sanatoriums.service';
import { PAGES } from '../../constants/url.constants';
import BookingForm from '../../components/BookingForm/BookingForm';
import SanatoriumReviews from '../../components/SanatoriumReviews/SanatoriumReviews';
import { SpecializationLabels, SanatoriumSpecialization } from '../../services/sanatoriums.service';
import styles from './SanatoriumDetail.module.scss';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

const SanatoriumDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: sanatorium, isLoading, isError } = useQuery({
        queryKey: ['sanatorium', id],
        queryFn: () => sanatoriumsService.getSanatoriumById(Number(id)),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className={styles.root}>
                <div className={styles.container}>
                    <div className={styles.loading}>Завантаження...</div>
                </div>
            </div>
        );
    }

    if (isError || !sanatorium) {
        return (
            <div className={styles.root}>
                <div className={styles.container}>
                    <div className={styles.error}>Санаторій не знайдено.</div>
                    <button className={styles.backLink} onClick={() => navigate(PAGES.HOME)}>
                        ← Повернутися до каталогу
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.root}>
            <div className={styles.container}>
                <button className={styles.backLink} onClick={() => navigate(PAGES.HOME)}>
                    ← Повернутися до каталогу
                </button>

                {sanatorium.imagePaths && sanatorium.imagePaths.length > 0 ? (
                    <div className={styles.gallery}>
                        <img className={styles.heroImage} src={sanatorium.imagePaths[0]} alt={sanatorium.name} />
                        {sanatorium.imagePaths.length > 1 && (
                            <div className={styles.thumbnailContainer}>
                                {sanatorium.imagePaths.slice(1).map((img, index) => (
                                    <img key={index} className={styles.thumbnail} src={img} alt={`${sanatorium.name} thumbnail ${index}`} />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <img
                        className={styles.heroImage}
                        src={DEFAULT_IMAGE}
                        alt={sanatorium.name}
                    />
                )}

                <h1 className={styles.name}>{sanatorium.name}</h1>

                <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                        <div className={styles.infoLabel}>Регіон</div>
                        <div className={styles.infoValue}>{sanatorium.region || 'Не вказано'}</div>
                    </div>
                    <div className={styles.infoCard}>
                        <div className={styles.infoLabel}>Медичний профіль</div>
                        <div className={styles.infoValue}>{sanatorium.medicalProfile || 'Загальний'}</div>
                    </div>
                    <div className={styles.infoCard}>
                        <div className={styles.infoLabel}>Адреса</div>
                        <div className={styles.infoValue}>{sanatorium.address || 'Не вказано'}</div>
                    </div>
                    {sanatorium.googleRating !== undefined && sanatorium.googleRating > 0 && (
                        <div className={styles.infoCard}>
                            <div className={styles.infoLabel}>Рейтинг Google</div>
                            <div className={styles.infoValue} style={{ color: '#DB4437', fontWeight: 700 }}>
                                {sanatorium.googleRating.toFixed(1)} / 5 <span style={{fontSize:'0.8rem', color:'#666', fontWeight: 400}}>({sanatorium.googleReviewsCount} відг.)</span>
                            </div>
                        </div>
                    )}
                    {sanatorium.ratingBooking !== undefined && sanatorium.ratingBooking > 0 && (
                        <div className={styles.infoCard}>
                            <div className={styles.infoLabel}>Рейтинг Booking.com</div>
                            <div className={styles.infoValue} style={{ color: '#003580', fontWeight: 700 }}>
                                {sanatorium.ratingBooking.toFixed(1)} / 10 <span style={{fontSize:'0.8rem', color:'#666', fontWeight: 400}}>({sanatorium.bookingReviewsCount} відг.)</span>
                            </div>
                        </div>
                    )}
                    {sanatorium.ratingTripAdvisor !== undefined && sanatorium.ratingTripAdvisor > 0 && (
                        <div className={styles.infoCard}>
                            <div className={styles.infoLabel}>Рейтинг TripAdvisor</div>
                            <div className={styles.infoValue} style={{ color: '#00aa6c', fontWeight: 700 }}>
                                {sanatorium.ratingTripAdvisor.toFixed(1)} / 5 <span style={{fontSize:'0.8rem', color:'#666', fontWeight: 400}}>({sanatorium.tripAdvisorReviewsCount} відг.)</span>
                            </div>
                        </div>
                    )}
                    {sanatorium.specializations && sanatorium.specializations.length > 0 && (
                        <div className={styles.infoCard} style={{ gridColumn: '1 / -1' }}>
                            <div className={styles.infoLabel}>Спеціалізації (для кого найкраще підходить)</div>
                            <div className={styles.infoValue}>
                                {sanatorium.specializations.map(s => SpecializationLabels[s as SanatoriumSpecialization] || s).join(', ')}
                            </div>
                        </div>
                    )}
                </div>

                <h2 className={styles.sectionTitle}>Про санаторій</h2>
                <p className={styles.description}>
                    {sanatorium.description || 'Детальний опис санаторію тимчасово відсутній. Інформація оновлюється.'}
                </p>

                <BookingForm 
                    sanatoriumId={sanatorium.id} 
                    sanatoriumName={sanatorium.name} 
                    sanatorium={sanatorium}
                />

                <SanatoriumReviews sanatoriumId={sanatorium.id} />
            </div>
        </div>
    );
};

export default SanatoriumDetail;

