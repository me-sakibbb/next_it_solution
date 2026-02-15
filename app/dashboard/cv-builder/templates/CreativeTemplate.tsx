import React from 'react';
import { CVData, DesignSettings, DEFAULT_DESIGN_SETTINGS } from '../types';
import { Editable } from '../components/Editable';

interface TemplateProps {
    data: CVData;
    isEditing?: boolean;
    onUpdate?: (updatedData: CVData) => void;
    designSettings?: DesignSettings;
}

export const CreativeTemplate: React.FC<TemplateProps> = ({ data, isEditing = false, onUpdate, designSettings = DEFAULT_DESIGN_SETTINGS }) => {
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
            className="w-[210mm] min-h-[297mm] flex bg-white font-sans"
            style={{
                fontSize: `${fontSize}rem`,
                lineHeight: lineHeight,
                color: fontColor
            }}
        >
            {/* Sidebar */}
            <aside className="w-[30%] bg-slate-900 text-white p-8 flex flex-col">
                <div className="mb-12">
                    {/* Avatar/Photo */}
                    {data.personalInfo.photo ? (
                        <div
                            className="w-32 h-32 rounded-full overflow-hidden border-4 shadow-lg mb-6 mx-auto"
                            style={{ borderColor: primaryColor }}
                        >
                            <img src={data.personalInfo.photo} alt={data.personalInfo.fullName} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold mb-6 mx-auto"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {data.personalInfo.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-center leading-tight mb-6">
                        <Editable
                            value={data.personalInfo.fullName}
                            isEditing={isEditing}
                            onChange={(val) => handleUpdate('personalInfo.fullName', val)}
                        />
                    </h1>

                    <div className="space-y-4 text-sm text-slate-300">
                        <div className="flex flex-col">
                            <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">Email</span>
                            <Editable
                                value={data.personalInfo.email}
                                isEditing={isEditing}
                                onChange={(val) => handleUpdate('personalInfo.email', val)}
                                className="text-white bg-transparent"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">Phone</span>
                            <Editable
                                value={data.personalInfo.phone}
                                isEditing={isEditing}
                                onChange={(val) => handleUpdate('personalInfo.phone', val)}
                                className="text-white bg-transparent"
                            />
                        </div>
                        {(data.personalInfo.linkedin || isEditing) && (
                            <div className="flex flex-col">
                                <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">Social</span>
                                {isEditing ? (
                                    <Editable
                                        value={data.personalInfo.linkedin || ''}
                                        isEditing={isEditing}
                                        placeholder="LinkedIn URL"
                                        onChange={(val) => handleUpdate('personalInfo.linkedin', val)}
                                        className="text-white bg-transparent"
                                    />
                                ) : (
                                    <a href={data.personalInfo.linkedin} className="hover:text-rose-400" style={{ color: 'inherit' }}>LinkedIn</a>
                                )}
                            </div>
                        )}
                        {(data.personalInfo.location || isEditing) && (
                            <div className="flex flex-col">
                                <span className="text-slate-500 text-xs uppercase tracking-wider mb-1">Location</span>
                                <Editable
                                    value={data.personalInfo.location || ''}
                                    isEditing={isEditing}
                                    placeholder="Location"
                                    onChange={(val) => handleUpdate('personalInfo.location', val)}
                                    className="text-white bg-transparent"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-12">
                    <h2 className="text-lg font-bold uppercase tracking-widest mb-6" style={{ color: primaryColor }}>Skills</h2>
                    <div className="space-y-3">
                        {isEditing ? (
                            <textarea
                                className="w-full text-sm p-2 bg-slate-800 text-white border border-slate-700 rounded"
                                value={data.skills.join(', ')}
                                onChange={(e) => onUpdate && onUpdate({ ...data, skills: e.target.value.split(',').map(s => s.trim()) })}
                                rows={6}
                                placeholder="Skill 1, Skill 2..."
                            />
                        ) : (
                            data.skills.map((skill, index) => (
                                <div key={index} className="bg-slate-800 px-3 py-2 rounded text-sm">
                                    {skill}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {(data.languages && data.languages.length > 0 || isEditing) && (
                    <div>
                        <h2 className="text-lg font-bold uppercase tracking-widest mb-6" style={{ color: primaryColor }}>Languages</h2>
                        {isEditing ? (
                            <textarea
                                className="w-full text-sm p-2 bg-slate-800 text-white border border-slate-700 rounded"
                                value={data.languages?.join(', ')}
                                onChange={(e) => onUpdate && onUpdate({ ...data, languages: e.target.value.split(',').map(s => s.trim()) })}
                                rows={3}
                                placeholder="English, Spanish, etc..."
                            />
                        ) : (
                            <ul className="space-y-2 text-sm text-slate-300">
                                {data.languages?.map((lang, index) => (
                                    <li key={index}>{lang}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-12 bg-slate-50">
                <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                    <h2 className="text-3xl font-bold text-slate-800 mb-6" style={{ color: '#1e293b' }}>About Me</h2>
                    <Editable
                        value={data.personalInfo.summary}
                        isEditing={isEditing}
                        multiline
                        onChange={(val) => handleUpdate('personalInfo.summary', val)}
                        className="text-slate-600 leading-relaxed block w-full"
                    />
                </section>

                <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                    <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center" style={{ color: '#1e293b' }}>
                        <span className="w-2 h-8 mr-4 rounded-sm" style={{ backgroundColor: primaryColor }}></span>
                        Experience
                    </h2>
                    <div className="space-y-8 relative border-l-2 border-slate-200 ml-3 pl-8">
                        {data.experience.map((exp, index) => (
                            <div key={index} className="relative" style={{ marginBottom: `${itemSpacing}rem` }}>
                                <div
                                    className="absolute -left-[39px] top-1.5 w-5 h-5 rounded-full bg-white border-4"
                                    style={{ borderColor: primaryColor }}
                                ></div>
                                <div className="flex justify-between items-baseline mb-2">
                                    <h3 className="text-xl font-bold text-slate-800" style={{ color: '#1e293b' }}>
                                        <Editable
                                            value={exp.position}
                                            isEditing={isEditing}
                                            onChange={(val) => handleArrayUpdate('experience', index, 'position', val)}
                                        />
                                    </h3>
                                    <span
                                        className="text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap"
                                        style={{ color: primaryColor, backgroundColor: `${primaryColor}10` }}
                                    >
                                        <Editable
                                            value={exp.startDate}
                                            isEditing={isEditing}
                                            onChange={(val) => handleArrayUpdate('experience', index, 'startDate', val)}
                                            className="w-16 inline-block bg-transparent"
                                        />
                                        {' - '}
                                        <Editable
                                            value={exp.endDate}
                                            isEditing={isEditing}
                                            onChange={(val) => handleArrayUpdate('experience', index, 'endDate', val)}
                                            className="w-16 inline-block bg-transparent"
                                        />
                                    </span>
                                </div>
                                <div className="text-slate-500 font-medium mb-3">
                                    <Editable
                                        value={exp.company}
                                        isEditing={isEditing}
                                        onChange={(val) => handleArrayUpdate('experience', index, 'company', val)}
                                    />
                                </div>
                                <div className="text-slate-600">
                                    {Array.isArray(exp.description) ? (
                                        <ul className="space-y-2 text-sm">
                                            {exp.description.map((desc, i) => (
                                                <li key={i}>
                                                    • <Editable
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
                                            className="text-sm leading-relaxed whitespace-pre-wrap block w-full"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section style={{ marginBottom: `${sectionSpacing}rem` }}>
                    <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center" style={{ color: '#1e293b' }}>
                        <span className="w-2 h-8 mr-4 rounded-sm" style={{ backgroundColor: primaryColor }}></span>
                        Education
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                        {data.education.map((edu, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-slate-100" style={{ marginBottom: `${itemSpacing}rem` }}>
                                <h3 className="font-bold text-slate-800 mb-1" style={{ color: '#1e293b' }}>
                                    <Editable
                                        value={edu.degree}
                                        isEditing={isEditing}
                                        onChange={(val) => handleArrayUpdate('education', index, 'degree', val)}
                                    />
                                </h3>
                                <div className="text-sm font-medium mb-2" style={{ color: primaryColor }}>
                                    <Editable
                                        value={edu.institution}
                                        isEditing={isEditing}
                                        onChange={(val) => handleArrayUpdate('education', index, 'institution', val)}
                                    />
                                </div>
                                <div className="text-xs text-slate-400">
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
            </main>
        </div>
    );
};
