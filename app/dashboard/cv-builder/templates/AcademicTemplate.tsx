import React from 'react';
import { CVData, DesignSettings, DEFAULT_DESIGN_SETTINGS } from '../types';
import { Editable } from '../components/Editable';

interface TemplateProps {
    data: CVData;
    isEditing?: boolean;
    onUpdate?: (updatedData: CVData) => void;
    designSettings?: DesignSettings;
}

export const AcademicTemplate: React.FC<TemplateProps> = ({ data, isEditing = false, onUpdate, designSettings = DEFAULT_DESIGN_SETTINGS }) => {
    const { fontSize, lineHeight, sectionSpacing, itemSpacing, fontColor, primaryColor } = designSettings;

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

    const handleArrayUpdate = (section: 'experience' | 'education' | 'projects', index: number, field: string, value: any) => {
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
            className="w-[210mm] min-h-[297mm] bg-white p-12 font-serif"
            style={{
                fontSize: `${fontSize}rem`,
                lineHeight: lineHeight,
                color: fontColor
            }}
        >
            {/* Header */}
            <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
                {data.personalInfo.photo && (
                    <div className="w-24 h-24 mx-auto mb-4 border border-slate-300 p-1 bg-white">
                        <img src={data.personalInfo.photo} alt={data.personalInfo.fullName} className="w-full h-full object-cover grayscale" />
                    </div>
                )}
                <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">
                    <Editable
                        value={data.personalInfo.fullName}
                        isEditing={isEditing}
                        onChange={(val) => handleUpdate('personalInfo.fullName', val)}
                    />
                </h1>
                <div className="text-sm flex justify-center gap-4 text-slate-600">
                    <Editable
                        value={data.personalInfo.email}
                        isEditing={isEditing}
                        onChange={(val) => handleUpdate('personalInfo.email', val)}
                    />
                    <span>•</span>
                    <Editable
                        value={data.personalInfo.phone}
                        isEditing={isEditing}
                        onChange={(val) => handleUpdate('personalInfo.phone', val)}
                    />
                    {(data.personalInfo.location || isEditing) && (
                        <>
                            <span>•</span>
                            <Editable
                                value={data.personalInfo.location || ''}
                                isEditing={isEditing}
                                placeholder="Location"
                                onChange={(val) => handleUpdate('personalInfo.location', val)}
                            />
                        </>
                    )}
                </div>
                {(data.personalInfo.linkedin || isEditing) && (
                    <div className="text-sm mt-1">
                        {isEditing ? (
                            <Editable
                                value={data.personalInfo.linkedin || ''}
                                isEditing={isEditing}
                                placeholder="LinkedIn URL"
                                onChange={(val) => handleUpdate('personalInfo.linkedin', val)}
                            />
                        ) : (
                            <a href={data.personalInfo.linkedin} className="text-slate-600 hover:underline">
                                {data.personalInfo.linkedin}
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* Summary */}
            <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                <h2 className="text-lg font-bold uppercase border-b border-slate-400 mb-4 pb-1">Professional Summary</h2>
                <div className="text-justify leading-relaxed">
                    <Editable
                        value={data.personalInfo.summary}
                        isEditing={isEditing}
                        multiline
                        onChange={(val) => handleUpdate('personalInfo.summary', val)}
                    />
                </div>
            </section>

            {/* Education - Academic CVs often put education first */}
            <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                <h2 className="text-lg font-bold uppercase border-b border-slate-400 mb-4 pb-1">Education</h2>
                <div className="space-y-4">
                    {data.education.map((edu, index) => (
                        <div key={index} style={{ marginBottom: `${itemSpacing}rem` }}>
                            <div className="flex justify-between font-bold">
                                <Editable
                                    value={edu.institution}
                                    isEditing={isEditing}
                                    onChange={(val) => handleArrayUpdate('education', index, 'institution', val)}
                                />
                                <span>
                                    <Editable
                                        value={edu.startDate}
                                        isEditing={isEditing}
                                        onChange={(val) => handleArrayUpdate('education', index, 'startDate', val)}
                                        className="w-20 inline-block text-right"
                                    />
                                    {' – '}
                                    <Editable
                                        value={edu.endDate}
                                        isEditing={isEditing}
                                        onChange={(val) => handleArrayUpdate('education', index, 'endDate', val)}
                                        className="w-20 inline-block"
                                    />
                                </span>
                            </div>
                            <div className="italic">
                                <Editable
                                    value={edu.degree}
                                    isEditing={isEditing}
                                    onChange={(val) => handleArrayUpdate('education', index, 'degree', val)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Experience */}
            <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                <h2 className="text-lg font-bold uppercase border-b border-slate-400 mb-4 pb-1">Professional Experience</h2>
                <div className="space-y-6">
                    {data.experience.map((exp, index) => (
                        <div key={index} style={{ marginBottom: `${itemSpacing}rem` }}>
                            <div className="flex justify-between font-bold text-lg">
                                <Editable
                                    value={exp.company}
                                    isEditing={isEditing}
                                    onChange={(val) => handleArrayUpdate('experience', index, 'company', val)}
                                />
                                <span className="text-base font-normal">
                                    <Editable
                                        value={exp.startDate}
                                        isEditing={isEditing}
                                        onChange={(val) => handleArrayUpdate('experience', index, 'startDate', val)}
                                        className="w-20 inline-block text-right"
                                    />
                                    {' – '}
                                    <Editable
                                        value={exp.endDate}
                                        isEditing={isEditing}
                                        onChange={(val) => handleArrayUpdate('experience', index, 'endDate', val)}
                                        className="w-20 inline-block"
                                    />
                                </span>
                            </div>
                            <div className="font-bold mb-2">
                                <Editable
                                    value={exp.position}
                                    isEditing={isEditing}
                                    onChange={(val) => handleArrayUpdate('experience', index, 'position', val)}
                                />
                            </div>
                            <div className="pl-4">
                                {Array.isArray(exp.description) ? (
                                    <ul className="list-disc space-y-1">
                                        {exp.description.map((desc, i) => (
                                            <li key={i}>
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
                                        className="whitespace-pre-wrap"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Skills */}
            <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                <h2 className="text-lg font-bold uppercase border-b border-slate-300 mb-6" style={{ color: '#0f172a' }}>Skills</h2>
                <p className="text-sm">{data.skills.join(' • ')}</p>
            </section>

            {/* Certifications (Optional) */}
            {data.certifications && data.certifications.length > 0 && (
                <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                    <h2 className="text-lg font-bold uppercase border-b border-slate-300 mb-6" style={{ color: '#0f172a' }}>Certifications</h2>
                    <ul className="list-disc list-outside ml-5 space-y-1 text-sm">
                        {data.certifications.map((cert, index) => (
                            <li key={index} style={{ marginBottom: '0.25rem' }}>
                                <span className="font-bold">{cert.name}</span>, {cert.issuer} ({cert.date})
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
};
