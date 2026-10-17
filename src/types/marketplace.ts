export interface MarketplaceListing {
    id: string;
    title: string;
    category: string;
    provider: string;
    verified: boolean;
    rating: number;
    reviewsCount: number;
    location: string;
    priceRate: string;
    availability: string;
    description: string;
    contactEmail: string;
    contactPhone: string;
    specs: Record<string, string>;
    image: string;

    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}