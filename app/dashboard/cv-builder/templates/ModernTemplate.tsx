import React from 'react';
import { CVData, DesignSettings, DEFAULT_DESIGN_SETTINGS } from '../types';
import { Editable } from '../components/Editable';

interface TemplateProps {
    data: CVData;
    isEditing?: boolean;
    onUpdate?: (updatedData: CVData) => void;
    designSettings?: DesignSettings;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ data, isEditing = false, onUpdate, designSettings = DEFAULT_DESIGN_SETTINGS }) => {

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
            className="w-[210mm] min-h-[297mm] bg-white p-8 shadow-lg font-sans"
            style={{
                fontSize: `${fontSize}rem`,
                lineHeight: lineHeight,
                color: fontColor
            }}
        >
            {/* Header */}
            <header
                className="border-b-4 pb-6 mb-6 flex justify-between items-start gap-6"
                style={{ borderColor: primaryColor, marginBottom: `${sectionSpacing}rem` }}
            >
                <div className="flex-1">
                    <h1 className="text-4xl font-bold uppercase tracking-wider" style={{ color: '#0f172a' }}>
                        <Editable
                            value={data.personalInfo.fullName}
                            isEditing={isEditing}
                            onChange={(val) => handleUpdate('personalInfo.fullName', val)}
                        />
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm" style={{ color: fontColor }}>
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
                        {(data.personalInfo.linkedin || isEditing) && (
                            <>
                                <span>•</span>
                                {isEditing ? (
                                    <Editable
                                        value={data.personalInfo.linkedin || ''}
                                        isEditing={isEditing}
                                        placeholder="LinkedIn URL"
                                        onChange={(val) => handleUpdate('personalInfo.linkedin', val)}
                                    />
                                ) : (
                                    <a href={data.personalInfo.linkedin} style={{ color: primaryColor }} className="hover:underline">LinkedIn</a>
                                )}
                            </>
                        )}
                    </div>
                </div>
                {data.personalInfo.photo && (
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-md shrink-0">
                        <img src={data.personalInfo.photo} alt={data.personalInfo.fullName} className="w-full h-full object-cover" />
                    </div>
                )}
            </header>

            {/* Summary */}
            <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                <h2 className="text-lg font-bold uppercase tracking-wide mb-2" style={{ color: primaryColor }}>My Profile</h2>
                <Editable
                    value={data.personalInfo.summary}
                    isEditing={isEditing}
                    multiline
                    onChange={(val) => handleUpdate('personalInfo.summary', val)}
                    className="block w-full"
                />
            </section>

            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2">
                    {/* Experience */}
                    <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                        <h2 className="text-lg font-bold uppercase tracking-wide mb-4 border-b pb-1" style={{ color: primaryColor, borderColor: '#e2e8f0' }}>Experience</h2>
                        <div className="space-y-6">
                            {data.experience.map((exp, index) => (
                                <div key={index} className="relative group" style={{ marginBottom: `${itemSpacing}rem` }}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-lg" style={{ color: '#0f172a' }}>
                                            <Editable
                                                value={exp.position}
                                                isEditing={isEditing}
                                                onChange={(val) => handleArrayUpdate('experience', index, 'position', val)}
                                            />
                                        </h3>
                                        <span className="text-sm text-slate-500 whitespace-nowrap ml-4">
                                            <Editable
                                                value={exp.startDate}
                                                isEditing={isEditing}
                                                onChange={(val) => handleArrayUpdate('experience', index, 'startDate', val)}
                                                className="w-20 inline-block text-right"
                                            />
                                            {' - '}
                                            <Editable
                                                value={exp.endDate}
                                                isEditing={isEditing}
                                                onChange={(val) => handleArrayUpdate('experience', index, 'endDate', val)}
                                                className="w-20 inline-block"
                                            />
                                        </span>
                                    </div>
                                    <div className="font-medium text-sm mb-2" style={{ color: primaryColor }}>
                                        <Editable
                                            value={exp.company}
                                            isEditing={isEditing}
                                            onChange={(val) => handleArrayUpdate('experience', index, 'company', val)}
                                        />
                                    </div>
                                    <div className="text-sm">
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
                                                className="whitespace-pre-wrap leading-relaxed"
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Projects - Simplified for now, similar logic would apply */}
                    {data.projects && data.projects.length > 0 && (
                        <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                            <h2 className="text-lg font-bold uppercase tracking-wide mb-4 border-b pb-1" style={{ color: primaryColor, borderColor: '#e2e8f0' }}>Projects</h2>
                            <div className="space-y-4">
                                {data.projects.map((project, index) => (
                                    <div key={index} style={{ marginBottom: `${itemSpacing}rem` }}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-slate-800">{project.name}</h3>
                                        </div>
                                        <p className="text-sm text-slate-700 mb-2">{project.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <div className="col-span-1">
                    {/* Education */}
                    <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                        <h2 className="text-lg font-bold uppercase tracking-wide mb-4 border-b pb-1" style={{ color: primaryColor, borderColor: '#e2e8f0' }}>Education</h2>
                        <div className="space-y-4">
                            {data.education.map((edu, index) => (
                                <div key={index} style={{ marginBottom: `${itemSpacing}rem` }}>
                                    <h3 className="font-bold text-slate-800">
                                        <Editable
                                            value={edu.degree}
                                            isEditing={isEditing}
                                            onChange={(val) => handleArrayUpdate('education', index, 'degree', val)}
                                        />
                                    </h3>
                                    <div className="text-sm text-slate-600">
                                        <Editable
                                            value={edu.institution}
                                            isEditing={isEditing}
                                            onChange={(val) => handleArrayUpdate('education', index, 'institution', val)}
                                        />
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        <Editable
                                            value={edu.startDate}
                                            isEditing={isEditing}
                                            onChange={(val) => handleArrayUpdate('education', index, 'startDate', val)}
                                            className="w-16 inline-block"
                                        />
                                        {' - '}
                                        <Editable
                                            value={edu.endDate}
                                            isEditing={isEditing}
                                            onChange={(val) => handleArrayUpdate('education', index, 'endDate', val)}
                                            className="w-16 inline-block"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Skills */}
                    <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                        <h2 className="text-lg font-bold uppercase tracking-wide mb-4 border-b pb-1" style={{ color: primaryColor, borderColor: '#e2e8f0' }}>Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {isEditing ? (
                                <textarea
                                    className="w-full text-sm p-2 border border-dashed border-gray-300 rounded"
                                    value={data.skills.join(', ')}
                                    onChange={(e) => onUpdate && onUpdate({ ...data, skills: e.target.value.split(',').map(s => s.trim()) })}
                                    rows={4}
                                />
                            ) : (
                                data.skills.map((skill, index) => (
                                    <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-md font-medium" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                                        {skill}
                                    </span>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
