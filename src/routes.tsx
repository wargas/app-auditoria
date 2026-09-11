import { createHashRouter } from 'react-router'
export const routes = createHashRouter([
    // {
    //     path: '/',
    //     lazy: () => import('./routes/project-home')
    // },
    // {
    //     path: '/form-project',
    //     lazy: () => import('./routes/form-projeto.router')
    // },
    {
        path: '/',
        lazy: () => import('./routes/app-layout'),
        children: [
            {
                path: '/',
                lazy: () => import('./routes/project.router'),
                children: [
                    {
                        path: '',
                        lazy: () => import('./routes/project-home'),
                        handle: {
                            title: 'Home'
                        }
                    },
                    {
                        path: 'arquivos',
                        lazy: () => import('./routes/upload-arquivos.router'),
                        handle: {
                            title: 'Arquivos'
                        }
                    },
                    {
                        path: 'apuracao',
                        lazy: () => import('./routes/apuracao.router'),
                        handle: {
                            title: 'Apuração'
                        }
                    },
                    {
                        path: 'outros-creditos',
                        lazy: () => import('./routes/outros-creditos.router'),
                        handle: {
                            title: 'Outros Créditos'
                        }
                    },
                    {
                        path: 'relatorios',
                        lazy: () => import('./routes/relatorios.router'),
                        handle: {
                            title: 'Relatórios'
                        }
                    },
                    {
                        path: 'settings',
                        lazy: () => import('./routes/settings.router'),
                        handle: {
                            title: 'Configurações'
                        }
                    },
                   
                ]
            },
            {
                path: '/consultas',
                lazy: () => import('./routes/consultas.router')
            }
        ]
    }
])