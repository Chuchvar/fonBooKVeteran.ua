import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import styles from "./Home.module.scss";
import { sanatoriumsService, ISanatorium, SpecializationLabels, ISanatoriumFilters } from '../../services/sanatoriums.service';
import { useNavigate } from 'react-router-dom';
import { PAGES } from '../../constants/url.constants';

const ITEMS_PER_PAGE = 15;

const Home: React.FC = () => {
    const [searchFilter, setSearchFilter] = useState('');
    const [regionFilter, setRegionFilter] = useState('');
    const [specializationFilter, setSpecializationFilter] = useState<string>('');
    const [minPriceFilter, setMinPriceFilter] = useState<string>('');
    const [maxPriceFilter, setMaxPriceFilter] = useState<string>('');
    const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [liveRatings, setLiveRatings] = useState<Record<number, { booking: number; tripAdvisor: number }>>({});
    const [ratingFlash, setRatingFlash] = useState<Record<number, boolean>>({});
    const navigate = useNavigate();
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search
    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setDebouncedSearch(searchFilter);
            setCurrentPage(0);
        }, 400);
        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [searchFilter]);

    // Reset page on filter change
    useEffect(() => { setCurrentPage(0); }, [regionFilter, specializationFilter, minPriceFilter, maxPriceFilter, minRatingFilter]);

    const filters: ISanatoriumFilters = {
        search: debouncedSearch || undefined,
        region: regionFilter || undefined,
        specialization: specializationFilter || undefined,
        minPrice: minPriceFilter ? Number(minPriceFilter) : undefined,
        maxPrice: maxPriceFilter ? Number(maxPriceFilter) : undefined,
        page: currentPage,
        size: ITEMS_PER_PAGE,
    };

    const { data: pageData, isLoading, isError } = useQuery({
        queryKey: ['sanatoriums', filters],
        queryFn: () => sanatoriumsService.getSanatoriums(filters),
        staleTime: 60000,
    });

    const { data: regions } = useQuery({
        queryKey: ['regions'],
        queryFn: () => sanatoriumsService.getRegions(),
        staleTime: 300000,
    });

    // Filter by min rating on client side (since it involves @Transient averageRating)
    const sanatoriums = pageData?.content?.filter(s => {
        if (minRatingFilter > 0) {
            const avg = s.averageRating ?? 0;
            const bookingNorm = (s.ratingBooking ?? 0) / 2; // normalize to 5
            const tripAdvisor = s.ratingTripAdvisor ?? 0;
            const best = Math.max(avg, bookingNorm, tripAdvisor);
            return best >= minRatingFilter;
        }
        return true;
    }) ?? [];

    // Real ratings are now fetched from backend, so no mock effect is needed.

    const hasFilters = searchFilter || regionFilter || specializationFilter || minPriceFilter || maxPriceFilter || minRatingFilter > 0;

    const clearFilters = () => {
        setSearchFilter('');
        setRegionFilter('');
        setSpecializationFilter('');
        setMinPriceFilter('');
        setMaxPriceFilter('');
        setMinRatingFilter(0);
        setCurrentPage(0);
    };

    const totalPages = pageData?.totalPages ?? 0;
    const totalElements = pageData?.totalElements ?? 0;

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible + 2) {
            for (let i = 0; i < totalPages; i++) pages.push(i);
        } else {
            pages.push(0);
            if (currentPage > 2) pages.push('...');

            const start = Math.max(1, currentPage - 1);
            const end = Math.min(totalPages - 2, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);

            if (currentPage < totalPages - 3) pages.push('...');
            pages.push(totalPages - 1);
        }

        return (
            <div className={styles.pagination}>
                <button
                    className={styles.pageBtn}
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(p => p - 1)}
                >
                    ← Назад
                </button>

                <div className={styles.pageNumbers}>
                    {pages.map((p, i) =>
                        typeof p === 'string' ? (
                            <span key={`dots-${i}`} className={styles.pageDots}>…</span>
                        ) : (
                            <button
                                key={p}
                                className={`${styles.pageNum} ${currentPage === p ? styles.pageActive : ''}`}
                                onClick={() => setCurrentPage(p)}
                            >
                                {p + 1}
                            </button>
                        )
                    )}
                </div>

                <button
                    className={styles.pageBtn}
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage(p => p + 1)}
                >
                    Далі →
                </button>
            </div>
        );
    };

    return (
        <div className={styles.root}>
            <div className={styles.container}>
                <h2 className={styles.title}>Каталог Санаторіїв</h2>
                <p className={styles.subtitle}>
                    Знайдіть ідеальне місце для реабілітації та відпочинку
                </p>

                {/* Filter Panel */}
                <div className={styles.filterContainer}>
                    <div className={styles.filterHeader}>
                        <span className={styles.filterIcon}>🔎</span>
                        <span>Фільтри пошуку</span>
                    </div>

                    <div className={styles.filterGrid}>
                        {/* Search */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>🔍 Пошук за назвою</label>
                            <input
                                type="text"
                                className={styles.inputField}
                                placeholder="Введіть назву санаторію..."
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                            />
                        </div>

                        {/* Region */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>📍 Регіон</label>
                            <select
                                className={styles.inputField}
                                value={regionFilter}
                                onChange={(e) => setRegionFilter(e.target.value)}
                            >
                                <option value="">Всі регіони</option>
                                {regions?.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        {/* Specialization */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>⚕️ Спеціалізація</label>
                            <select
                                className={styles.inputField}
                                value={specializationFilter}
                                onChange={(e) => setSpecializationFilter(e.target.value)}
                            >
                                <option value="">Всі спеціалізації</option>
                                {Object.entries(SpecializationLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>💰 Ціна (грн/день)</label>
                            <div className={styles.priceRange}>
                                <input
                                    type="number"
                                    className={styles.priceInput}
                                    placeholder="Від"
                                    value={minPriceFilter}
                                    onChange={(e) => setMinPriceFilter(e.target.value)}
                                    min={0}
                                />
                                <span className={styles.priceDash}>—</span>
                                <input
                                    type="number"
                                    className={styles.priceInput}
                                    placeholder="До"
                                    value={maxPriceFilter}
                                    onChange={(e) => setMaxPriceFilter(e.target.value)}
                                    min={0}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Rating Filter */}
                    <div className={styles.ratingFilterRow}>
                        <label className={styles.filterLabel}>⭐ Мінімальний рейтинг</label>
                        <div className={styles.ratingBtns}>
                            {[0, 1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    className={`${styles.ratingBtn} ${minRatingFilter === star ? styles.ratingBtnActive : ''}`}
                                    onClick={() => setMinRatingFilter(star)}
                                >
                                    {star === 0 ? 'Всі' : `${'★'.repeat(star)}${'☆'.repeat(5 - star)}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filter Actions */}
                    {hasFilters && (
                        <div className={styles.filterActions}>
                            <button className={styles.clearBtn} onClick={clearFilters}>
                                ✕ Скинути фільтри
                            </button>
                            <span className={styles.resultCount}>
                                Знайдено: {totalElements} {totalElements === 1 ? 'санаторій' : totalElements < 5 ? 'санаторії' : 'санаторіїв'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Page info */}
                {!isLoading && totalElements > 0 && (
                    <div className={styles.pageInfo}>
                        Сторінка {currentPage + 1} з {totalPages} · Всього {totalElements} санаторіїв
                    </div>
                )}

                {isLoading && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <span>Завантаження санаторіїв...</span>
                    </div>
                )}
                {isError && <div className={styles.error}>Виникла помилка під час завантаження санаторіїв.</div>}

                {/* Cards Grid */}
                <div className={styles.grid}>
                    {sanatoriums && sanatoriums.length > 0 ? (
                        sanatoriums.map((sanatorium: ISanatorium) => {
                            const googleVal = sanatorium.googleRating ?? 0;
                            const bookingVal = sanatorium.ratingBooking ?? 0;
                            const tripVal = sanatorium.ratingTripAdvisor ?? 0;

                            return (
                                <div
                                    className={styles.card}
                                    key={sanatorium.id}
                                    onClick={() => navigate(`${PAGES.SANATORIUM_DETAIL}/${sanatorium.id}`)}
                                >
                                    <div
                                        className={styles.cardImage}
                                        style={{ backgroundImage: `url(${sanatorium.imagePaths && sanatorium.imagePaths.length > 0 ? sanatorium.imagePaths[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'})` }}
                                    >
                                        {/* External Ratings Badges */}
                                        <div className={styles.ratingBadges}>
                                            {googleVal > 0 && (
                                                <div className={`${styles.badge} ${styles.badgeGoogle}`} style={{ backgroundColor: '#DB4437', color: 'white' }}>
                                                    <span className={styles.badgeIcon}>G</span>
                                                    <span className={styles.badgeValue}>{googleVal.toFixed(1)}</span>
                                                </div>
                                            )}
                                            {bookingVal > 0 && (
                                                <div className={`${styles.badge} ${styles.badgeBooking}`}>
                                                    <span className={styles.badgeIcon}>B</span>
                                                    <span className={styles.badgeValue}>{bookingVal.toFixed(1)}</span>
                                                </div>
                                            )}
                                            {tripVal > 0 && (
                                                <div className={`${styles.badge} ${styles.badgeTrip}`}>
                                                    <span className={styles.badgeIcon}>TA</span>
                                                    <span className={styles.badgeValue}>{tripVal.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Discount Badge */}
                                        {sanatorium.discountPercentage && sanatorium.discountPercentage > 0 && (
                                            <div className={styles.discountBadge}>
                                                -{sanatorium.discountPercentage}%
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.cardContent}>
                                        <h3 className={styles.cardTitle}>{sanatorium.name}</h3>
                                        <p className={styles.cardDesc}>
                                            {sanatorium.description ? sanatorium.description.substring(0, 110) + '...' : 'Опис санаторію тимчасово відсутній.'}
                                        </p>
                                        <div className={styles.cardMeta}>
                                            {sanatorium.averageRating !== undefined && sanatorium.averageRating > 0 && (
                                                <div className={styles.metaItem}>
                                                    <span className={styles.metaIcon}>⭐</span>
                                                    <span>{sanatorium.averageRating}/5</span>
                                                    <span className={styles.metaSecondary}>({sanatorium.reviewCount} відг.)</span>
                                                </div>
                                            )}
                                            <div className={styles.metaItem}>
                                                <span className={styles.metaIcon}>📍</span>
                                                <span>{sanatorium.region || 'Не вказано'}</span>
                                            </div>
                                            <div className={styles.metaItem}>
                                                <span className={styles.metaIcon}>🏥</span>
                                                <span>{sanatorium.medicalProfile || 'Загальний'}</span>
                                            </div>
                                        </div>
                                        <div className={styles.cardFooter}>
                                            <div className={styles.priceTag}>
                                                від <strong>{sanatorium.standardPackagePrice?.toLocaleString() ?? '—'}</strong> грн
                                            </div>
                                            <button
                                                className={styles.actionButton}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`${PAGES.SANATORIUM_DETAIL}/${sanatorium.id}`);
                                                }}
                                            >
                                                Детальніше
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        !isLoading && <div className={styles.empty}>За вашими критеріями санаторіїв не знайдено.</div>
                    )}
                </div>

                {/* Pagination */}
                {renderPagination()}
            </div>
        </div>
    );
};

export default Home;