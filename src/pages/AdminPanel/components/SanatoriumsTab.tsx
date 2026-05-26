/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { sanatoriumsService, ISanatorium, SpecializationLabels, SanatoriumSpecialization } from '../../../services/sanatoriums.service';
import styles from '../AdminPanel.module.scss';

// Represents an image item — either an existing URL or a new file
interface ImageItem {
    id: string; // unique key for React & drag
    type: 'existing' | 'new';
    url: string; // existing URL or object URL for preview
    file?: File; // only for type === 'new'
}

let imageIdCounter = 0;
const nextImageId = () => `img-${++imageIdCounter}-${Date.now()}`;

const SanatoriumsTab: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSanatorium, setEditingSanatorium] = useState<ISanatorium | null>(null);
    const [selectedSpecializations, setSelectedSpecializations] = useState<SanatoriumSpecialization[]>([]);
    const [specializationToAdd, setSpecializationToAdd] = useState<SanatoriumSpecialization | ''>('');
    const [imageItems, setImageItems] = useState<ImageItem[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [hasStandardPackage, setHasStandardPackage] = useState(true);
    const [hasPremiumPackage, setHasPremiumPackage] = useState(true);
    const [hasRehabilitationPackage, setHasRehabilitationPackage] = useState(true);
    const replaceInputRef = useRef<HTMLInputElement>(null);
    const addInputRef = useRef<HTMLInputElement>(null);
    const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterRegion, setFilterRegion] = useState('');

    const { data: sanatoriumsPage, isLoading: isSanatoriumsLoading } = useQuery({
        queryKey: ['sanatoriums'],
        queryFn: () => sanatoriumsService.getSanatoriums({ size: 1000 }),
    });
    const sanatoriums = sanatoriumsPage?.content;

    // Derived Data for Filters
    const uniqueRegions = Array.from(new Set(sanatoriums?.map((s: ISanatorium) => s.region) || []));

    const filteredSanatoriums = sanatoriums?.filter((s: ISanatorium) => {
        const matchesSearch = 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.address.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.medicalProfile.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRegion = filterRegion === '' || s.region === filterRegion;
        return matchesSearch && matchesRegion;
    });

    // Мутації
    const deleteSanatoriumMutation = useMutation({
        mutationFn: (id: number) => sanatoriumsService.deleteSanatorium(id),
        onSuccess: () => {
            toast.success('Санаторій успішно видалено');
            queryClient.invalidateQueries({ queryKey: ['sanatoriums'] });
        },
        onError: () => toast.error('Помилка при видаленні санаторію'),
    });

    const saveSanatoriumMutation = useMutation({
        mutationFn: (data: Omit<ISanatorium, 'id'>) => {
            if (editingSanatorium) {
                return sanatoriumsService.updateSanatorium(editingSanatorium.id, data);
            }
            return sanatoriumsService.createSanatorium(data);
        },
        onSuccess: () => {
            toast.success(editingSanatorium ? 'Санаторій оновлено' : 'Санаторій створено');
            setIsModalOpen(false);
            setEditingSanatorium(null);
            setSelectedSpecializations([]);
            setSpecializationToAdd('');
            setImageItems([]);
            queryClient.invalidateQueries({ queryKey: ['sanatoriums'] });
        },
        onError: () => toast.error('Сталася помилка при збереженні санаторію'),
    });

    // ==========================================
    // Image management
    // ==========================================

    const handleOpenModal = (sanatorium?: ISanatorium) => {
        setEditingSanatorium(sanatorium || null);
        setSelectedSpecializations(sanatorium?.specializations || []);
        setSpecializationToAdd('');
        
        setHasStandardPackage(sanatorium?.hasStandardPackage ?? true);
        setHasPremiumPackage(sanatorium?.hasPremiumPackage ?? true);
        setHasRehabilitationPackage(sanatorium?.hasRehabilitationPackage ?? true);
        
        // Initialize image items from existing sanatorium
        if (sanatorium?.imagePaths?.length) {
            setImageItems(
                sanatorium.imagePaths.map(url => ({
                    id: nextImageId(),
                    type: 'existing' as const,
                    url,
                }))
            );
        } else {
            setImageItems([]);
        }
        setIsModalOpen(true);
    };

    const handleRemoveImage = (id: string) => {
        setImageItems(prev => {
            const item = prev.find(i => i.id === id);
            // Revoke object URL for new files
            if (item?.type === 'new') {
                URL.revokeObjectURL(item.url);
            }
            return prev.filter(i => i.id !== id);
        });
    };

    const handleReplaceImage = (id: string) => {
        setReplaceTargetId(id);
        replaceInputRef.current?.click();
    };

    const handleReplaceFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !replaceTargetId) return;

        const previewUrl = URL.createObjectURL(file);
        setImageItems(prev =>
            prev.map(item => {
                if (item.id === replaceTargetId) {
                    // Revoke old object URL if it was a new file
                    if (item.type === 'new') {
                        URL.revokeObjectURL(item.url);
                    }
                    return {
                        id: item.id,
                        type: 'new' as const,
                        url: previewUrl,
                        file,
                    };
                }
                return item;
            })
        );
        setReplaceTargetId(null);
        e.target.value = ''; // reset input
    };

    const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const totalImages = imageItems.length + files.length;
        if (totalImages > 5) {
            toast.error(`Максимум 5 фото! Зараз: ${imageItems.length}, обрано: ${files.length}`);
            e.target.value = '';
            return;
        }

        const newItems: ImageItem[] = files.map(file => ({
            id: nextImageId(),
            type: 'new' as const,
            url: URL.createObjectURL(file),
            file,
        }));

        setImageItems(prev => [...prev, ...newItems]);
        e.target.value = ''; // reset input
    };

    // Drag and drop handlers
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        setDragOverIndex(index);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        setImageItems(prev => {
            const newItems = [...prev];
            const [dragged] = newItems.splice(draggedIndex, 1);
            newItems.splice(dropIndex, 0, dragged);
            return newItems;
        });
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    // Save handler
    const handleSaveSanatorium = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // Separate new files that need uploading
        const newFiles = imageItems
            .filter(item => item.type === 'new' && item.file)
            .map(item => item.file!);

        let uploadedUrls: string[] = [];

        if (newFiles.length > 0) {
            try {
                uploadedUrls = await sanatoriumsService.uploadImages(newFiles);
            } catch (err) {
                toast.error("Помилка при завантаженні фото");
                return;
            }
        }

        // Build final imagePaths array preserving order
        let uploadIndex = 0;
        const finalImagePaths = imageItems.map(item => {
            if (item.type === 'existing') {
                return item.url;
            } else {
                return uploadedUrls[uploadIndex++];
            }
        });

        const data = {
            name: formData.get('name') as string,
            region: formData.get('region') as string,
            address: formData.get('address') as string,
            medicalProfile: formData.get('medicalProfile') as string,
            description: formData.get('description') as string,
            specializations: selectedSpecializations,
            imagePaths: finalImagePaths,
            standardPackagePrice: Number(formData.get('standardPackagePrice')),
            premiumPackagePrice: Number(formData.get('premiumPackagePrice')),
            rehabilitationPackagePrice: Number(formData.get('rehabilitationPackagePrice')),
            discountPercentage: Number(formData.get('discountPercentage')),
            availableRooms: Number(formData.get('availableRooms')),
            hasStandardPackage,
            hasPremiumPackage,
            hasRehabilitationPackage,
            googleRating: Number(formData.get('googleRating')),
            googleReviewsCount: Number(formData.get('googleReviewsCount')),
            ratingBooking: Number(formData.get('ratingBooking')),
            bookingReviewsCount: Number(formData.get('bookingReviewsCount')),
            ratingTripAdvisor: Number(formData.get('ratingTripAdvisor')),
            tripAdvisorReviewsCount: Number(formData.get('tripAdvisorReviewsCount')),
        };
        saveSanatoriumMutation.mutate(data);
    };



    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            imageItems.forEach(item => {
                if (item.type === 'new') {
                    URL.revokeObjectURL(item.url);
                }
            });
        };
    }, []);

    return (
        <>
            <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2>Каталог санаторіїв</h2>
                <button className={styles.addButton} onClick={() => handleOpenModal()}>
                    + Додати санаторій
                </button>
            </div>

            <div className={styles.filtersContainer}>
                <input 
                    type="text" 
                    placeholder="Пошук за назвою, адресою або профілем..." 
                    className={styles.filterInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select 
                    className={styles.filterSelect}
                    value={filterRegion}
                    onChange={(e) => setFilterRegion(e.target.value)}
                >
                    <option value="">Всі регіони</option>
                    {uniqueRegions.map(region => (
                        <option key={region as string} value={region as string}>{region as string}</option>
                    ))}
                </select>
            </div>
                        
                        {isSanatoriumsLoading ? (
                            <div className={styles.loading}>Завантаження санаторіїв...</div>
                        ) : (
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Назва</th>
                                            <th>Регіон</th>
                                            <th>Профіль</th>
                                            <th>Дії</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSanatoriums && filteredSanatoriums.length > 0 ? (
                                            filteredSanatoriums.map((sanatorium: ISanatorium) => (
                                                <tr key={sanatorium.id}>
                                                    <td>
                                                        <strong>{sanatorium.name}</strong>
                                                    </td>
                                                    <td>{sanatorium.region}</td>
                                                    <td>{sanatorium.medicalProfile}</td>
                                                    <td>
                                                        <div className={styles.actions}>
                                                            <button 
                                                                className={`${styles.actionBtn} ${styles.edit}`}
                                                                onClick={() => handleOpenModal(sanatorium)}
                                                            >
                                                                Редаг.
                                                            </button>
                                                            <button 
                                                                className={`${styles.actionBtn} ${styles.delete}`}
                                                                onClick={() => {
                                                                    if (window.confirm('Ви впевнені, що хочете видалити цей санаторій?')) {
                                                                        deleteSanatoriumMutation.mutate(sanatorium.id);
                                                                    }
                                                                }}
                                                            >
                                                                Видалити
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                                                    Нічого не знайдено за вашим запитом.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                {/* Модальне вікно для санаторію */}
                {isModalOpen && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h3>{editingSanatorium ? 'Редагувати санаторій' : 'Додати новий санаторій'}</h3>
                            <form onSubmit={handleSaveSanatorium}>
                                <div className={styles.formGroup}>
                                    <label>Назва санаторію *</label>
                                    <input 
                                        name="name" 
                                        defaultValue={editingSanatorium?.name || ''} 
                                        required 
                                        placeholder="Наприклад: 'Лісова Пісня'"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Регіон *</label>
                                    <input 
                                        name="region" 
                                        defaultValue={editingSanatorium?.region || ''} 
                                        required 
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Точна адреса *</label>
                                    <input 
                                        name="address" 
                                        defaultValue={editingSanatorium?.address || ''} 
                                        required 
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Медичний профіль *</label>
                                    <input 
                                        name="medicalProfile" 
                                        defaultValue={editingSanatorium?.medicalProfile || ''} 
                                        required 
                                        placeholder="Наприклад: ОРА, Кардіологія"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Детальний опис</label>
                                    <textarea 
                                        name="description" 
                                        defaultValue={editingSanatorium?.description || ''} 
                                        placeholder="Опишіть головні переваги санаторію..."
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div className={styles.formGroup} style={{ flex: 1 }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={hasStandardPackage} 
                                                onChange={(e) => setHasStandardPackage(e.target.checked)} 
                                            />
                                            Доступний пакет "Стандарт"
                                        </label>
                                        <br/>
                                        <label>Ціна "Стандарт" (₴/день)</label>
                                        <input 
                                            type="number"
                                            name="standardPackagePrice" 
                                            defaultValue={editingSanatorium?.standardPackagePrice || 500} 
                                            required={hasStandardPackage}
                                            disabled={!hasStandardPackage}
                                        />
                                    </div>
                                    <div className={styles.formGroup} style={{ flex: 1 }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={hasPremiumPackage} 
                                                onChange={(e) => setHasPremiumPackage(e.target.checked)} 
                                            />
                                            Доступний пакет "Преміум"
                                        </label>
                                        <br/>
                                        <label>Ціна "Преміум" (₴/день)</label>
                                        <input 
                                            type="number"
                                            name="premiumPackagePrice" 
                                            defaultValue={editingSanatorium?.premiumPackagePrice || 800} 
                                            required={hasPremiumPackage}
                                            disabled={!hasPremiumPackage}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div className={styles.formGroup} style={{ flex: 1 }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={hasRehabilitationPackage} 
                                                onChange={(e) => setHasRehabilitationPackage(e.target.checked)} 
                                            />
                                            Доступний пакет "Реабілітація"
                                        </label>
                                        <br/>
                                        <label>Ціна "Реабілітація" (₴/день)</label>
                                        <input 
                                            type="number"
                                            name="rehabilitationPackagePrice" 
                                            defaultValue={editingSanatorium?.rehabilitationPackagePrice || 1200} 
                                            required={hasRehabilitationPackage}
                                            disabled={!hasRehabilitationPackage}
                                        />
                                    </div>
                                    <div className={styles.formGroup} style={{ flex: 1, paddingTop: '32px' }}>
                                        <label>Знижка для ветеранів (%)</label>
                                        <input 
                                            type="number"
                                            name="discountPercentage" 
                                            defaultValue={editingSanatorium?.discountPercentage || 20} 
                                            min="0" max="100"
                                            required 
                                        />
                                    </div>
                                    <div className={styles.formGroup} style={{ flex: 1, paddingTop: '32px' }}>
                                        <label>Кількість кімнат (загально)</label>
                                        <input 
                                            type="number"
                                            name="availableRooms" 
                                            defaultValue={editingSanatorium?.availableRooms || 10} 
                                            min="0"
                                            required 
                                        />
                                    </div>
                                </div>

                                {/* External Ratings Section */}
                                <h4 style={{marginTop: '20px', marginBottom: '10px', fontSize: '1.1rem'}}>Оцінки з інших платформ</h4>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div className={styles.formGroup} style={{ flex: 1 }}>
                                        <label>Оцінка Google (0-5)</label>
                                        <input 
                                            type="number"
                                            name="googleRating" 
                                            defaultValue={editingSanatorium?.googleRating || 0} 
                                            min="0" max="5" step="0.1"
                                        />
                                    </div>
                                    <div className={styles.formGroup} style={{ flex: 1 }}>
                                        <label>К-сть відгуків Google</label>
                                        <input 
                                            type="number"
                                            name="googleReviewsCount" 
                                            defaultValue={editingSanatorium?.googleReviewsCount || 0} 
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div className={styles.formGroup} style={{ flex: 1 }}>
                                        <label>Оцінка Booking (0-10)</label>
                                        <input 
                                            type="number"
                                            name="ratingBooking" 
                                            defaultValue={editingSanatorium?.ratingBooking || 0} 
                                            min="0" max="10" step="0.1"
                                        />
                                    </div>
                                    <div className={styles.formGroup} style={{ flex: 1 }}>
                                        <label>К-сть відгуків Booking</label>
                                        <input 
                                            type="number"
                                            name="bookingReviewsCount" 
                                            defaultValue={editingSanatorium?.bookingReviewsCount || 0} 
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div className={styles.formGroup} style={{ flex: 1 }}>
                                        <label>Оцінка TripAdvisor (0-5)</label>
                                        <input 
                                            type="number"
                                            name="ratingTripAdvisor" 
                                            defaultValue={editingSanatorium?.ratingTripAdvisor || 0} 
                                            min="0" max="5" step="0.1"
                                        />
                                    </div>
                                    <div className={styles.formGroup} style={{ flex: 1 }}>
                                        <label>К-сть відгуків TripAdvisor</label>
                                        <input 
                                            type="number"
                                            name="tripAdvisorReviewsCount" 
                                            defaultValue={editingSanatorium?.tripAdvisorReviewsCount || 0} 
                                            min="0"
                                        />
                                    </div>
                                </div>

                                {/* Specializations Section */}
                                <div className={styles.formGroup}>
                                    <label>Спеціалізації (для кого підходить)</label>
                                    <div className={styles.specializationsList}>
                                        {selectedSpecializations.map(spec => (
                                            <span key={spec} className={styles.specTag}>
                                                {SpecializationLabels[spec]}
                                                <button 
                                                    type="button" 
                                                    className={styles.removeSpecBtn}
                                                    onClick={() => setSelectedSpecializations(prev => prev.filter(s => s !== spec))}
                                                >✕</button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className={styles.addSpecRow}>
                                        <select 
                                            value={specializationToAdd} 
                                            onChange={(e) => setSpecializationToAdd(e.target.value as SanatoriumSpecialization)}
                                            className={styles.addSpecSelect}
                                        >
                                            <option value="">-- Оберіть спеціалізацію для додавання --</option>
                                            {Object.entries(SpecializationLabels)
                                                .filter(([key]) => !selectedSpecializations.includes(key as SanatoriumSpecialization))
                                                .map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                        <button 
                                            type="button" 
                                            className={styles.addSpecBtn}
                                            onClick={() => {
                                                if(specializationToAdd) {
                                                    setSelectedSpecializations(prev => [...prev, specializationToAdd as SanatoriumSpecialization]);
                                                    setSpecializationToAdd('');
                                                }
                                            }}
                                            disabled={!specializationToAdd}
                                        >
                                            + Додати
                                        </button>
                                    </div>
                                </div>

                                {/* Image Manager Section */}
                                <div className={styles.formGroup}>
                                    <label>Фото (до 5 шт.) — перетягніть для зміни порядку</label>
                                    
                                    {imageItems.length > 0 && (
                                        <div className={styles.imageManager}>
                                            {imageItems.map((item, index) => (
                                                <div
                                                    key={item.id}
                                                    className={`${styles.imageCard} ${
                                                        draggedIndex === index ? styles.dragging : ''
                                                    } ${dragOverIndex === index ? styles.dragOver : ''}`}
                                                    draggable
                                                    onDragStart={() => handleDragStart(index)}
                                                    onDragOver={(e) => handleDragOver(e, index)}
                                                    onDrop={(e) => handleDrop(e, index)}
                                                    onDragEnd={handleDragEnd}
                                                >
                                                    <div className={styles.imageOrderBadge}>
                                                        {index + 1}
                                                    </div>
                                                    <img 
                                                        src={item.url} 
                                                        alt={`Фото ${index + 1}`}
                                                        className={styles.imagePreview}
                                                    />
                                                    <div className={styles.imageActions}>
                                                        <button
                                                            type="button"
                                                            className={styles.imageReplaceBtn}
                                                            onClick={() => handleReplaceImage(item.id)}
                                                            title="Замінити фото"
                                                        >
                                                            🔄
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={styles.imageRemoveBtn}
                                                            onClick={() => handleRemoveImage(item.id)}
                                                            title="Видалити фото"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                    {index === 0 && (
                                                        <div className={styles.mainImageLabel}>Головне</div>
                                                    )}
                                                    <div className={styles.dragHandle} title="Перетягніть для зміни порядку">
                                                        ⠿
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {imageItems.length < 5 && (
                                        <button
                                            type="button"
                                            className={styles.addImageBtn}
                                            onClick={() => addInputRef.current?.click()}
                                        >
                                            + Додати фото ({imageItems.length}/5)
                                        </button>
                                    )}

                                    {/* Hidden file inputs */}
                                    <input
                                        ref={replaceInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleReplaceFileSelected}
                                    />
                                    <input
                                        ref={addInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        style={{ display: 'none' }}
                                        onChange={handleAddImages}
                                    />
                                </div>

                                <div className={styles.formActions}>
                                    <button 
                                        type="button" 
                                        className={styles.cancelBtn}
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setEditingSanatorium(null);
                                            setSelectedSpecializations([]);
                                            setSpecializationToAdd('');
                                            // Cleanup object URLs
                                            imageItems.forEach(item => {
                                                if (item.type === 'new') {
                                                    URL.revokeObjectURL(item.url);
                                                }
                                            });
                                            setImageItems([]);
                                        }}
                                    >
                                        Скасувати
                                    </button>
                                    <button 
                                        type="submit" 
                                        className={styles.submitBtn}
                                        disabled={saveSanatoriumMutation.isPending}
                                    >
                                        {saveSanatoriumMutation.isPending ? 'Збереження...' : 'Зберегти'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
        </>
    );
};

export default SanatoriumsTab;
