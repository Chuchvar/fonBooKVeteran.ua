import axios from '../utils/axios';

export type SanatoriumSpecialization =
    | "AMPUTATION_LOWER"
    | "AMPUTATION_UPPER"
    | "WHEELCHAIR"
    | "MENTAL_HEALTH"
    | "HEARING"
    | "VISION"
    | "GENERAL_TRAUMA"
    | "NEUROLOGICAL";

export const SpecializationLabels: Record<SanatoriumSpecialization, string> = {
    AMPUTATION_LOWER: "Ампутація нижніх кінцівок",
    AMPUTATION_UPPER: "Ампутація верхніх кінцівок",
    WHEELCHAIR: "Крісло колісне",
    MENTAL_HEALTH: "Психічне здоров'я (ПТСР тощо)",
    HEARING: "Вади слуху",
    VISION: "Вади зору",
    GENERAL_TRAUMA: "Загальні травми / ОРА",
    NEUROLOGICAL: "Неврологічні порушення"
};

export interface ISanatorium {
    id: number;
    name: string;
    region: string;
    address: string;
    medicalProfile: string;
    description: string;
    imagePaths: string[];
    specializations?: SanatoriumSpecialization[];
    averageRating?: number;
    reviewCount?: number;
    standardPackagePrice?: number;
    premiumPackagePrice?: number;
    rehabilitationPackagePrice?: number;
    availableRooms?: number;
    discountPercentage?: number;
    hasStandardPackage?: boolean;
    hasPremiumPackage?: boolean;
    hasRehabilitationPackage?: boolean;
    googleRating?: number;
    googleReviewsCount?: number;
    ratingBooking?: number;
    bookingReviewsCount?: number;
    ratingTripAdvisor?: number;
    tripAdvisorReviewsCount?: number;
}

export interface IPageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
}

export interface IReview {
    id: number;
    sanatoriumId: number;
    userId?: number;
    userName: string;
    rating: number;
    commentText: string;
    createdAt: string;
}

export interface IReviewCreate {
    rating: number;
    commentText: string;
}

export interface ISanatoriumFilters {
    region?: string;
    profile?: string;
    specialization?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    size?: number;
    sort?: string;
    direction?: string;
}

class SanatoriumsService {
    async getSanatoriums(filters: ISanatoriumFilters = {}) {
        const params: Record<string, unknown> = {};
        if (filters.region) params.region = filters.region;
        if (filters.profile) params.profile = filters.profile;
        if (filters.specialization) params.specialization = filters.specialization;
        if (filters.search) params.search = filters.search;
        if (filters.minPrice !== undefined && filters.minPrice !== null) params.minPrice = filters.minPrice;
        if (filters.maxPrice !== undefined && filters.maxPrice !== null) params.maxPrice = filters.maxPrice;
        params.page = filters.page ?? 0;
        params.size = filters.size ?? 15;
        if (filters.sort) params.sort = filters.sort;
        if (filters.direction) params.direction = filters.direction;
        
        try {
            const { data } = await axios.get<IPageResponse<ISanatorium>>('/api/sanatoriums', { params });
            return data;
        } catch (error) {
            console.error('Error fetching sanatoriums:', error);
            throw error;
        }
    }

    async getRegions() {
        try {
            const { data } = await axios.get<string[]>('/api/sanatoriums/regions');
            return data;
        } catch (error) {
            console.error('Error fetching regions:', error);
            throw error;
        }
    }

    async getTopRated(limit: number = 5) {
        try {
            const { data } = await axios.get<ISanatorium[]>('/api/sanatoriums/top-rated', { params: { limit } });
            return data;
        } catch (error) {
            console.error('Error fetching top rated sanatoriums:', error);
            throw error;
        }
    }

    async getReviews(sanatoriumId: number) {
        try {
            const { data } = await axios.get<IReview[]>(`/api/sanatoriums/${sanatoriumId}/reviews`);
            return data;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw error;
        }
    }

    async createReview(sanatoriumId: number, review: IReviewCreate) {
        try {
            const { data } = await axios.post<IReview>(`/api/sanatoriums/${sanatoriumId}/reviews`, review);
            return data;
        } catch (error) {
            console.error('Error creating review:', error);
            throw error;
        }
    }

    async getSanatoriumById(id: number) {
        try {
            const { data } = await axios.get<ISanatorium>(`/api/sanatoriums/${id}`);
            return data;
        } catch (error) {
            console.error('Error fetching sanatorium:', error);
            throw error;
        }
    }

    async createSanatorium(sanatoriumData: Omit<ISanatorium, 'id'>) {
        try {
            const { data } = await axios.post<ISanatorium>('/api/sanatoriums', sanatoriumData);
            return data;
        } catch (error) {
            console.error('Error creating sanatorium:', error);
            throw error;
        }
    }

    async uploadImages(files: File[]) {
        try {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));
            const { data } = await axios.post<string[]>('/api/sanatoriums/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return data;
        } catch (error) {
            console.error('Error uploading images:', error);
            throw error;
        }
    }

    async updateSanatorium(id: number, sanatoriumData: Omit<ISanatorium, 'id'>) {
        try {
            const { data } = await axios.put<ISanatorium>(`/api/sanatoriums/${id}`, sanatoriumData);
            return data;
        } catch (error) {
            console.error('Error updating sanatorium:', error);
            throw error;
        }
    }

    async deleteSanatorium(id: number) {
        try {
            await axios.delete(`/api/sanatoriums/${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting sanatorium:', error);
            throw error;
        }
    }
}

export const sanatoriumsService = new SanatoriumsService();
