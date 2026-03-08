import React from 'react';
import { CVData, DesignSettings, DEFAULT_DESIGN_SETTINGS } from '../types';
import { Editable } from '../components/Editable';

interface TemplateProps {
    data: CVData;
    isEditing?: boolean;
    onUpdate?: (updatedData: CVData) => void;
    designSettings?: DesignSettings;
}

export const MaritalTemplate: React.FC<TemplateProps> = ({ data, isEditing = false, onUpdate, designSettings = DEFAULT_DESIGN_SETTINGS }) => {
    const { fontSize, lineHeight, fontColor } = designSettings;

    // Default empty marital info if not present
    const maritalInfo = data.maritalInfo || {};

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

    const handleArrayUpdate = (section: 'experience' | 'education', index: number, field: string, value: any) => {
        if (!onUpdate) return;
        const updatedData = { ...data };
        // @ts-ignore
        const newArray = [...updatedData[section]];
        newArray[index] = { ...newArray[index], [field]: value };
        // @ts-ignore
        updatedData[section] = newArray;
        onUpdate(updatedData);
    };

    const SectionTitle = ({ title }: { title: string }) => (
        <h2 className="text-xl font-bold mb-4 mt-8 bg-slate-100 p-2 rounded shrink-0">{title}</h2>
    );

    const TableRow = ({ label, valuePath, value, placeholder }: { label: string, valuePath: string, value: string, placeholder?: string }) => (
        <tr className="border-b last:border-b-0">
            <td className="py-2 pr-4 font-semibold w-1/3 align-top">{label}:</td>
            <td className="py-2 align-top">
                <Editable
                    value={value || ''}
                    isEditing={isEditing}
                    placeholder={placeholder || `Enter ${label}`}
                    onChange={(val) => handleUpdate(valuePath, val)}
                    multiline={valuePath === 'personalInfo.summary'}
                />
            </td>
        </tr>
    );

    return (
        <div
            className="w-[210mm] min-h-[297mm] bg-white p-10 shadow-lg font-sans mx-auto"
            style={{
                fontSize: `${fontSize}rem`,
                lineHeight: lineHeight,
                color: fontColor
            }}
        >
            <div className="text-center mb-8 border-b pb-4">
                <h1 className="text-3xl font-bold uppercase tracking-wider">MARRIAGE BIODATA</h1>
            </div>

            {/* About Me & Photo */}
            <div className="flex gap-8 mb-8 items-start">
                <div className="flex-1">
                    <SectionTitle title="About Me" />
                    <Editable
                        value={data.personalInfo.summary}
                        isEditing={isEditing}
                        multiline
                        placeholder="A responsible, educated and family-oriented individual..."
                        onChange={(val) => handleUpdate('personalInfo.summary', val)}
                        className="block w-full bg-slate-50 p-4 rounded border-l-4 border-slate-300"
                    />
                </div>
                {data.personalInfo.photo && (
                    <div className="w-40 h-40 shrink-0 mt-8 rounded overflow-hidden border-2 border-slate-200">
                        <img src={data.personalInfo.photo} alt={data.personalInfo.fullName} className="w-full h-full object-cover" />
                    </div>
                )}
            </div>

            {/* Personal Information */}
            <div>
                <SectionTitle title="Personal Information" />
                <table className="w-full text-left border-collapse">
                    <tbody>
                        <TableRow label="Full Name" valuePath="personalInfo.fullName" value={data.personalInfo.fullName} />
                        <TableRow label="Date of Birth" valuePath="maritalInfo.dateOfBirth" value={maritalInfo.dateOfBirth || ''} placeholder="DD Month YYYY" />
                        <TableRow label="Age" valuePath="maritalInfo.age" value={maritalInfo.age || ''} placeholder="e.g. 26 Years" />
                        <TableRow label="Height" valuePath="maritalInfo.height" value={maritalInfo.height || ''} placeholder="e.g. 5 Feet 8 Inches" />
                        <TableRow label="Religion" valuePath="maritalInfo.religion" value={maritalInfo.religion || ''} placeholder="Islam" />
                        <TableRow label="Nationality" valuePath="maritalInfo.nationality" value={maritalInfo.nationality || ''} placeholder="Bangladeshi" />
                        <TableRow label="Marital Status" valuePath="maritalInfo.maritalStatus" value={maritalInfo.maritalStatus || ''} placeholder="Unmarried" />
                        <TableRow label="Blood Group" valuePath="maritalInfo.bloodGroup" value={maritalInfo.bloodGroup || ''} placeholder="e.g. O+" />
                    </tbody>
                </table>
            </div>

            {/* Educational Qualification */}
            <div>
                <SectionTitle title="Educational Qualification" />
                <table className="w-full text-left border-collapse">
                    <tbody>
                        {data.education.map((edu, index) => (
                            <React.Fragment key={index}>
                                <tr className="border-b">
                                    <td className="py-2 pr-4 font-semibold w-1/3 align-top">
                                        <Editable
                                            value={edu.degree || ''}
                                            isEditing={isEditing}
                                            placeholder="Degree Name (e.g. BSc in CS)"
                                            onChange={(val) => handleArrayUpdate('education', index, 'degree', val)}
                                        />:
                                    </td>
                                    <td className="py-2 align-top">
                                        <Editable
                                            value={edu.institution || ''}
                                            isEditing={isEditing}
                                            placeholder="Institution Name"
                                            onChange={(val) => handleArrayUpdate('education', index, 'institution', val)}
                                        /> ({edu.endDate})
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                        {data.education.length === 0 && (
                            <tr>
                                <td colSpan={2} className="py-2 text-slate-400 italic">No education added. Editing available in other templates.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Professional Information */}
            <div>
                <SectionTitle title="Professional Information" />
                <table className="w-full text-left border-collapse">
                    <tbody>
                        {data.experience.length > 0 ? (
                            <>
                                <tr className="border-b">
                                    <td className="py-2 pr-4 font-semibold w-1/3 align-top">Current Occupation:</td>
                                    <td className="py-2 align-top">
                                        <Editable
                                            value={data.experience[0].position || ''}
                                            isEditing={isEditing}
                                            placeholder="Job Title"
                                            onChange={(val) => handleArrayUpdate('experience', 0, 'position', val)}
                                        />
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-2 pr-4 font-semibold w-1/3 align-top">Company:</td>
                                    <td className="py-2 align-top">
                                        <Editable
                                            value={data.experience[0].company || ''}
                                            isEditing={isEditing}
                                            placeholder="Company Name"
                                            onChange={(val) => handleArrayUpdate('experience', 0, 'company', val)}
                                        />
                                    </td>
                                </tr>
                            </>
                        ) : (
                            <tr>
                                <td colSpan={2} className="py-2 text-slate-400 italic">No professional info added. Editing available in other templates.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Family Information */}
            <div>
                <SectionTitle title="Family Information" />
                <table className="w-full text-left border-collapse">
                    <tbody>
                        <TableRow label="Father's Name" valuePath="maritalInfo.fatherName" value={maritalInfo.fatherName || ''} placeholder="Father's Full Name" />
                        <TableRow label="Father's Occupation" valuePath="maritalInfo.fatherOccupation" value={maritalInfo.fatherOccupation || ''} placeholder="Father's Occupation" />
                        <TableRow label="Mother's Name" valuePath="maritalInfo.motherName" value={maritalInfo.motherName || ''} placeholder="Mother's Full Name" />
                        <TableRow label="Mother's Occupation" valuePath="maritalInfo.motherOccupation" value={maritalInfo.motherOccupation || ''} placeholder="Mother's Occupation" />
                        <TableRow label="Siblings" valuePath="maritalInfo.siblings" value={maritalInfo.siblings || ''} placeholder="e.g. 1 Brother, 1 Sister" />
                    </tbody>
                </table>
            </div>

            {/* Address Information */}
            <div>
                <SectionTitle title="Address Information" />
                <table className="w-full text-left border-collapse">
                    <tbody>
                        <TableRow label="Present Address" valuePath="personalInfo.location" value={data.personalInfo.location || ''} placeholder="Current living address" />
                        <TableRow label="Permanent Address" valuePath="maritalInfo.permanentAddress" value={maritalInfo.permanentAddress || ''} placeholder="Permanent home address" />
                    </tbody>
                </table>
            </div>

            {/* Interests */}
            <div>
                <SectionTitle title="Interests" />
                <table className="w-full text-left border-collapse">
                    <tbody>
                        <tr className="border-b last:border-b-0">
                            <td className="py-2 pr-4 font-semibold w-1/3 align-top">Hobbies:</td>
                            <td className="py-2 align-top">
                                {isEditing ? (
                                    <textarea
                                        className="w-full bg-blue-50/50 border border-dashed border-blue-300 rounded px-1 -mx-1"
                                        value={data.skills.join(', ')}
                                        onChange={(e) => onUpdate && onUpdate({ ...data, skills: e.target.value.split(',').map(s => s.trim()) })}
                                        placeholder="Reading, Traveling, Gardening..."
                                        rows={2}
                                    />
                                ) : (
                                    <span>{data.skills.join(', ')}</span>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Contact Information */}
            <div>
                <SectionTitle title="Contact Information" />
                <table className="w-full text-left border-collapse">
                    <tbody>
                        <TableRow label="Guardian Name" valuePath="maritalInfo.guardianName" value={maritalInfo.guardianName || ''} placeholder="Name of Guardian" />
                        <TableRow label="Relationship" valuePath="maritalInfo.guardianRelationship" value={maritalInfo.guardianRelationship || ''} placeholder="e.g. Father, Elder Brother" />
                        <TableRow label="Mobile Number" valuePath="personalInfo.phone" value={data.personalInfo.phone || ''} placeholder="Phone Number" />
                    </tbody>
                </table>
            </div>
        </div>
    );
};
