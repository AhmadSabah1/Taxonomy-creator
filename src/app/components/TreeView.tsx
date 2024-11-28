// TreeView.tsx

'use client';

import React, { useState } from 'react';
import Tree from 'react-d3-tree';
import Modal from './Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Category } from '@/app/models/Category';
import { Literature } from '@/app/models/Literature';

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
                fill={isParent ? '#00f' : '#ff6347'}
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
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null
    );
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

    const handleLiteratureChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setNewLiterature((prev) => ({ ...prev, [name]: value }));
    };

    const attachLiterature = () => {
        if (selectedCategory && newLiterature.url && newLiterature.title) {
            const updatedCategory = {
                ...selectedCategory,
                literature: [...(selectedCategory.literature || []), newLiterature],
            };

            const updateCategoryInTree = (
                categories: Category[],
                updatedCategory: Category
            ): Category[] => {
                return categories.map((category) => {
                    if (category.id === updatedCategory.id) {
                        return updatedCategory;
                    } else if (category.children && category.children.length > 0) {
                        return {
                            ...category,
                            children: updateCategoryInTree(
                                category.children,
                                updatedCategory
                            ),
                        };
                    }
                    return category;
                });
            };

            const updatedCategories = updateCategoryInTree(categories, updatedCategory);

            setCategories(updatedCategories);
            setSelectedCategory(updatedCategory);
            setNewLiterature({ title: '', author: '', date: '', url: '' });
        }
    };

    const deleteCategory = () => {
        if (selectedCategory) {
            const confirmDelete = window.confirm(
                `Are you sure you want to delete "${selectedCategory.name}" and all its subcategories?`
            );
            if (confirmDelete) {
                const deleteCategoryFromTree = (
                    categories: Category[],
                    categoryId: string
                ): Category[] => {
                    return categories
                        .filter((category) => category.id !== categoryId)
                        .map((category) => ({
                            ...category,
                            children: category.children
                                ? deleteCategoryFromTree(category.children, categoryId)
                                : [],
                        }));
                };

                const updatedCategories = deleteCategoryFromTree(
                    categories,
                    selectedCategory.id
                );
                setCategories(updatedCategories);
                setModalVisible(false);
            }
        }
    };

    const treeData = convertToTreeData(categories);

    if (!treeData || treeData.length === 0) {
        return <p>No categories to display</p>;
    }

    return (
        <div id="treeWrapper" className="w-full h-screen">
            <Tree
                data={treeData}
                orientation="radial"
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
                styles={{
                    nodes: {
                        node: {
                            circle: {
                                stroke: '#00f',
                                strokeWidth: 2,
                            },
                            name: {
                                stroke: '#333',
                                strokeWidth: 2,
                            },
                        },
                    },
                }}
            />
            <Modal
                isVisible={modalVisible}
                onClose={closeModal}
                category={selectedCategory}
                description={modalDescription}
                newLiterature={newLiterature}
                handleLiteratureChange={handleLiteratureChange}
                attachLiterature={attachLiterature}
                deleteCategory={deleteCategory}
            />
        </div>
    );
};

export default TreeView;
