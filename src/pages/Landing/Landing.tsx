import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import styles from './Landing.module.scss';
import { sanatoriumsService, ISanatorium } from '../../services/sanatoriums.service';
import { PAGES } from '../../constants/url.constants';

const Landing: React.FC = () => {
    const navigate = useNavigate();

    const { data: topSanatoriums, isLoading } = useQuery({
        queryKey: ['topRated'],
        queryFn: () => sanatoriumsService.getTopRated(5),
        staleTime: 120000
    });

    return (
        <div className={styles.root}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                    <p className={styles.heroSubtitle}>СИСТЕМА ДЛЯ ВЕТЕРАНІВ</p>
                    <h1 className={styles.heroTitle}>САНАТОРІЇ ДЛЯ ЗАХИСНИКІВ УКРАЇНИ</h1>
                    <p className={styles.heroDesc}>
                        Зручний сервіс пошуку та бронювання санаторіїв для ветеранів. 
                        Відновлюйте здоров'я у найкращих закладах країни.
                    </p>
                    <button 
                        className={styles.heroButton}
                        onClick={() => navigate(PAGES.CATALOG)}
                    >
                        Переглянути каталог
                    </button>
                </div>
            </section>

            {/* Features Section */}
            <section className={styles.features}>
                <div className={styles.container}>
                    <div className={styles.featuresGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>🏥</div>
                            <h3 className={styles.featureTitle}>Медичні програми</h3>
                            <p className={styles.featureDesc}>Спеціалізовані програми реабілітації для різних типів травм та захворювань</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>⭐</div>
                            <h3 className={styles.featureTitle}>Рейтинг та відгуки</h3>
                            <p className={styles.featureDesc}>Реальні оцінки та коментарі від ветеранів, які вже пройшли реабілітацію</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>📋</div>
                            <h3 className={styles.featureTitle}>Просте бронювання</h3>
                            <p className={styles.featureDesc}>Зручна система подачі заявок з можливістю завантаження документів онлайн</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Top Rated Section */}
            <section className={styles.topRated}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>Рекомендовані санаторії</h2>
                    <p className={styles.sectionSubtitle}>Найвищі оцінки за відгуками ветеранів</p>

                    {isLoading && <div className={styles.loading}>Завантаження...</div>}

                    <div className={styles.topGrid}>
                        {topSanatoriums && topSanatoriums.map((sanatorium: ISanatorium, index: number) => (
                            <div 
                                className={styles.topCard}
                                key={sanatorium.id}
                                onClick={() => navigate(`${PAGES.SANATORIUM_DETAIL}/${sanatorium.id}`)}
                            >
                                <div className={styles.topCardRank}>{index + 1}</div>
                                <div 
                                    className={styles.topCardImage}
                                    style={{ backgroundImage: `url(${sanatorium.imagePaths && sanatorium.imagePaths.length > 0 ? sanatorium.imagePaths[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'})` }}
                                ></div>
                                <div className={styles.topCardContent}>
                                    <h3 className={styles.topCardTitle}>{sanatorium.name}</h3>
                                    {sanatorium.averageRating !== undefined && sanatorium.averageRating > 0 && (
                                        <p className={styles.topCardRating}>
                                            <span>⭐</span> {sanatorium.averageRating}/5 ({sanatorium.reviewCount} відгуків)
                                        </p>
                                    )}
                                    <p className={styles.topCardRegion}>
                                        <span>📍</span> {sanatorium.region || 'Не вказано'}
                                    </p>
                                    <p className={styles.topCardProfile}>
                                        <span>🏥</span> {sanatorium.medicalProfile || 'Загальний'}
                                    </p>
                                    <button 
                                        className={styles.topCardButton}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`${PAGES.SANATORIUM_DETAIL}/${sanatorium.id}`);
                                        }}
                                    >
                                        Детальніше
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.viewAllWrap}>
                        <button 
                            className={styles.viewAllButton}
                            onClick={() => navigate(PAGES.CATALOG)}
                        >
                            Переглянути всі санаторії
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
