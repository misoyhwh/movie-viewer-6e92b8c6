import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaSearch, FaBell, FaUser, FaBars, FaTimes } from 'react-icons/fa';

const Topbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="bg-[#3366CC] text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold">
                    動画管理システム
                </Link>

                <div className="hidden md:flex space-x-4 items-center">
                    <Link href="/" className={`hover:text-[#FF9900] ${router.pathname === '/' ? 'text-[#FF9900]' : ''}`}>
                        ホーム
                    </Link>
                    <Link href="/search" className={`hover:text-[#FF9900] ${router.pathname === '/search' ? 'text-[#FF9900]' : ''}`}>
                        検索
                    </Link>
                    <Link href="/upload" className={`hover:text-[#FF9900] ${router.pathname === '/upload' ? 'text-[#FF9900]' : ''}`}>
                        アップロード
                    </Link>
                    <Link href="/reports" className={`hover:text-[#FF9900] ${router.pathname === '/reports' ? 'text-[#FF9900]' : ''}`}>
                        レポート
                    </Link>
                </div>

                <div className="flex items-center space-x-4">
                    <Link href="/notifications" className="hover:text-[#FF9900]">
                        <FaBell size={20} />
                    </Link>
                    <Link href="/profile/1" className="hover:text-[#FF9900]">
                        <FaUser size={20} />
                    </Link>
                    <button onClick={toggleMenu} className="md:hidden">
                        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden mt-4">
                    <Link href="/" className="block py-2 hover:bg-[#FF9900]">
                        ホーム
                    </Link>
                    <Link href="/search" className="block py-2 hover:bg-[#FF9900]">
                        検索
                    </Link>
                    <Link href="/upload" className="block py-2 hover:bg-[#FF9900]">
                        アップロード
                    </Link>
                    <Link href="/reports" className="block py-2 hover:bg-[#FF9900]">
                        レポート
                    </Link>
                </div>
            )}
        </nav>
    );
};

export default Topbar;