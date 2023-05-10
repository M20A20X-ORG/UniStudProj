export type TNavLink = {
    href: string;
    name: string;
};

export type TAuthNavLink = {
    href: string;
    defaultName: string;
    loggedName: string;
};

export type TLinks = {
    root: TNavLink;
    main: TNavLink;
    profile: TAuthNavLink;
};

export type TLayoutCommon = {
    names: {
        site: string;
        siteShort: string;
        org: string;
        dev: string;
    };
};
