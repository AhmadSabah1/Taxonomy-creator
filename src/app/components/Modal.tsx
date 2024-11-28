import React, {useState, useEffect} from 'react';
import Select from 'react-select';
import {Category} from '@/app/models/Category';
import {SketchPicker} from "react-color";

interface Literature {
    title: string;
    author?: string;
    date?: string;
    url: string;
}

interface ModalProps {
    isVisible: boolean;
    onClose: () => void;
    category: Category | null;
    description: string;
    newLiterature: Literature;
    handleLiteratureChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    attachLiterature: () => void;
    deleteCategory: () => void;
    categories: Category[];
    updateCategory: (updatedCategory: Category) => void;
    attachLiteratureFromList: (literature: Literature) => void;
    deleteLiterature: (literature: Literature) => void;
    updateCategoryColor: (color: string) => void;
}

const Modal: React.FC<ModalProps> = ({
                                         updateCategoryColor,
                                         isVisible,
                                         onClose,
                                         category,
                                         description,
                                         newLiterature,
                                         handleLiteratureChange,
                                         attachLiterature,
                                         deleteCategory,
                                         categories,
                                         attachLiteratureFromList,
                                         deleteLiterature
                                     }) => {
    const [uniqueLiterature, setUniqueLiterature] = useState<Literature[]>([]);
    const [selectedLiterature, setSelectedLiterature] = useState<Literature | null>(null);
    const [color, setColor] = useState<string>(category?.color || '#ff6347');
    const handleColorChange = (colorResult: any) => {
        const selectedColor = colorResult.hex;
        setColor(selectedColor);
        updateCategoryColor(selectedColor); // Trigger color update
    };

    useEffect(() => {
        const findUniqueLiterature = (categories: Category[]): Literature[] => {
            const allLiterature: Literature[] = [];

            const traverseCategories = (categoryList: Category[]) => {
                for (const category of categoryList) {
                    if (category.literature) {
                        allLiterature.push(...category.literature);
                    }
                    if (category.children) {
                        traverseCategories(category.children);
                    }
                }
            };

            traverseCategories(categories);

            const uniqueLiterature = Array.from(
                new Map(allLiterature.map((lit) => [`${lit.title}-${lit.url}`, lit])).values()
            );

            return uniqueLiterature;
        };

        if (categories) {
            const literature = findUniqueLiterature(categories);
            setUniqueLiterature(literature);
        }
    }, [categories]);

    const attachSelectedLiterature = () => {
        if (selectedLiterature) {
            attachLiteratureFromList(selectedLiterature);
            setSelectedLiterature(null);
        }
    };

    const onDeleteLiterature = (index: number) => {
        if (category && category.literature && category.literature.length > 0) {
            deleteLiterature(category.literature[index])
        }
    };

    const options = uniqueLiterature.map((lit) => ({
        value: lit.title,
        label: lit.title,
    }));

    if (!isVisible || !category) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div
                className="bg-white flex rounded-lg w-11/12 h-[90vh] shadow-lg overflow-hidden"
                style={{maxHeight: '90vh'}}
            >
                {/* Left Side */}
                <div className="w-1/2 p-6 overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-4">Category: {category.name}</h3>
                    <p className="text-gray-700 mb-6">{description}</p>
                    <div className="mb-4">
                        <h4 className="text-md font-semibold">Set Category Color</h4>
                        <SketchPicker
                            color={color}
                            onChangeComplete={handleColorChange}
                        />
                    </div>
                    {/* Add New Literature Section */}
                    <div className="mb-4">
                        <h4 className="text-md font-semibold">Add New Reference</h4>
                        <input
                            type="text"
                            name="title"
                            value={newLiterature.title}
                            onChange={handleLiteratureChange}
                            className="border p-2 rounded w-full mb-2"
                            placeholder="Title"
                            required
                        />
                        <input
                            type="text"
                            name="author"
                            value={newLiterature.author}
                            onChange={handleLiteratureChange}
                            className="border p-2 rounded w-full mb-2"
                            placeholder="Author"
                        />
                        <input
                            type="date"
                            name="date"
                            value={newLiterature.date}
                            onChange={handleLiteratureChange}
                            className="border p-2 rounded w-full mb-2"
                            placeholder="Date"
                        />
                        <input
                            type="url"
                            name="url"
                            value={newLiterature.url}
                            onChange={handleLiteratureChange}
                            className="border p-2 rounded w-full mb-2"
                            placeholder="URL"
                            required
                        />
                        <button
                            onClick={attachLiterature}
                            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
                        >
                            Add Reference
                        </button>
                    </div>

                    {/* Attach Existing Literature Section */}
                    <div className="mb-4">
                        <h4 className="text-md font-semibold">Attach Existing Literature</h4>
                        <Select
                            options={options}
                            onChange={(selected) => {
                                const lit = uniqueLiterature.find(
                                    (lit) => lit.title === selected?.value
                                );
                                setSelectedLiterature(lit || null);
                            }}
                            isClearable
                            placeholder="Search and select..."
                        />
                        <button
                            onClick={attachSelectedLiterature}
                            className="bg-green-500 text-white px-4 py-2 rounded w-full mt-2"
                            disabled={!selectedLiterature}
                        >
                            Attach Selected Reference
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
                    <h4 className="text-md font-semibold mb-4">Existing References</h4>
                    {category.literature && category.literature.length > 0 ? (
                        <table className="table-auto w-full border-collapse border border-gray-300">
                            <thead>
                            <tr>
                                <th className="border px-4 py-2">Title</th>
                                <th className="border px-4 py-2">Author</th>
                                <th className="border px-4 py-2">Date</th>
                                <th className="border px-4 py-2">URL</th>
                                <th className="border px-4 py-2">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {category.literature.map((lit, idx) => (
                                <tr key={idx}>
                                    <td className="border px-4 py-2">{lit.title}</td>
                                    <td className="border px-4 py-2">{lit.author || 'N/A'}</td>
                                    <td className="border px-4 py-2">{lit.date || 'N/A'}</td>
                                    <td className="border px-4 py-2">
                                        <a
                                            href={lit.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500"
                                        >
                                            View
                                        </a>
                                    </td>
                                    <td className="border px-4 py-2 text-center">
                                        <button
                                            onClick={() => onDeleteLiterature(idx)}
                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No references added yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
