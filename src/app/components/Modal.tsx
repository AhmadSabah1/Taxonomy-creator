// components/Modal.tsx
'use client';

import React, { useState } from 'react';
import Select from 'react-select';
import { Category } from '@/app/models/Category';
import { Literature } from '@/app/models/Literature';
import { SketchPicker } from 'react-color';

interface ModalProps {
    isVisible: boolean;
    onClose: () => void;
    category: Category | null;
    description: string;
    attachLiteratureToCategory: (literatureId: string) => void;
    deleteCategory: () => void;
    categories: Category[];
    updateCategoryColor: (color: string) => void;
    detachLiteratureFromCategory: (literatureId: string) => void;
    literatureList: Literature[];
}

const Modal: React.FC<ModalProps> = ({
                                         isVisible,
                                         onClose,
                                         category,
                                         description,
                                         attachLiteratureToCategory,
                                         deleteCategory,
                                         updateCategoryColor,
                                         detachLiteratureFromCategory,
                                         literatureList,
                                     }) => {
    const [selectedLiteratureId, setSelectedLiteratureId] = useState<string>('');
    const [color, setColor] = useState<string>(category?.color || '#ff6347');

    if (!isVisible || !category) {
        return null;
    }

    const handleAttachLiterature = () => {
        if (selectedLiteratureId) {
            attachLiteratureToCategory(selectedLiteratureId);
            setSelectedLiteratureId('');
        }
    };

    const handleColorChange = (colorResult: any) => {
        const selectedColor = colorResult.hex;
        setColor(selectedColor);
        updateCategoryColor(selectedColor);
    };

    // Options for the literature select dropdown
    const options = literatureList.map((lit) => ({
        value: lit.id,
        label: lit.title,
    }));

    // Get the literature items attached to this category
    const attachedLiterature = literatureList.filter((lit) =>
        category.literatureIds?.includes(lit.id)
    );

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div
                className="bg-white flex rounded-lg w-11/12 h-[90vh] shadow-lg overflow-hidden"
                style={{ maxHeight: '90vh' }}
            >
                {/* Left Side */}
                <div className="w-1/2 p-6 overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-4">Category: {category.name}</h3>
                    <p className="text-gray-700 mb-6">{description}</p>

                    {/* Color Picker */}
                    <div className="mb-4">
                        <h4 className="text-md font-semibold">Set Category Color</h4>
                        <SketchPicker color={color} onChangeComplete={handleColorChange} />
                    </div>

                    {/* Attach Existing Literature Section */}
                    <div className="mb-4">
                        <h4 className="text-md font-semibold">Attach Existing Literature</h4>
                        <Select
                            options={options}
                            onChange={(selected) => {
                                setSelectedLiteratureId(selected?.value || '');
                            }}
                            isClearable
                            placeholder="Search and select..."
                        />
                        <button
                            onClick={handleAttachLiterature}
                            className="bg-green-500 text-white px-4 py-2 rounded w-full mt-2"
                            disabled={!selectedLiteratureId}
                        >
                            Attach Selected Literature
                        </button>
                    </div>

                    {/* Modal Actions */}
                    <div className="flex justify-between mt-4">
                        <button
                            onClick={deleteCategory}
                            className="bg-red-500 text-white px-4 py-2 rounded"
                        >
                            Delete Category
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Right Side */}
                <div className="w-1/2 bg-gray-100 p-6 overflow-y-auto">
                    <h4 className="text-md font-semibold mb-4">Attached Literature</h4>
                    {attachedLiterature.length > 0 ? (
                        <table className="min-w-full border text-sm">
                            <thead>
                            <tr>
                                <th className="px-2 py-1 border">Title</th>
                                <th className="px-2 py-1 border">Author</th>
                                <th className="px-2 py-1 border">Date</th>
                                <th className="px-2 py-1 border">URL</th>
                                <th className="px-2 py-1 border">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {attachedLiterature.map((lit) => (
                                <tr key={lit.id}>
                                    <td className="px-2 py-1 border">{lit.title}</td>
                                    <td className="px-2 py-1 border">{lit.author || 'N/A'}</td>
                                    <td className="px-2 py-1 border">{lit.date || 'N/A'}</td>
                                    <td className="px-2 py-1 border">
                                        <a
                                            href={lit.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500"
                                        >
                                            Link
                                        </a>
                                    </td>
                                    <td className="px-2 py-1 border">
                                        <button
                                            onClick={() => detachLiteratureFromCategory(lit.id)}
                                            className="text-red-500"
                                        >
                                            Detach
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No literature attached yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
