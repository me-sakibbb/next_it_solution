import React from 'react';
import { CVData, DesignSettings, DEFAULT_DESIGN_SETTINGS } from '../types';
import { Editable } from '../components/Editable';

// SVG Icons as small inline components
const MailIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
);

const PhoneIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
);

const MapPinIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
);

const LinkIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.556a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.757 8.06" />
    </svg>
);

const BuildingIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
);

interface TemplateProps {
    data: CVData;
    isEditing?: boolean;
    onUpdate?: (updatedData: CVData) => void;
    designSettings?: DesignSettings;
}

export const EuropassTemplate: React.FC<TemplateProps> = ({ data, isEditing = false, onUpdate, designSettings = DEFAULT_DESIGN_SETTINGS }) => {
    const { fontSize, lineHeight, sectionSpacing, itemSpacing, fontColor } = designSettings;

    // Europass uses a fixed blue color scheme
    const euroBlue = '#1e3a6e';
    const euroLightBlue = '#3b6fb6';
    const euroSectionBlue = '#1565c0';
    const euroDarkBg = '#1a2744';

    const handleUpdate = (field: string, value: any) => {
        if (!onUpdate) return;
        const updatedData = { ...data };
        const keys = field.split('.');
        if (keys.length === 1) {
            (updatedData as any)[keys[0]] = value;
        } else if (keys.length === 2) {
            // @ts-ignore
            updatedData[keys[0]] = { ...updatedData[keys[0]], [keys[1]]: value };
        }
        onUpdate(updatedData);
    };

    const handleArrayUpdate = (section: 'experience' | 'education' | 'projects' | 'certifications', index: number, field: string, value: any) => {
        if (!onUpdate) return;
        const updatedData = { ...data };
        // @ts-ignore
        const newArray = [...updatedData[section]];
        newArray[index] = { ...newArray[index], [field]: value };
        // @ts-ignore
        updatedData[section] = newArray;
        onUpdate(updatedData);
    };

    const handleDescriptionUpdate = (section: 'experience', index: number, descIndex: number, value: string) => {
        if (!onUpdate) return;
        const updatedData = { ...data };
        const newArray = [...updatedData[section]];
        const newDesc = [...newArray[index].description];
        newDesc[descIndex] = value;
        newArray[index] = { ...newArray[index], description: newDesc };
        updatedData[section] = newArray;
        onUpdate(updatedData);
    };

    return (
        <div
            className="w-[210mm] min-h-[297mm] bg-white font-sans"
            style={{
                fontSize: `${fontSize}rem`,
                lineHeight: lineHeight,
                color: fontColor,
            }}
        >
            {/* ===== HEADER BANNER ===== */}
            <div
                style={{ backgroundColor: euroBlue }}
                className="flex items-stretch"
            >
                {/* Photo - only show if uploaded */}
                {data.personalInfo.photo && (
                    <div className="shrink-0 p-6 flex items-center">
                        <div className="w-28 h-36 overflow-hidden bg-white" style={{ border: '3px solid rgba(255,255,255,0.3)' }}>
                            <img src={data.personalInfo.photo} alt={data.personalInfo.fullName} className="w-full h-full object-cover" />
                        </div>
                    </div>
                )}

                {/* Info */}
                <div className={`flex-1 py-6 pr-6 ${!data.personalInfo.photo ? 'pl-6' : ''}`}>
                    <h1 className="text-2xl font-bold text-white uppercase tracking-wide mb-3">
                        <Editable
                            value={data.personalInfo.fullName}
                            isEditing={isEditing}
                            onChange={(val) => handleUpdate('personalInfo.fullName', val)}
                            className="text-white"
                        />
                    </h1>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-white/90">
                        {(data.personalInfo.email || isEditing) && (
                            <div className="flex items-center gap-2">
                                <MailIcon className="w-3.5 h-3.5 shrink-0 text-white/70" />
                                <span><strong>Email:</strong>{' '}
                                    <Editable
                                        value={data.personalInfo.email}
                                        isEditing={isEditing}
                                        onChange={(val) => handleUpdate('personalInfo.email', val)}
                                        className="text-white/90"
                                    />
                                </span>
                            </div>
                        )}
                        {(data.personalInfo.phone || isEditing) && (
                            <div className="flex items-center gap-2">
                                <PhoneIcon className="w-3.5 h-3.5 shrink-0 text-white/70" />
                                <span><strong>Phone number:</strong>{' '}
                                    <Editable
                                        value={data.personalInfo.phone}
                                        isEditing={isEditing}
                                        onChange={(val) => handleUpdate('personalInfo.phone', val)}
                                        className="text-white/90"
                                    />
                                </span>
                            </div>
                        )}
                        {(data.personalInfo.location || isEditing) && (
                            <div className="flex items-center gap-2 col-span-2">
                                <MapPinIcon className="w-3.5 h-3.5 shrink-0 text-white/70" />
                                <span><strong>Address:</strong>{' '}
                                    <Editable
                                        value={data.personalInfo.location || ''}
                                        isEditing={isEditing}
                                        placeholder="Address"
                                        onChange={(val) => handleUpdate('personalInfo.location', val)}
                                        className="text-white/90"
                                    />
                                </span>
                            </div>
                        )}
                        {(data.personalInfo.linkedin || isEditing) && (
                            <div className="flex items-center gap-2 col-span-2">
                                <LinkIcon className="w-3.5 h-3.5 shrink-0 text-white/70" />
                                <span><strong>LinkedIn:</strong>{' '}
                                    {isEditing ? (
                                        <Editable
                                            value={data.personalInfo.linkedin || ''}
                                            isEditing={isEditing}
                                            placeholder="LinkedIn URL"
                                            onChange={(val) => handleUpdate('personalInfo.linkedin', val)}
                                            className="text-white/90"
                                        />
                                    ) : (
                                        <a href={data.personalInfo.linkedin} className="underline text-white/90">{data.personalInfo.linkedin}</a>
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Europass Logo area */}
                <div className="shrink-0 flex flex-col items-end pt-4 pr-6">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-sm flex items-center justify-center text-white font-bold text-xs"
                            style={{ backgroundColor: euroLightBlue }}
                        >
                            EU
                        </div>
                        <span className="text-white text-lg font-light tracking-wider">europass</span>
                    </div>
                </div>
            </div>

            {/* ===== BODY ===== */}
            <div className="px-8 py-6">

                {/* ABOUT ME */}
                <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                    <h2
                        className="text-sm font-bold uppercase tracking-wider pb-1 mb-3"
                        style={{ color: euroSectionBlue, borderBottom: `2px solid ${euroSectionBlue}` }}
                    >
                        About Me
                    </h2>
                    <div className="text-sm leading-relaxed text-justify">
                        <Editable
                            value={data.personalInfo.summary}
                            isEditing={isEditing}
                            multiline
                            onChange={(val) => handleUpdate('personalInfo.summary', val)}
                        />
                    </div>
                </section>

                {/* EDUCATION AND TRAINING */}
                <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                    <h2
                        className="text-sm font-bold uppercase tracking-wider pb-1 mb-4"
                        style={{ color: euroSectionBlue, borderBottom: `2px solid ${euroSectionBlue}` }}
                    >
                        Education and Training
                    </h2>
                    <div className="space-y-4">
                        {data.education.map((edu, index) => (
                            <div key={index} style={{ marginBottom: `${itemSpacing}rem` }}>
                                <h3 className="font-bold text-sm uppercase" style={{ color: euroSectionBlue }}>
                                    <Editable
                                        value={edu.degree}
                                        isEditing={isEditing}
                                        onChange={(val) => handleArrayUpdate('education', index, 'degree', val)}
                                    />
                                </h3>
                                <div className="text-sm italic text-gray-700">
                                    <Editable
                                        value={edu.institution}
                                        isEditing={isEditing}
                                        onChange={(val) => handleArrayUpdate('education', index, 'institution', val)}
                                    />
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                    <Editable
                                        value={edu.startDate}
                                        isEditing={isEditing}
                                        onChange={(val) => handleArrayUpdate('education', index, 'startDate', val)}
                                        className="inline"
                                    />
                                    <span className="mx-1">&ndash;</span>
                                    <Editable
                                        value={edu.endDate}
                                        isEditing={isEditing}
                                        onChange={(val) => handleArrayUpdate('education', index, 'endDate', val)}
                                        className="inline"
                                    />
                                </div>
                                {edu.description && (
                                    <div className="text-xs text-gray-600 mt-1">
                                        <Editable
                                            value={edu.description}
                                            isEditing={isEditing}
                                            multiline
                                            onChange={(val) => handleArrayUpdate('education', index, 'description', val)}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* WORK EXPERIENCE */}
                <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                    <h2
                        className="text-sm font-bold uppercase tracking-wider pb-1 mb-4"
                        style={{ color: euroSectionBlue, borderBottom: `2px solid ${euroSectionBlue}` }}
                    >
                        Work Experience
                    </h2>
                    <div className="space-y-5">
                        {data.experience.map((exp, index) => (
                            <div key={index} style={{ marginBottom: `${itemSpacing}rem` }}>
                                <div className="flex items-center gap-2 text-sm">
                                    <BuildingIcon className="w-3.5 h-3.5 shrink-0 text-gray-500" />
                                    <span className="font-semibold">
                                        <Editable
                                            value={exp.company}
                                            isEditing={isEditing}
                                            onChange={(val) => handleArrayUpdate('experience', index, 'company', val)}
                                        />
                                    </span>
                                </div>
                                <div className="font-bold text-sm mt-1">
                                    <Editable
                                        value={exp.position}
                                        isEditing={isEditing}
                                        onChange={(val) => handleArrayUpdate('experience', index, 'position', val)}
                                    />
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                    <Editable
                                        value={exp.startDate}
                                        isEditing={isEditing}
                                        onChange={(val) => handleArrayUpdate('experience', index, 'startDate', val)}
                                        className="inline"
                                    />
                                    <span className="mx-1">&ndash;</span>
                                    <Editable
                                        value={exp.endDate}
                                        isEditing={isEditing}
                                        onChange={(val) => handleArrayUpdate('experience', index, 'endDate', val)}
                                        className="inline"
                                    />
                                </div>
                                <div className="text-sm mt-1 leading-relaxed">
                                    {Array.isArray(exp.description) ? (
                                        <ul className="list-disc list-outside ml-4 space-y-0.5">
                                            {exp.description.map((desc, i) => (
                                                <li key={i} className="text-sm">
                                                    <Editable
                                                        value={desc}
                                                        isEditing={isEditing}
                                                        multiline
                                                        onChange={(val) => handleDescriptionUpdate('experience', index, i, val)}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <Editable
                                            value={exp.description}
                                            isEditing={isEditing}
                                            multiline
                                            onChange={(val) => handleArrayUpdate('experience', index, 'description', val)}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CERTIFICATIONS */}
                {data.certifications && data.certifications.length > 0 && (
                    <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                        <h2
                            className="text-sm font-bold uppercase tracking-wider pb-1 mb-4"
                            style={{ color: euroSectionBlue, borderBottom: `2px solid ${euroSectionBlue}` }}
                        >
                            Certifications
                        </h2>
                        <div className="space-y-3">
                            {data.certifications.map((cert, index) => (
                                <div key={index} style={{ marginBottom: `${itemSpacing * 0.5}rem` }}>
                                    <h3 className="font-bold text-sm" style={{ color: euroSectionBlue }}>
                                        <Editable
                                            value={cert.name}
                                            isEditing={isEditing}
                                            onChange={(val) => handleArrayUpdate('certifications', index, 'name', val)}
                                        />
                                    </h3>
                                    <div className="text-xs text-gray-600">
                                        <Editable
                                            value={cert.issuer}
                                            isEditing={isEditing}
                                            onChange={(val) => handleArrayUpdate('certifications', index, 'issuer', val)}
                                        />
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        <Editable
                                            value={cert.date}
                                            isEditing={isEditing}
                                            onChange={(val) => handleArrayUpdate('certifications', index, 'date', val)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* LANGUAGE SKILLS */}
                {data.languages && data.languages.length > 0 && (
                    <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                        <h2
                            className="text-sm font-bold uppercase tracking-wider pb-1 mb-3"
                            style={{ color: euroSectionBlue, borderBottom: `2px solid ${euroSectionBlue}` }}
                        >
                            Language Skills
                        </h2>
                        <div className="text-sm">
                            {isEditing ? (
                                <textarea
                                    className="w-full text-sm p-2 border border-dashed border-gray-300 rounded"
                                    value={data.languages.join(', ')}
                                    onChange={(e) => onUpdate && onUpdate({ ...data, languages: e.target.value.split(',').map(s => s.trim()) })}
                                    rows={3}
                                    placeholder="English, Bengali, Hindi"
                                />
                            ) : (
                                <div className="space-y-1">
                                    {data.languages.map((lang, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <span className="font-semibold" style={{ color: euroSectionBlue }}>{lang}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* PROJECTS */}
                {data.projects && data.projects.length > 0 && (
                    <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                        <h2
                            className="text-sm font-bold uppercase tracking-wider pb-1 mb-4"
                            style={{ color: euroSectionBlue, borderBottom: `2px solid ${euroSectionBlue}` }}
                        >
                            Projects
                        </h2>
                        <div className="space-y-3">
                            {data.projects.map((project, index) => (
                                <div key={index} style={{ marginBottom: `${itemSpacing * 0.5}rem` }}>
                                    <h3 className="font-bold text-sm" style={{ color: euroSectionBlue }}>{project.name}</h3>
                                    <p className="text-sm text-gray-700">{project.description}</p>
                                    {project.technologies && project.technologies.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {project.technologies.map((tech, i) => (
                                                <span key={i} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#e3f2fd', color: euroSectionBlue }}>
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* ===== SKILLS FOOTER BAR ===== */}
            <div
                className="mt-auto px-8 py-5"
                style={{ backgroundColor: euroDarkBg }}
            >
                <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-2">
                    Skills
                </h2>
                <div className="text-sm text-white/90">
                    {isEditing ? (
                        <textarea
                            className="w-full text-sm p-2 border border-dashed border-white/30 rounded bg-white/10 text-white"
                            value={data.skills.join(' / ')}
                            onChange={(e) => onUpdate && onUpdate({ ...data, skills: e.target.value.split('/').map(s => s.trim()).filter(Boolean) })}
                            rows={3}
                            placeholder="Skill 1 / Skill 2 / Skill 3"
                        />
                    ) : (
                        <span>{data.skills.join('  /  ')}</span>
                    )}
                </div>
            </div>
        </div>
    );
};
