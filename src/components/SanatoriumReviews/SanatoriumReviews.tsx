import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sanatoriumsService, IReview } from '../../services/sanatoriums.service';
import { useNavigate } from 'react-router-dom';
import { PAGES } from '../../constants/url.constants';
import styles from './SanatoriumReviews.module.scss';

interface SanatoriumReviewsProps {
    sanatoriumId: number;
}

const SanatoriumReviews: React.FC<SanatoriumReviewsProps> = ({ sanatoriumId }) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [rating, setRating] = useState<number>(5);
    const [commentText, setCommentText] = useState('');
    const isLoggedIn = !!localStorage.getItem('jwt');

    const { data: reviews, isLoading } = useQuery({
        queryKey: ['reviews', sanatoriumId],
        queryFn: () => sanatoriumsService.getReviews(sanatoriumId)
    });

    const createReviewMutation = useMutation({
        mutationFn: () => sanatoriumsService.createReview(sanatoriumId, { rating, commentText }),
        onSuccess: () => {
            setCommentText('');
            setRating(5);
            queryClient.invalidateQueries({ queryKey: ['reviews', sanatoriumId] });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        createReviewMutation.mutate();
    };

    const [filterRating, setFilterRating] = useState<number | null>(null);

    const filteredReviews = reviews 
        ? (filterRating ? reviews.filter((r: IReview) => r.rating === filterRating) : reviews)
        : [];

    return (
        <div className={styles.reviewsContainer}>
            <h3 className={styles.title}>Відгуки та оцінки</h3>
            
            {isLoggedIn ? (
                <form onSubmit={handleSubmit} className={styles.reviewForm}>
                    <h4>Залишити відгук</h4>
                    <div className={styles.formGroup}>
                        <label>Оцінка:</label>
                        <div className={styles.starRating}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`${styles.starBtn} ${star <= rating ? styles.activeStar : ''}`}
                                    onClick={() => setRating(star)}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Ваш коментар:</label>
                        <textarea 
                            value={commentText} 
                            onChange={e => setCommentText(e.target.value)} 
                            placeholder="Напишіть свої враження про санаторій..."
                            rows={4}
                            required
                        />
                    </div>
                    <button type="submit" disabled={createReviewMutation.isPending} className={styles.submitBtn}>
                        {createReviewMutation.isPending ? 'Відправка...' : 'Відправити'}
                    </button>
                </form>
            ) : (
                <div className={styles.loginPrompt}>
                    <p>Щоб залишити відгук, будь ласка, увійдіть у свій акаунт.</p>
                    <button className={styles.submitBtn} onClick={() => navigate(PAGES.LOGIN)}>
                        Увійти
                    </button>
                </div>
            )}

            <div className={styles.filterBar}>
                <button onClick={() => setFilterRating(null)} className={!filterRating ? styles.activeFilter : ''}>Всі</button>
                {[5, 4, 3, 2, 1].map(stars => (
                    <button key={stars} onClick={() => setFilterRating(stars)} className={filterRating === stars ? styles.activeFilter : ''}>
                        {stars}★
                    </button>
                ))}
            </div>

            <div className={styles.reviewsList}>
                {isLoading ? (
                    <p>Завантаження відгуків...</p>
                ) : filteredReviews.length > 0 ? (
                    filteredReviews.map((review: IReview) => (
                        <div key={review.id} className={styles.reviewCard}>
                            <div className={styles.reviewHeader}>
                                <strong>{review.userName}</strong>
                                <div className={styles.rating}>
                                    {'★'.repeat(review.rating).padEnd(5, '☆')}
                                </div>
                                <span className={styles.date}>{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className={styles.comment}>{review.commentText}</p>
                        </div>
                    ))
                ) : (
                    <p className={styles.empty}>
                        {filterRating ? 'Немає відгуків з такою оцінкою.' : 'Поки що немає відгуків. Будьте першим!'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default SanatoriumReviews;

