// CategoryPage.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import CategoryForm from '@/app/components/CategoryForm';
import TreeView from '@/app/components/TreeView';
import { Category } from '@/app/models/Category';
import debounce from 'lodash/debounce';
import {getCategories, saveCategories} from "@/utils/firebaseUtils";

// Helper function to recursively add a category to the correct parent
const addCategoryToParent = (categories: Category[], newCategory: Category): Category[] => {
    return categories.map((category) => {
        if (category.id === newCategory.parentCategoryId) {
            return {
                ...category,
                children: [...(category.children || []), newCategory],
            };
        } else if (category.children && category.children.length > 0) {
            return {
                ...category,
                children: addCategoryToParent(category.children, newCategory),
            };
        }
        return category;
    });
};

const CategoryPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

    // Load categories from Firebase when the component mounts
    useEffect(() => {
        const fetchCategories = async () => {
            const fetchedCategories = await getCategories();
            setCategories(fetchedCategories);
        };

        fetchCategories();
    }, []);

    // Debounced save function to prevent excessive writes
    const debouncedSaveCategories = useCallback(
        debounce((categoriesToSave: Category[]) => {
            saveCategories(categoriesToSave);
        }, 1000),
        []
    );

    // Save categories to Firebase whenever they change
    useEffect(() => {
        if (categories.length > 0) {
            debouncedSaveCategories(categories);
        }
    }, [categories, debouncedSaveCategories]);

    // Function to handle category submission from the form
    const handleCategorySubmit = (newCategory: Category) => {
        const category: Category = {
            ...newCategory,
            id: newCategory.id || Math.random().toString(36).substr(2, 9),
            children: [],
        };

        if (category.parentCategoryId) {
            setCategories((prevCategories) => addCategoryToParent(prevCategories, category));
        } else {
            setCategories((prevCategories) => [...prevCategories, category]);
        }

        setSelectedParentId(null);
    };

    // Function to handle clicking on a category in the tree
    const handleCategoryClick = (id: string) => {
        setSelectedParentId(id);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center space-y-8">
            <CategoryForm
                onSubmit={handleCategorySubmit}
                categories={categories}
                parentCategoryId={selectedParentId}
            />
            <TreeView
                categories={categories}
                onCategoryClick={handleCategoryClick}
                setCategories={setCategories}
            />
        </div>
    );
};

export default CategoryPage;
