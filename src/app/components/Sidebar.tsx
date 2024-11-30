// components/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import { Literature } from '@/app/models/Literature';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

interface SidebarProps {
    onSelectLiterature: (literature: Literature | null) => void;
    refreshLiteratureList: () => void;
    literatureList: Literature[];
    sidebarOpen: boolean;
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({
                                             onSelectLiterature,
                                             refreshLiteratureList,
                                             literatureList,
                                             sidebarOpen,
                                             setSidebarOpen,
                                         }) => {
    const [newLiterature, setNewLiterature] = useState<Omit<Literature, 'id'>>({
        title: '',
        author: '',
        date: '',
        url: '',
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setNewLiterature((prev) => ({ ...prev, [name]: value }));
    };

    const addLiterature = async () => {
        try {
            const literatureCollection = collection(db, 'literature');
            await addDoc(literatureCollection, newLiterature);
            refreshLiteratureList(); // Refresh the literature list
            setNewLiterature({ title: '', author: '', date: '', url: '' });
        } catch (error) {
            console.error('Error adding literature:', error);
        }
    };

    const deleteLiteratureItem = async (literatureId: string) => {
        try {
            await deleteDoc(doc(db, 'literature', literatureId));
            refreshLiteratureList(); // Refresh the literature list
        } catch (error) {
            console.error('Error deleting literature:', error);
        }
    };

    return (
        <>
            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-300 ease-in-out overflow-y-auto z-40`}
            >
                <div className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Literature</h3>

                    {/* Literature Table */}
                    {literatureList.length > 0 ? (
                        <table className="min-w-full border text-sm">
                            <thead>
                            <tr>
                                <th className="px-2 py-1 border">Title</th>
                                <th className="px-2 py-1 border">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {literatureList.map((lit) => (
                                <tr
                                    key={lit.id}
                                    className="cursor-pointer hover:bg-gray-200"
                                    onClick={() => onSelectLiterature(lit)}
                                >
                                    <td className="px-2 py-1 border">{lit.title}</td>
                                    <td className="px-2 py-1 border">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteLiteratureItem(lit.id);
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No literature available.</p>
                    )}

                    {/* Deselect Literature */}
                    <button
                        onClick={() => onSelectLiterature(null)}
                        className="bg-gray-500 text-white px-4 py-2 rounded mt-4 w-full"
                    >
                        Deselect Literature
                    </button>

                    {/* Add New Literature */}
                    <div className="mt-6">
                        <h4 className="text-md font-semibold mb-2">Add New Literature</h4>
                        <input
                            type="text"
                            name="title"
                            value={newLiterature.title}
                            onChange={handleInputChange}
                            className="border p-2 rounded w-full mb-2"
                            placeholder="Title"
                            required
                        />
                        <input
                            type="text"
                            name="author"
                            value={newLiterature.author}
                            onChange={handleInputChange}
                            className="border p-2 rounded w-full mb-2"
                            placeholder="Author"
                        />
                        <input
                            type="date"
                            name="date"
                            value={newLiterature.date}
                            onChange={handleInputChange}
                            className="border p-2 rounded w-full mb-2"
                        />
                        <input
                            type="url"
                            name="url"
                            value={newLiterature.url}
                            onChange={handleInputChange}
                            className="border p-2 rounded w-full mb-2"
                            placeholder="URL"
                            required
                        />
                        <button
                            onClick={addLiterature}
                            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
                            disabled={!newLiterature.title || !newLiterature.url}
                        >
                            Add Literature
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
