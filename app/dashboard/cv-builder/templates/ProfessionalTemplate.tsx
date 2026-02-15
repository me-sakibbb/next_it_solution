import React from 'react';
import { CVData, DesignSettings, DEFAULT_DESIGN_SETTINGS } from '../types';
import { Editable } from '../components/Editable';

interface TemplateProps {
    data: CVData;
    isEditing?: boolean;
    onUpdate?: (updatedData: CVData) => void;
    designSettings?: DesignSettings;
}

export const ProfessionalTemplate: React.FC<TemplateProps> = ({ data, isEditing = false, onUpdate, designSettings = DEFAULT_DESIGN_SETTINGS }) => {
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
            <div
                className="text-center mb-8 border-b-2 pb-8"
                style={{ borderColor: '#111827' }}
            >
                {data.personalInfo.photo && (
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm mx-auto mb-6">
                        <img src={data.personalInfo.photo} alt={data.personalInfo.fullName} className="w-full h-full object-cover" />
                    </div>
                )}
                <h1 className="text-3xl font-bold uppercase tracking-widest mb-4" style={{ color: '#111827' }}>
                    <Editable
                        value={data.personalInfo.fullName}
                        isEditing={isEditing}
                        onChange={(val) => handleUpdate('personalInfo.fullName', val)}
                    />
                </h1>
                <div className="flex justify-center flex-wrap gap-4 text-sm" style={{ color: fontColor }}>
                    <Editable
                        value={data.personalInfo.email}
                        isEditing={isEditing}
                        onChange={(val) => handleUpdate('personalInfo.email', val)}
                    />
                    <span>|</span>
                    <Editable
                        value={data.personalInfo.phone}
                        isEditing={isEditing}
                        onChange={(val) => handleUpdate('personalInfo.phone', val)}
                    />
                    {(data.personalInfo.location || isEditing) && (
                        <>
                            <span>|</span>
                            <Editable
                                value={data.personalInfo.location || ''}
                                isEditing={isEditing}
                                placeholder="Location"
                                onChange={(val) => handleUpdate('personalInfo.location', val)}
                            />
                        </>
                    )}
                    {(data.personalInfo.linkedin || isEditing) && (
                        <>
                            <span>|</span>
                            {isEditing ? (
                                <Editable
                                    value={data.personalInfo.linkedin || ''}
                                    isEditing={isEditing}
                                    placeholder="LinkedIn URL"
                                    onChange={(val) => handleUpdate('personalInfo.linkedin', val)}
                                />
                            ) : (
                                <a href={data.personalInfo.linkedin} className="hover:underline" style={{ color: primaryColor }}>LinkedIn</a>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Summary */}
            <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-2 mb-4" style={{ color: primaryColor }}>Professional Summary</h2>
                <div className="text-sm leading-relaxed text-justify">
                    <Editable
                        value={data.personalInfo.summary}
                        isEditing={isEditing}
                        multiline
                        onChange={(val) => handleUpdate('personalInfo.summary', val)}
                    />
                </div>
            </section>

            {/* Experience */}
            <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-2 mb-6" style={{ color: primaryColor }}>Work Experience</h2>
                <div className="space-y-6">
                    {data.experience.map((exp, index) => (
                        <div key={index} style={{ marginBottom: `${itemSpacing}rem` }}>
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-lg" style={{ color: '#111827' }}>
                                    <Editable
                                        value={exp.company}
                                        isEditing={isEditing}
                                        onChange={(val) => handleArrayUpdate('experience', index, 'company', val)}
                                    />
                                </h3>
                                <span className="text-sm italic">
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
                            <div className="text-sm font-semibold mb-2" style={{ color: primaryColor }}>
                                <Editable
                                    value={exp.position}
                                    isEditing={isEditing}
                                    onChange={(val) => handleArrayUpdate('experience', index, 'position', val)}
                                />
                            </div>
                            <div className="text-sm leading-relaxed">
                                {Array.isArray(exp.description) ? (
                                    <ul className="list-disc list-outside ml-4 space-y-1">
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

            {/* Education */}
            <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-2 mb-6" style={{ color: primaryColor }}>Education</h2>
                <div className="space-y-4">
                    {data.education.map((edu, index) => (
                        <div key={index} className="flex justify-between" style={{ marginBottom: `${itemSpacing}rem` }}>
                            <div>
                                <h3 className="font-bold" style={{ color: '#111827' }}>
                                    <Editable
                                        value={edu.institution}
                                        isEditing={isEditing}
                                        onChange={(val) => handleArrayUpdate('education', index, 'institution', val)}
                                    />
                                </h3>
                                <div className="text-sm" style={{ color: fontColor }}>
                                    <Editable
                                        value={edu.degree}
                                        isEditing={isEditing}
                                        onChange={(val) => handleArrayUpdate('education', index, 'degree', val)}
                                    />
                                </div>
                            </div>
                            <div className="text-sm italic text-right">
                                <div>
                                    <Editable
                                        value={edu.startDate}
                                        isEditing={isEditing}
                                        onChange={(val) => handleArrayUpdate('education', index, 'startDate', val)}
                                        className="w-16 inline-block text-right"
                                    />
                                    {' – '}
                                    <Editable
                                        value={edu.endDate}
                                        isEditing={isEditing}
                                        onChange={(val) => handleArrayUpdate('education', index, 'endDate', val)}
                                        className="w-16 inline-block"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Skills */}
            <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-2 mb-4" style={{ color: primaryColor }}>Core Competencies</h2>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    {isEditing ? (
                        <textarea
                            className="w-full text-sm p-2 border border-dashed border-gray-300 rounded"
                            value={data.skills.join(', ')}
                            onChange={(e) => onUpdate && onUpdate({ ...data, skills: e.target.value.split(',').map(s => s.trim()) })}
                            rows={4}
                            placeholder="Skill 1, Skill 2, Skill 3"
                        />
                    ) : (
                        data.skills.map((skill, index) => (
                            <span key={index} className="flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: primaryColor }}></span>
                                {skill}
                            </span>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};
