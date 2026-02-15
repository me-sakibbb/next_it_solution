import React from 'react';
import { CVData, DesignSettings, DEFAULT_DESIGN_SETTINGS } from '../types';
import { Editable } from '../components/Editable';

interface TemplateProps {
    data: CVData;
    isEditing?: boolean;
    onUpdate?: (updatedData: CVData) => void;
    designSettings?: DesignSettings;
}

export const MinimalistTemplate: React.FC<TemplateProps> = ({ data, isEditing = false, onUpdate, designSettings = DEFAULT_DESIGN_SETTINGS }) => {
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
            className="w-[210mm] min-h-[297mm] bg-white p-12 font-sans"
            style={{
                fontSize: `${fontSize}rem`,
                lineHeight: lineHeight,
                color: fontColor
            }}
        >
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <header className="mb-12 border-b pb-8">
                    {data.personalInfo.photo && (
                        <div className="w-24 h-24 rounded-full overflow-hidden mb-6 filter grayscale">
                            <img src={data.personalInfo.photo} alt={data.personalInfo.fullName} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <h1 className="text-4xl font-light tracking-tight text-slate-900 mb-4">
                        <Editable
                            value={data.personalInfo.fullName}
                            isEditing={isEditing}
                            onChange={(val) => handleUpdate('personalInfo.fullName', val)}
                        />
                    </h1>
                    <div className="text-sm text-slate-500 space-y-1">
                        <div className="flex gap-4">
                            <Editable
                                value={data.personalInfo.email}
                                isEditing={isEditing}
                                onChange={(val) => handleUpdate('personalInfo.email', val)}
                            />
                            <Editable
                                value={data.personalInfo.phone}
                                isEditing={isEditing}
                                onChange={(val) => handleUpdate('personalInfo.phone', val)}
                            />
                        </div>
                        <div className="flex gap-4">
                            {(data.personalInfo.location || isEditing) && (
                                <Editable
                                    value={data.personalInfo.location || ''}
                                    isEditing={isEditing}
                                    placeholder="Location"
                                    onChange={(val) => handleUpdate('personalInfo.location', val)}
                                />
                            )}
                            {(data.personalInfo.linkedin || isEditing) && (
                                <>
                                    {isEditing ? (
                                        <Editable
                                            value={data.personalInfo.linkedin || ''}
                                            isEditing={isEditing}
                                            placeholder="LinkedIn URL"
                                            onChange={(val) => handleUpdate('personalInfo.linkedin', val)}
                                        />
                                    ) : (
                                        <a href={data.personalInfo.linkedin} className="hover:underline">LinkedIn</a>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Summary */}
                <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Profile</h2>
                    <div className="text-slate-700 leading-relaxed">
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
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">Experience</h2>
                    <div className="space-y-10">
                        {data.experience.map((exp, index) => (
                            <div key={index} style={{ marginBottom: `${itemSpacing}rem` }}>
                                <div className="flex justify-between items-baseline mb-2">
                                    <h3 className="font-medium text-slate-900 text-lg">
                                        <Editable
                                            value={exp.company}
                                            isEditing={isEditing}
                                            onChange={(val) => handleArrayUpdate('experience', index, 'company', val)}
                                        />
                                    </h3>
                                    <span className="text-sm text-slate-400 font-mono">
                                        <Editable
                                            value={exp.startDate}
                                            isEditing={isEditing}
                                            onChange={(val) => handleArrayUpdate('experience', index, 'startDate', val)}
                                            className="w-20 inline-block text-right"
                                        />
                                        {' / '}
                                        <Editable
                                            value={exp.endDate}
                                            isEditing={isEditing}
                                            onChange={(val) => handleArrayUpdate('experience', index, 'endDate', val)}
                                            className="w-20 inline-block"
                                        />
                                    </span>
                                </div>
                                <div className="text-slate-500 mb-3 italic">
                                    <Editable
                                        value={exp.position}
                                        isEditing={isEditing}
                                        onChange={(val) => handleArrayUpdate('experience', index, 'position', val)}
                                    />
                                </div>
                                <div className="text-slate-600 pl-4 border-l border-slate-200">
                                    {Array.isArray(exp.description) ? (
                                        <ul className="space-y-2">
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
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Education</h2>
                    <div className="space-y-6">
                        {data.education.map((edu, index) => (
                            <div key={index} className="grid grid-cols-[1fr,auto] gap-4" style={{ marginBottom: `${itemSpacing}rem` }}>
                                <div>
                                    <h3 className="font-medium text-slate-900">
                                        <Editable
                                            value={edu.institution}
                                            isEditing={isEditing}
                                            onChange={(val) => handleArrayUpdate('education', index, 'institution', val)}
                                        />
                                    </h3>
                                    <div className="text-slate-500">
                                        <Editable
                                            value={edu.degree}
                                            isEditing={isEditing}
                                            onChange={(val) => handleArrayUpdate('education', index, 'degree', val)}
                                        />
                                    </div>
                                </div>
                                <div className="text-sm text-slate-400 font-mono text-right">
                                    <Editable
                                        value={edu.startDate}
                                        isEditing={isEditing}
                                        onChange={(val) => handleArrayUpdate('education', index, 'startDate', val)}
                                        className="w-16 inline-block text-right"
                                    />
                                    {' / '}
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
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Skills</h2>
                    <div className="flex flex-wrap gap-2">
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
                                <span key={index} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                                    {skill}
                                </span>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};
