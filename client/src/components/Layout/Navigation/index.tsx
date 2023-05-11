import React, { DOMAttributes, FC, ReactNode, useContext } from 'react';
import { TLinks, TNavLink } from 'types/layout';

import { NavLink } from 'react-router-dom';
import cn from 'classnames';

import { ModalContext } from 'context/Modal.context';
import { AuthContext } from 'context/Auth.context';

import { LogInForm } from 'components/modals/login';

import s from './Navigation.module.scss';

type TLinkElem = { href: string; children: ReactNode; clickHandler?: DOMAttributes<HTMLSpanElement>['onClick'] };
const LinkElem: FC<TLinkElem> = (props) => (
    <NavLink to={props.href}>
        <span
            className={'clickable'}
            onClick={props.clickHandler}
        >
            {props.children}
        </span>
    </NavLink>
);

interface NavProps {
    navLinks: TNavLink[];
    profileLink: TLinks['profile'];
    isVertical?: boolean;
}

export const Navigation: FC<NavProps> = (props) => {
    const { profileLink, navLinks, isVertical } = props;
    const authContext = useContext(AuthContext);
    const modalContext = useContext(ModalContext);

    const getNavLinkElems = () => {
        const { href, loggedName, name } = profileLink;
        const profileLinkElem = (
            <li key={JSON.stringify(profileLink)}>
                <LinkElem
                    href={href}
                    clickHandler={(event) => {
                        if (!authContext?.isLoggedIn) {
                            event.preventDefault();
                            modalContext?.openModal(<LogInForm />, 'custom');
                        }
                    }}
                >
                    {authContext?.isLoggedIn ? loggedName : name}
                </LinkElem>
            </li>
        );
        const links = navLinks.map((link) => (
            <li key={JSON.stringify(link)}>
                <LinkElem href={link.href}>{link.name}</LinkElem>
            </li>
        ));
        return [...links, profileLinkElem];
    };

    return <ul className={cn({ [s.navListVertical]: isVertical }, s.navList)}>{getNavLinkElems()}</ul>;
};
