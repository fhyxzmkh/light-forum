/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as IndexImport } from './routes/index'
import { Route as MessageIndexImport } from './routes/message/index'
import { Route as HomeIndexImport } from './routes/home/index'
import { Route as UserSettingsIndexImport } from './routes/user/settings/index'
import { Route as UserRegisterIndexImport } from './routes/user/register/index'
import { Route as UserProfileIndexImport } from './routes/user/profile/index'
import { Route as UserLoginIndexImport } from './routes/user/login/index'
import { Route as HomeDetailsPostIdImport } from './routes/home/details/$postId'

// Create/Update Routes

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const MessageIndexRoute = MessageIndexImport.update({
  id: '/message/',
  path: '/message/',
  getParentRoute: () => rootRoute,
} as any)

const HomeIndexRoute = HomeIndexImport.update({
  id: '/home/',
  path: '/home/',
  getParentRoute: () => rootRoute,
} as any)

const UserSettingsIndexRoute = UserSettingsIndexImport.update({
  id: '/user/settings/',
  path: '/user/settings/',
  getParentRoute: () => rootRoute,
} as any)

const UserRegisterIndexRoute = UserRegisterIndexImport.update({
  id: '/user/register/',
  path: '/user/register/',
  getParentRoute: () => rootRoute,
} as any)

const UserProfileIndexRoute = UserProfileIndexImport.update({
  id: '/user/profile/',
  path: '/user/profile/',
  getParentRoute: () => rootRoute,
} as any)

const UserLoginIndexRoute = UserLoginIndexImport.update({
  id: '/user/login/',
  path: '/user/login/',
  getParentRoute: () => rootRoute,
} as any)

const HomeDetailsPostIdRoute = HomeDetailsPostIdImport.update({
  id: '/home/details/$postId',
  path: '/home/details/$postId',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/home/': {
      id: '/home/'
      path: '/home'
      fullPath: '/home'
      preLoaderRoute: typeof HomeIndexImport
      parentRoute: typeof rootRoute
    }
    '/message/': {
      id: '/message/'
      path: '/message'
      fullPath: '/message'
      preLoaderRoute: typeof MessageIndexImport
      parentRoute: typeof rootRoute
    }
    '/home/details/$postId': {
      id: '/home/details/$postId'
      path: '/home/details/$postId'
      fullPath: '/home/details/$postId'
      preLoaderRoute: typeof HomeDetailsPostIdImport
      parentRoute: typeof rootRoute
    }
    '/user/login/': {
      id: '/user/login/'
      path: '/user/login'
      fullPath: '/user/login'
      preLoaderRoute: typeof UserLoginIndexImport
      parentRoute: typeof rootRoute
    }
    '/user/profile/': {
      id: '/user/profile/'
      path: '/user/profile'
      fullPath: '/user/profile'
      preLoaderRoute: typeof UserProfileIndexImport
      parentRoute: typeof rootRoute
    }
    '/user/register/': {
      id: '/user/register/'
      path: '/user/register'
      fullPath: '/user/register'
      preLoaderRoute: typeof UserRegisterIndexImport
      parentRoute: typeof rootRoute
    }
    '/user/settings/': {
      id: '/user/settings/'
      path: '/user/settings'
      fullPath: '/user/settings'
      preLoaderRoute: typeof UserSettingsIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/home': typeof HomeIndexRoute
  '/message': typeof MessageIndexRoute
  '/home/details/$postId': typeof HomeDetailsPostIdRoute
  '/user/login': typeof UserLoginIndexRoute
  '/user/profile': typeof UserProfileIndexRoute
  '/user/register': typeof UserRegisterIndexRoute
  '/user/settings': typeof UserSettingsIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/home': typeof HomeIndexRoute
  '/message': typeof MessageIndexRoute
  '/home/details/$postId': typeof HomeDetailsPostIdRoute
  '/user/login': typeof UserLoginIndexRoute
  '/user/profile': typeof UserProfileIndexRoute
  '/user/register': typeof UserRegisterIndexRoute
  '/user/settings': typeof UserSettingsIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/home/': typeof HomeIndexRoute
  '/message/': typeof MessageIndexRoute
  '/home/details/$postId': typeof HomeDetailsPostIdRoute
  '/user/login/': typeof UserLoginIndexRoute
  '/user/profile/': typeof UserProfileIndexRoute
  '/user/register/': typeof UserRegisterIndexRoute
  '/user/settings/': typeof UserSettingsIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/home'
    | '/message'
    | '/home/details/$postId'
    | '/user/login'
    | '/user/profile'
    | '/user/register'
    | '/user/settings'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/home'
    | '/message'
    | '/home/details/$postId'
    | '/user/login'
    | '/user/profile'
    | '/user/register'
    | '/user/settings'
  id:
    | '__root__'
    | '/'
    | '/home/'
    | '/message/'
    | '/home/details/$postId'
    | '/user/login/'
    | '/user/profile/'
    | '/user/register/'
    | '/user/settings/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  HomeIndexRoute: typeof HomeIndexRoute
  MessageIndexRoute: typeof MessageIndexRoute
  HomeDetailsPostIdRoute: typeof HomeDetailsPostIdRoute
  UserLoginIndexRoute: typeof UserLoginIndexRoute
  UserProfileIndexRoute: typeof UserProfileIndexRoute
  UserRegisterIndexRoute: typeof UserRegisterIndexRoute
  UserSettingsIndexRoute: typeof UserSettingsIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  HomeIndexRoute: HomeIndexRoute,
  MessageIndexRoute: MessageIndexRoute,
  HomeDetailsPostIdRoute: HomeDetailsPostIdRoute,
  UserLoginIndexRoute: UserLoginIndexRoute,
  UserProfileIndexRoute: UserProfileIndexRoute,
  UserRegisterIndexRoute: UserRegisterIndexRoute,
  UserSettingsIndexRoute: UserSettingsIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/home/",
        "/message/",
        "/home/details/$postId",
        "/user/login/",
        "/user/profile/",
        "/user/register/",
        "/user/settings/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/home/": {
      "filePath": "home/index.tsx"
    },
    "/message/": {
      "filePath": "message/index.tsx"
    },
    "/home/details/$postId": {
      "filePath": "home/details/$postId.tsx"
    },
    "/user/login/": {
      "filePath": "user/login/index.tsx"
    },
    "/user/profile/": {
      "filePath": "user/profile/index.tsx"
    },
    "/user/register/": {
      "filePath": "user/register/index.tsx"
    },
    "/user/settings/": {
      "filePath": "user/settings/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
