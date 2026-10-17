import { ProjectItem, DecisionItem, NoteItem, MarketplaceListing } from '../types';

// ============================================================
// SAMPLE PROJECTS
// ============================================================
export const seedProjects: ProjectItem[] = [
    {
        id: 'proj-1',
        name: 'River Bridge Construction',
        code: 'PRJ-001',
        client: 'Nairobi County',
        location: 'Kilimani, Nairobi',
        status: 'In Progress',
        progress: 45,
        startDate: '2026-01-15',
        expectedCompletion: '2026-12-20',
        budget: 2500000,
        spent: 1125000,
        leadEngineer: 'usr-01',
        
        openDefectsCount: 2,
        image: '',
        createdBy: 'usr-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'proj-2',
        name: 'Highway Expansion Phase 2',
        code: 'PRJ-002',
        client: 'KURA',
        location: 'Nairobi, Kenya',
        status: 'Design Phase',
        progress: 20,
        startDate: '2026-03-01',
        expectedCompletion: '2027-06-30',
        budget: 5000000,
        spent: 1000000,
        leadEngineer: 'usr-02',
        
        openDefectsCount: 0,
        image: '',
        createdBy: 'usr-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'proj-3',
        name: 'Commercial Building - Kilimani',
        code: 'PRJ-003',
        client: 'ABC Developers',
        location: 'Kilimani, Nairobi',
        status: 'Inspection',
        progress: 85,
        startDate: '2025-08-01',
        expectedCompletion: '2026-09-30',
        budget: 8000000,
        spent: 6800000,
        leadEngineer: 'usr-01',
        
        openDefectsCount: 1,
        image: '',
        createdBy: 'usr-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// ============================================================
// SAMPLE NOTES
// ============================================================
export const seedNotes: NoteItem[] = [
    {
        id: 'note-1',
        userId: 'usr-01',
        title: 'Concrete Cube Test Results',
        content: 'Cube strength at 28 days: 35 MPa. All samples within specification. Location: Column C5.',
        category: 'Site Inspection',
        date: '2026-07-28',
        tags: ['concrete', 'testing', 'quality'],
        hasAudio: false,
        hasSketch: false,
        linkedAssets: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'note-2',
        userId: 'usr-01',
        title: 'Foundation Settlement Issue',
        content: 'Observed settlement in footing F12. Approx 15mm. Need to verify with survey team. Possible soil issue.',
        category: 'Design Review',
        date: '2026-07-27',
        tags: ['foundation', 'settlement', 'urgent'],
        hasAudio: false,
        hasSketch: true,
        linkedAssets: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'note-3',
        userId: 'usr-01',
        title: 'Steel Delivery Confirmed',
        content: 'Steel reinforcement for columns B1-B12 delivered today. 42 tons. Quality inspection passed.',
        category: 'SOP',
        date: '2026-07-25',
        tags: ['steel', 'delivery', 'material'],
        hasAudio: false,
        hasSketch: false,
        linkedAssets: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// ============================================================
// SAMPLE DECISIONS
// ============================================================
export const seedDecisions: DecisionItem[] = [
    {
        id: 'dec-1',
        decisionNumber: 1,
        projectId: 'proj-1',
        title: 'Increase Slab Thickness',
        reason: 'Higher loading requirement from revised structural analysis. Original 150mm insufficient.',
        requestedBy: 'Martin Vance',
        reviewedBy: 'Consultant',
        approvedBy: 'Client',
        implemented: false,
        status: 'Pending',
        impactLevel: 'High',
        costImpact: '+5%',
        scheduleImpact: '+2 days',
        affectedDrawings: ['S-12', 'S-14'],
        relatedRFIs: ['RFI-08'],
        relatedPhotosCount: 0,
        date: '2026-07-15',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'dec-2',
        decisionNumber: 2,
        projectId: 'proj-1',
        title: 'Reinforcement Grade Change',
        reason: 'High-strength steel required for seismic design. Change from 410 MPa to 500 MPa.',
        requestedBy: 'Structural Engineer',
        reviewedBy: 'Consultant',
        approvedBy: 'Project Manager',
        implemented: true,
        status: 'Approved',
        impactLevel: 'Medium',
        costImpact: '+3%',
        scheduleImpact: '0',
        affectedDrawings: ['S-08', 'S-09', 'S-10'],
        relatedRFIs: ['RFI-06'],
        relatedPhotosCount: 0,
        date: '2026-07-10',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// ============================================================
// SAMPLE MARKETPLACE LISTINGS
// ============================================================
export const seedListings: MarketplaceListing[] = [
    {
        id: 'list-1',
        title: 'Excavator 15 Ton',
        category: 'Equipment Rentals',
        provider: 'Machinery Co. Ltd',
        verified: true,
        rating: 4.8,
        reviewsCount: 23,
        location: 'Nairobi',
        priceRate: '$450/day',
        availability: 'Available immediately',
        description: 'CAT 320D excavator. 15 ton capacity. Well maintained. Operator available on request.',
        contactEmail: 'info@machineryco.com',
        contactPhone: '+254-700-123456',
        specs: { brand: 'CAT', model: '320D', year: '2020', hours: '1200' },
        image: '',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'list-2',
        title: 'Cement Grade 42.5 - 50kg Bags',
        category: 'Material Supply',
        provider: 'Cement Supply Ltd',
        verified: true,
        rating: 4.5,
        reviewsCount: 67,
        location: 'Mombasa',
        priceRate: '$12/bag',
        availability: '500 bags in stock',
        description: 'Premium Portland cement. Grade 42.5. Ideal for structural concrete. Bulk discounts available.',
        contactEmail: 'sales@cementsupply.com',
        contactPhone: '+254-710-789012',
        specs: { grade: '42.5', weight: '50kg', type: 'Portland' },
        image: '',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'list-3',
        title: 'Skilled Electrician - Available',
        category: 'Skilled Worker',
        provider: 'John Mwangi',
        verified: false,
        rating: 4.9,
        reviewsCount: 12,
        location: 'Kisumu',
        priceRate: '$35/day',
        availability: 'Available now',
        description: 'Licensed electrician with 8 years experience. Commercial and industrial projects. Panel wiring, lighting, and troubleshooting.',
        contactEmail: 'johnm@example.com',
        contactPhone: '+254-720-345678',
        specs: { trade: 'Electrician', experience: '8 years', certifications: 'Licensed, OSHA' },
        image: '',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// ============================================================
// SEED FUNCTION
// ============================================================
export const seedAllData = () => {
    console.log('ðŸŒ± Seeding EngineerOS data...');

    // Check if data already exists
    const existingProjects = localStorage.getItem('engineeros_projects');
    const existingNotes = localStorage.getItem('engineeros_notes');
    const existingDecisions = localStorage.getItem('engineeros_decisions');
    const existingListings = localStorage.getItem('engineeros_listings');

    // Only seed if empty
    if (!existingProjects) {
        localStorage.setItem('engineeros_projects', JSON.stringify(seedProjects));
        console.log('  âœ… Seeded Projects');
    } else {
        console.log('  â­ï¸ Projects already exist');
    }

    if (!existingNotes) {
        localStorage.setItem('engineeros_notes', JSON.stringify(seedNotes));
        console.log('  âœ… Seeded Notes');
    } else {
        console.log('  â­ï¸ Notes already exist');
    }

    if (!existingDecisions) {
        localStorage.setItem('engineeros_decisions', JSON.stringify(seedDecisions));
        console.log('  âœ… Seeded Decisions');
    } else {
        console.log('  â­ï¸ Decisions already exist');
    }

    if (!existingListings) {
        localStorage.setItem('engineeros_listings', JSON.stringify(seedListings));
        console.log('  âœ… Seeded Marketplace Listings');
    } else {
        console.log('  â­ï¸ Listings already exist');
    }

    console.log('ðŸŒ± Seeding complete!');
};
