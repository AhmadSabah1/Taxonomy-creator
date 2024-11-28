import React, { useState, useEffect } from 'react';

interface CategoryFormProps {
    onSubmit: (data: CategoryData) => void;
    categories: CategoryData[];
    parentCategoryId?: string | null; // Optional parent category ID
}

interface CategoryData {
    name: string;
    description?: string;
    id?: string;
    parentCategoryId?: string;
    relationships?: string[];
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onSubmit, categories, parentCategoryId }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [id, setId] = useState('');
    const [parent, setParent] = useState<string | undefined>(parentCategoryId || undefined);

    useEffect(() => {
        // Update parent category whenever a new parent is clicked
        setParent(parentCategoryId || undefined);
    }, [parentCategoryId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const categoryData: CategoryData = {
            name,
            description,
            id: id || undefined,
            parentCategoryId: parent || undefined,
        };

        onSubmit(categoryData);  // Submit form data to the parent component
        setName('');  // Clear the form after submission
        setDescription('');
        setId('');
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
