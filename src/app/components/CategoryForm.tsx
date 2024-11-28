import React, { useState, useEffect } from 'react';
import { Category } from '@/app/models/Category';

interface CategoryFormProps {
    onSubmit: (category: Category) => void;
    categories: Category[];
    parentCategoryId?: string | null; // Optional parent category ID
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onSubmit, categories, parentCategoryId }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [parent, setParent] = useState<string | undefined>(parentCategoryId || undefined);

    useEffect(() => {
        setParent(parentCategoryId || undefined);
    }, [parentCategoryId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newCategory: Category = {
            id: Math.random().toString(36).substr(2, 9), // Generate unique ID
            name,
            description,
            parentCategoryId: parent || null,
            children: [],
            color: '#ffffff', // Default color
            literature: [],
        };

        onSubmit(newCategory); // Submit the new Category object
        setName('');
        setDescription('');
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6 space-y-4"
        >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Create a New Category or Subcategory</h2>

            <div className="space-y-1">
                <label htmlFor="name" className="block text-gray-700 font-medium">Name*</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                />
            </div>

            <div className="space-y-1">
                <label htmlFor="description" className="block text-gray-700 font-medium">Description</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
            </div>

            {parent && (
                <div className="text-gray-600">
                    <p>Parent Category: {categories.find(cat => cat.id === parent)?.name}</p>
                </div>
            )}

            <button
                type="submit"
                className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition ease-in-out duration-150"
            >
                Create Category
            </button>
        </form>
    );
};

export default CategoryForm;
