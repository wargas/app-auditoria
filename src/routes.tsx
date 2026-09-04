import { createHashRouter } from 'react-router'
export const routes = createHashRouter([
    {
        path: '/',
        lazy: () => import('./routes/projects.router')
    },
    {
        path: '/form-project',
        lazy: () => import('./routes/form-projeto.router')
    },
    {
        path: '/project/:id',
        lazy: () => import('./routes/project.router')
    },
])