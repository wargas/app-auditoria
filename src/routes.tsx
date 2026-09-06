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
        lazy: () => import('./routes/project.router'),
        children: [
            {
                path: '',
                lazy: () => import('./routes/project-home')
            },
            {
                path: 'arquivos',
                lazy: () => import('./routes/upload-arquivos.router')
            },
            {
                path: 'apuracao',
                lazy: () => import('./routes/apuracao.router')
            },
            {
                path: 'outros-creditos',
                lazy: () => import('./routes/outros-creditos.router')
            }
        ]
    },
])