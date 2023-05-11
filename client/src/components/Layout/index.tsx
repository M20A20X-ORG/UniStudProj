import React, { FC, useContext, useEffect, useState } from "react";
import { TLayoutCommon, TLinks, TNavLink } from 'types/layout';

import { Link, Outlet } from 'react-router-dom';
import cn from 'classnames';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import { Navigation } from './Navigation';
import s from './Layout.module.scss';

export interface LayoutProps {
    common: TLayoutCommon;
    navLinks: TNavLink[];
    links: TLinks;
}

export const Layout: FC<LayoutProps> = (props) => {
    const { common, navLinks, links } = props;
    const { siteShort, org, dev } = common.names;

    const modalContext = useContext(ModalContext);
    const authContext = useContext(AuthContext);

    const [isMenuOpen, setMenuOpen] = useState(false);

    const btnLogoutElem = (
        <div
            className={cn('clickable', 'btn', s.btnLogout)}
            onClick={() => authContext?.logout()}
        >
            Logout
        </div>
    );
    const menuBtnElem = (
        <div
            onClick={() => setMenuOpen(!isMenuOpen)}
            className={cn('btn', 'clickable', s.btnMenu)}
        >
            <span className={s.btnMenuLines}></span>
        </div>
    );

    return (
        <>
            {modalContext?.modalElem.custom}
            {modalContext?.modalElem.message}
            <div className={s.wrapper}>
                <div className={s.container}>
                    <header className={s.header}>
                        <span className={'clickable'}>
                            <Link to={links.main.href}>{links.main.name}</Link>
                        </span>
                        <div className={s.navigation}>
                            <nav className={s.nav}>
                                <Navigation
                                    navLinks={navLinks}
                                    profileLink={links.profile}
                                />
                            </nav>
                            {isMenuOpen ? null : menuBtnElem}
                        </div>
                    </header>
                    <main className={s.main}>
                        <div className={s.content}>
                            <Outlet />
                        </div>
                    </main>
                    <footer className={s.footer}>
                        <span>
                            Made with <span className={s.heart}>♥</span> by {dev}
                        </span>
                        <span>
                            {siteShort} <span className={s.copyright}>©</span> {org}
                        </span>
                    </footer>
                </div>
                {!isMenuOpen ? null : (
                    <aside className={s.menu}>
                        <div className={s.menuHead}>{menuBtnElem}</div>
                        <div className={s.menuContainer}>
                            <div className={s.menuLinks}>
                                <Navigation
                                    navLinks={navLinks}
                                    profileLink={links.profile}
                                    isVertical
                                />
                            </div>

                            {authContext?.isLoggedIn ? btnLogoutElem : null}
                        </div>
                        <div className={s.menuFoot}>
                            <span>Contact developer:</span>
                            <a href='tel:+380681912507'>+380681912507</a>
                            <a href='mailto:maks380681912507@gmail.com'>maks0681912507@gmail.com</a>
                        </div>
                    </aside>
                )}
            </div>
        </>
    );
};
