import React, { FC, ReactNode } from 'react';
import { TLinks, TNavLink } from 'types/layout';

import { NavLink } from 'react-router-dom';
import cn from 'classnames';

import s from './Navigation.module.scss';

type TLinkElem = { href: string; children: ReactNode };

interface NavProps {
    navLinks: TNavLink[];
    profileLink: TLinks['profile'];
    isVertical?: boolean;
}

export const Navigation: FC<NavProps> = (props) => {
    const { profileLink, navLinks, isVertical } = props;

    const LinkElem = (props: TLinkElem) => (
        <NavLink to={props.href}>
            <span className={'clickable'}>{props.children}</span>
        </NavLink>
    );

    const navLinkElems = navLinks.map((link) => (
        <li key={JSON.stringify(link)}>
            <LinkElem href={link.href}>{link.name}</LinkElem>
        </li>
    ));

    return (
        <ul className={cn({ [s.navListVertical]: isVertical }, s.navList)}>
            {navLinkElems}
            <li key={JSON.stringify(profileLink)}>
                <LinkElem href={profileLink.href}>{profileLink.loggedName}</LinkElem>
            </li>
        </ul>
    );
};
