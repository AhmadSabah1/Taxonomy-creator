// Modal.tsx

import React from 'react';
import { Category } from '@/app/models/Category';

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
}

const Modal: React.FC<ModalProps> = ({
                                         isVisible,
                                         onClose,
                                         category,
                                         description,
                                         newLiterature,
                                         handleLiteratureChange,
                                         attachLiterature,
                                         deleteCategory,
                                     }) => {
    if (!isVisible || !category) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
                <h3 className="text-lg font-semibold mb-4">
                    Category: {category.name}
                </h3>
                <p className="text-gray-700 mb-6">{description}</p>

                <div className="mb-4">
                    <h4 className="text-md font-semibold">Add New Reference</h4>
                    <div className="mb-2">
                        <label className="block mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={newLiterature.title}
                            onChange={handleLiteratureChange}
                            className="border p-2 rounded w-full"
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1">Author</label>
                        <input
                            type="text"
                            name="author"
                            value={newLiterature.author}
                            onChange={handleLiteratureChange}
                            className="border p-2 rounded w-full"
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1">Publication Date</label>
                        <input
                            type="date"
                            name="date"
                            value={newLiterature.date}
                            onChange={handleLiteratureChange}
                            className="border p-2 rounded w-full"
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1">URL</label>
                        <input
                            type="url"
                            name="url"
                            value={newLiterature.url}
                            onChange={handleLiteratureChange}
                            className="border p-2 rounded w-full"
                            required
                        />
                    </div>
                    <button
                        onClick={attachLiterature}
                        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                    >
                        Add Reference
                    </button>
                </div>

                {category.literature && category.literature.length > 0 ? (
                    <div className="mt-4">
                        <h4 className="text-md font-semibold">References</h4>
                        <table className="w-full text-left table-auto border-collapse border border-gray-300">
                            <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-300 px-4 py-2">Title</th>
                                <th className="border border-gray-300 px-4 py-2">Author</th>
                                <th className="border border-gray-300 px-4 py-2">Date</th>
                                <th className="border border-gray-300 px-4 py-2">URL</th>
                            </tr>
                            </thead>
                            <tbody>
                            {category.literature.map((lit, idx) => (
                                <tr key={idx}>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {lit.title}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {lit.author || 'N/A'}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {lit.date || 'N/A'}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <a
                                            href={lit.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500"
                                        >
                                            Link
                                        </a>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>No references added yet.</p>
                )}

                <div className="flex justify-end mt-4">
                    <button
                        onClick={deleteCategory}
                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded mr-2"
                    >
                        Delete Category
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
