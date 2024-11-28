'use client';

import React, { useState } from 'react';
import Tree from 'react-d3-tree';
import Modal from './Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Category } from '@/app/models/Category';
import { Literature } from '@/app/models/Literature';
import {deleteDoc, doc, setDoc, updateDoc} from 'firebase/firestore';
import {db} from "../../../firebaseConfig";

interface TreeViewProps {
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    onCategoryClick: (id: string) => void;
}

const convertToTreeData = (categories: Category[]): any[] => {
    return categories.map((category) => ({
        name: category.name || 'Unnamed Category',
        attributes: {
            id: category.id || 'Unknown ID',
            description: category.description || 'No description',
        },
        color: category.color || '#ff6347', // Default color if not set
        children:
            category.children && category.children.length > 0
                ? convertToTreeData(category.children)
                : [],
    }));
};

const calculateCircleRadius = (text: string): number => {
    const baseRadius = 15;
    const padding = 5;
    return baseRadius + Math.min(text.length, 20) * 2 + padding;
};

const renderCustomNodeElement = ({
                                     nodeDatum,
                                     toggleNode,
                                     handleClick,
                                     handleInfoClick,
                                 }: {
    nodeDatum: any;
    toggleNode: () => void;
    handleClick: () => void;
    handleInfoClick: () => void;
}) => {
    const radius = calculateCircleRadius(nodeDatum.name);
    const isParent = nodeDatum.children && nodeDatum.children.length > 0;

    return (
        <g>
            <circle
                r={radius}
                fill={nodeDatum.color} // Use node's color
                stroke="black"
                strokeWidth="1"
                onClick={handleClick}
            />
            <text
                fill="white"
                strokeWidth="1"
                x="0"
                y="5"
                textAnchor="middle"
                fontSize="12"
                onClick={handleClick}
            >
                {nodeDatum.name}
            </text>
            <foreignObject
                x={radius + 10}
                y="-10"
                width="30"
                height="30"
                className="cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    handleInfoClick();
                }}
            >
                <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 w-4 h-4" />
            </foreignObject>
            {isParent && (
                <text
                    fill="black"
                    x={-(radius + 10)}
                    y="5"
                    fontSize="16"
                    className="cursor-pointer"
                    textAnchor="middle"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleNode();
                    }}
                >
                    {nodeDatum.__rd3t.collapsed ? '+' : '-'}
                </text>
            )}
        </g>
    );
};

const TreeView: React.FC<TreeViewProps> = ({
                                               categories,
                                               setCategories,
                                               onCategoryClick,
                                           }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalDescription, setModalDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [newLiterature, setNewLiterature] = useState<Literature>({
        title: '',
        author: '',
        date: '',
        url: '',
    });

    const handleNodeClick = (nodeData: any) => {
        const nodeId = nodeData.data.attributes.id;

        if (nodeId) {
            onCategoryClick(nodeId);
        } else {
            console.warn('Node clicked does not have a valid ID:', nodeData);
        }
    };

    const handleInfoClick = (nodeDatum: any) => {
        const nodeId = nodeDatum.attributes.id;

        const findCategoryById = (
            categories: Category[],
            id: string
        ): Category | undefined => {
            for (const category of categories) {
                if (category.id === id) {
                    return category;
                }
                if (category.children) {
                    const foundChild = findCategoryById(category.children, id);
                    if (foundChild) return foundChild;
                }
            }
            return undefined;
        };

        const category = findCategoryById(categories, nodeId);

        if (category) {
            setSelectedCategory(category);
            setModalDescription(category.description || 'No description');
            setModalVisible(true);
        } else {
            console.warn('Category not found for the selected node.');
        }
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    const updateCategoryInTree = (
        categories: Category[],
        updatedCategory: Category
    ): Category[] => {
        return categories.map((category) => {
            if (category.id === updatedCategory.id) {
                return updatedCategory; // Update the matched category
            } else if (category.children && category.children.length > 0) {
                return {
                    ...category,
                    children: updateCategoryInTree(category.children, updatedCategory),
                };
            }
            return category; // Return other categories as-is
        });
    };

    const updateCategory = async (updatedCategory: Category) => {
        const updatedCategories = updateCategoryInTree(categories, updatedCategory);
        setCategories(updatedCategories);

        try {
            const docRef = doc(db, 'categories', updatedCategory.id);
            await setDoc(docRef, updatedCategory);
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };
    const treeData = convertToTreeData(categories);

    if (!treeData || treeData.length === 0) {
        return <p>No categories to display</p>;
    }

    const removeCategoryFromTree = (
        categories: Category[],
        categoryIdToRemove: string
    ): Category[] => {
        return categories
            .filter((category) => category.id !== categoryIdToRemove)
            .map((category) => ({
                ...category,
                children: category.children
                    ? removeCategoryFromTree(category.children, categoryIdToRemove)
                    : [],
            }));
    };
    const deleteCategory = () => {
        if (selectedCategory) {
            const confirmDelete = window.confirm(
                `Are you sure you want to delete "${selectedCategory.name}"?`
            );

            if (confirmDelete) {
                const updatedCategories = removeCategoryFromTree(
                    categories,
                    selectedCategory.id
                );

                setCategories(updatedCategories);
                setModalVisible(false);

                // Optionally, delete the category from Firebase
                try {
                    const docRef = doc(db, 'categories', selectedCategory.id);
                    deleteDoc(docRef); // Import and use `deleteDoc` from Firebase
                } catch (error) {
                    console.error('Error deleting category from Firebase:', error);
                }
            }
        }
    };

    const attachLiterature = async () => {
        if (!selectedCategory) return;

        const updatedLiterature = [
            ...(selectedCategory.literature || []),
            newLiterature,
        ];

        const updatedCategory: Category = {
            ...selectedCategory,
            literature: updatedLiterature,
        };

        // Update the categories tree
        const updatedCategories = updateCategoryInTree(categories, updatedCategory);

        // Immediate state updates
        setCategories(updatedCategories);
        setSelectedCategory(updatedCategory);

        // Save to Firebase asynchronously (without blocking UI updates)
        try {
            const docRef = doc(db, 'categories', updatedCategory.id);
            await updateDoc(docRef, { literature: updatedLiterature });
        } catch (error) {
            console.error('Error updating literature in Firebase:', error);
        }

        // Reset the form
        setNewLiterature({ title: '', author: '', date: '', url: '' });
    };


    async function addSelectedLiterature(literature: Literature) {
        if (!selectedCategory) return;

        const updatedLiterature = [
            ...(selectedCategory.literature || []),
            literature,
        ];

        const updatedCategory: Category = {
            ...selectedCategory,
            literature: updatedLiterature,
        };

        // Update the categories tree
        const updatedCategories = updateCategoryInTree(categories, updatedCategory);

        // Immediate state updates
        setCategories(updatedCategories);
        setSelectedCategory(updatedCategory);

        // Save to Firebase asynchronously (without blocking UI updates)
        try {
            const docRef = doc(db, 'categories', updatedCategory.id);
            await updateDoc(docRef, { literature: updatedLiterature });
        } catch (error) {
            console.error('Error updating literature in Firebase:', error);
        }

        // Reset the form
        setNewLiterature({ title: '', author: '', date: '', url: '' });
    }

    const propagateColorToChildren = (
        categories: Category[],
        nodeId: string,
        newColor: string
    ): Category[] => {
        return categories.map((category) => {
            if (category.id === nodeId) {
                // Update the node and propagate the color to its children
                return {
                    ...category,
                    color: newColor,
                    children: category.children
                        ? propagateColorToChildren(category.children, nodeId, newColor)
                        : [],
                };
            }

            // Traverse the children of other nodes
            if (category.children && category.children.length > 0) {
                return {
                    ...category,
                    children: propagateColorToChildren(category.children, nodeId, newColor),
                };
            }

            return category; // Return unchanged node
        });
    };

    const handleUpdateCategoryColor = (color: string) => {
        if (selectedCategory) {
            const updatedCategories = propagateColorToChildren(categories, selectedCategory.id, color);
            setCategories(updatedCategories);
        }
    };


    function deleteLiterature(literatureToDelete: Literature) {
        if (!selectedCategory) return;

        // Filter out the selected literature
        const updatedLiterature = (selectedCategory.literature || []).filter(
            (lit) => lit.title !== literatureToDelete.title || lit.url !== literatureToDelete.url
        );

        // Create an updated category object
        const updatedCategory: Category = {
            ...selectedCategory,
            literature: updatedLiterature,
        };

        // Update the category tree and state
        const updatedCategories = updateCategoryInTree(categories, updatedCategory);
        setCategories(updatedCategories);
        setSelectedCategory(updatedCategory);

        // Save the updated category to Firebase
        try {
            const docRef = doc(db, 'categories', updatedCategory.id);
            updateDoc(docRef, { literature: updatedLiterature });
        } catch (error) {
            console.error('Error deleting literature from Firebase:', error);
        }
    }

    return (
        <div id="treeWrapper" className="w-full h-screen">
            <Tree
                data={treeData}
                orientation='horizontal'
                translate={{ x: 500, y: 300 }}
                renderCustomNodeElement={({ nodeDatum, toggleNode }) =>
                    renderCustomNodeElement({
                        nodeDatum,
                        toggleNode,
                        handleClick: () => handleNodeClick({ data: nodeDatum }),
                        handleInfoClick: () => handleInfoClick(nodeDatum),
                    })
                }
                collapsible={true}
            />
            <Modal
                isVisible={modalVisible}
                onClose={closeModal}
                category={selectedCategory}
                description={modalDescription}
                newLiterature={newLiterature}
                handleLiteratureChange={(e) => {
                    const { name, value } = e.target;
                    setNewLiterature((prev) => ({ ...prev, [name]: value }));
                }}
                attachLiterature={attachLiterature}
                deleteCategory={deleteCategory}
                categories={categories}
                updateCategory={updateCategory}
                attachLiteratureFromList={literature => addSelectedLiterature(literature)}
                deleteLiterature={deleteLiterature}
                updateCategoryColor={handleUpdateCategoryColor}
            />
        </div>
    );
};

export default TreeView;
