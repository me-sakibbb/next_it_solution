export interface CVData {
    personalInfo: {
        fullName: string;
        email: string;
        phone: string;
        linkedin?: string;
        website?: string;
        location?: string;
        summary: string;
        photo?: string; // URL or base64 string
    };
    education: Array<{
        institution: string;
        degree: string;
        startDate: string;
        endDate: string;
        description?: string;
    }>;
    experience: Array<{
        company: string;
        position: string;
        startDate: string;
        endDate: string;
        description: string | string[];
        achievements?: string[];
    }>;
    skills: string[];
    projects?: Array<{
        name: string;
        description: string;
        technologies: string[];
        link?: string;
    }>;
    certifications?: Array<{
        name: string;
        issuer: string;
        date: string;
    }>;
    languages?: string[];
}

export interface DesignSettings {
    fontSize: number; // base font size in px/rem
    lineHeight: number;
    sectionSpacing: number; // margin bottom for sections
    itemSpacing: number; // margin bottom for items
    fontColor: string;
    primaryColor: string;
}

export const DEFAULT_DESIGN_SETTINGS: DesignSettings = {
    fontSize: 1, // rem
    lineHeight: 1.5,
    sectionSpacing: 1.5, // rem
    itemSpacing: 1, // rem
    fontColor: '#1e293b', // slate-800
    primaryColor: '#2563eb', // blue-600
};
