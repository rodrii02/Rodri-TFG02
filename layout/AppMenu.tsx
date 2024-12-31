/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '@/types';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const model: AppMenuItem[] = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/home' }]
        },
        {
            label: 'UI Components',
            items: [
                { label: 'Button', icon: 'pi pi-fw pi-mobile', to: '/home/ui/button', class: 'rotated-icon' },
                { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', to: '/home/ui/charts' },
            ]
        },
        {
            label: 'Neurofeedback',
            icon: 'pi pi-fw pi-user',
            items: [
                {
                    label: 'Imagen',
                    icon: 'pi pi-fw pi-image',
                    to: '/home/ui/neurofeedback/imagen'
                },
                {
                    label: 'Video',
                    icon: 'pi pi-fw pi-video',
                    to: '/home/ui/neurofeedback/video'
                },
                {
                    label: 'Audio',
                    icon: 'pi pi-fw pi-headphones',
                    to: '/home/ui/neurofeedback/audio'
                },
                {
                    label: 'Juego bola',
                    icon: 'pi pi-fw pi-circle-fill',
                    to: '/auth/access'
                }
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
