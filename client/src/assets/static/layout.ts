import { TLayoutCommon, TLinks, TNavLink } from 'types/layout';
import { PAGE_URL } from 'assets/static/url';

export const LAYOUT_COMMON: TLayoutCommon = {
    names: {
        site: 'UniStudProj',
        siteShort: 'USP',
        org: 'M20A20X-ORG',
        dev: 'M20A20X'
    }
};

export const LINKS: TLinks = {
    profile: {
        href: PAGE_URL.profile,
        defaultName: 'Log In',
        loggedName: 'Profile'
    },
    root: {
        href: PAGE_URL.root,
        name: LAYOUT_COMMON.names.site
    },
    main: {
        href: PAGE_URL.main,
        name: LAYOUT_COMMON.names.site
    }
};

export const NAV_LINKS: TNavLink[] = [
    {
        href: LINKS.main.href,
        name: 'Main'
    },
    {
        href: PAGE_URL.about,
        name: 'About'
    },
    {
        href: PAGE_URL.projects,
        name: 'Projects'
    },
    {
        href: PAGE_URL.tests,
        name: 'Tests'
    },
    {
        href: PAGE_URL.news,
        name: 'News'
    },
    {
        href: PAGE_URL.metrics,
        name: 'Metrics'
    }
];
